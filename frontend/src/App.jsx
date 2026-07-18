import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { auth, db } from './firebase';
import { api } from './api';
import { useIsMobile } from './hooks/useIsMobile';
// Gamification (XP / streak / level / rewards) — commented out for the minimal MVP.
// import { subscribeStats, applySessionResult } from './lib/profile';
// import { levelProgress } from './lib/gamification';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import RoleSelector from './components/Interview/RoleSelector';
import QuestionCard from './components/Interview/QuestionCard';
import Feedback from './components/Interview/Feedback';
import SessionSummary from './components/Interview/SessionSummary';
import History from './components/History/History';
// import Profile from './components/Profile/Profile';   // MVP: profile tab hidden
import Avatar from './components/common/Avatar';
import BottomNav from './components/common/BottomNav';
// import RewardModal from './components/common/RewardModal';   // MVP: rewards off

// ── Screens: 'dashboard' | 'select' | 'interview' | 'feedback' | 'summary' | 'history' | 'profile'

const progressKey = (uid) => `aic_progress_${uid}`;

export default function App() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  // const [stats, setStats] = useState(null);   // MVP: gamification stats off
  const stats = null;

  const [screen, setScreen] = useState('dashboard');

  // Interview state
  const [sessionConfig, setSessionConfig] = useState(null);   // { category, role, difficulty, count, context }
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);                  // [{question, answer, score, verdict, evaluation}]
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [summary, setSummary] = useState(null);
  // const [reward, setReward] = useState(null);   // MVP: reward modal off

  // Adaptive follow-ups (talk-to-it interviewer)
  const [followUpsOn, setFollowUpsOn] = useState(true);
  const [pendingFollowUp, setPendingFollowUp] = useState(null);  // the next follow-up question, if any
  const followUpCountRef = useRef(0);
  const MAX_FOLLOWUPS = 4;

  // Loading states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const restoredRef = useRef(false);

  // ── Auth + stats subscription ───────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // MVP: gamification stats subscription disabled.
  // useEffect(() => {
  //   if (!user) { setStats(null); return; }
  //   const unsub = subscribeStats(user.uid, setStats);
  //   return unsub;
  // }, [user]);

  // ── Restore an in-progress interview after login (once) ──────────────────────
  useEffect(() => {
    if (!user || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(progressKey(user.uid));
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.questions?.length && (saved.screen === 'interview' || saved.screen === 'feedback')) {
        setSessionConfig(saved.sessionConfig);
        setQuestions(saved.questions);
        setAnswers(saved.answers || []);
        setCurrentIndex(saved.currentIndex || 0);
        setScreen('interview'); // resume on the current question
        toast('Resumed your in-progress interview', { icon: '↩️' });
      }
    } catch { /* ignore corrupt state */ }
  }, [user]);

  // ── Persist in-progress interview ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const inProgress = (screen === 'interview' || screen === 'feedback') && questions.length > 0;
    try {
      if (inProgress) {
        localStorage.setItem(progressKey(user.uid), JSON.stringify({
          sessionConfig, questions, answers, currentIndex, screen,
        }));
      }
    } catch { /* quota / private mode — non-fatal */ }
  }, [user, screen, questions, answers, currentIndex, sessionConfig]);

  const clearProgress = () => {
    if (user) { try { localStorage.removeItem(progressKey(user.uid)); } catch { /* noop */ } }
  };

  // ── Start interview ─────────────────────────────────────────────────────────
  const handleStart = async (config) => {
    setLoadingQuestions(true);
    setSessionConfig(config);
    setAnswers([]);
    setCurrentIndex(0);
    setCurrentEvaluation(null);
    setSummary(null);
    setPendingFollowUp(null);
    followUpCountRef.current = 0;

    try {
      const data = await api.getQuestions(
        config.role,
        config.category.label,
        config.difficulty,
        config.count,
        config.context || ''
      );
      setQuestions(data.questions);
      setScreen('interview');
      toast.success(`${data.questions.length} questions ready!`);
    } catch (err) {
      toast.error(err.message);
    }
    setLoadingQuestions(false);
  };

  // ── Submit answer ───────────────────────────────────────────────────────────
  const handleSubmitAnswer = async (answer) => {
    setLoadingEval(true);
    setPendingFollowUp(null);
    const question = questions[currentIndex];

    try {
      const data = await api.evaluate(
        question.question,
        answer,
        sessionConfig.role,
        sessionConfig.category.label
      );

      const evalResult = data.evaluation;
      setCurrentEvaluation(evalResult);

      setAnswers(prev => [...prev, {
        question: question.question,
        answer,
        score: evalResult.score,
        verdict: evalResult.verdict,
        evaluation: evalResult,
      }]);
      setScreen('feedback');

      // Adaptive follow-up: let the interviewer decide whether to dig deeper.
      // Fire-and-forget — a failure or slow reply must never block the flow.
      const canFollowUp =
        followUpsOn &&
        question.type !== 'follow-up' &&
        followUpCountRef.current < MAX_FOLLOWUPS;
      if (canFollowUp) {
        api.followup(question.question, answer, sessionConfig.role, sessionConfig.category.label)
          .then(res => {
            if (res?.should_followup && res?.followup) setPendingFollowUp(res.followup);
          })
          .catch(() => { /* silent — follow-ups are best-effort */ });
      }
    } catch (err) {
      toast.error(err.message);
    }
    setLoadingEval(false);
  };

  // ── Next question ───────────────────────────────────────────────────────────
  const handleNext = () => {
    // If the interviewer has a follow-up queued, insert it as the next question.
    if (pendingFollowUp) {
      const fu = {
        id: `fu-${Date.now()}`,
        question: pendingFollowUp,
        type: 'follow-up',
        hint: 'This builds on your last answer — be specific and concrete.',
      };
      followUpCountRef.current += 1;
      setPendingFollowUp(null);
      setQuestions(prev => {
        const next = [...prev];
        next.splice(currentIndex + 1, 0, fu);
        return next;
      });
      setCurrentIndex(prev => prev + 1);
      setCurrentEvaluation(null);
      setScreen('interview');
      return;
    }

    if (currentIndex >= questions.length - 1) {
      handleFinish();
    } else {
      setCurrentIndex(prev => prev + 1);
      setCurrentEvaluation(null);
      setScreen('interview');
    }
  };

  // ── Finish session ──────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setLoadingSummary(true);
    setScreen('summary');
    const finishedAnswers = answers;

    try {
      const data = await api.getSummary(
        sessionConfig.role,
        sessionConfig.category.label,
        finishedAnswers
      );
      const summaryData = data.summary;
      setSummary(summaryData);

      // Save full session (answers include full evaluation for history detail).
      await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        role: sessionConfig.role,
        categoryLabel: sessionConfig.category.label,
        categoryIcon: sessionConfig.category.icon,
        difficulty: sessionConfig.difficulty,
        totalQuestions: questions.length,
        answers: finishedAnswers.map(a => ({
          question: a.question,
          answer: a.answer,
          score: a.score,
          verdict: a.verdict,
          evaluation: a.evaluation || null,
        })),
        overallScore: summaryData.overall_score,
        performanceLevel: summaryData.performance_level,
        summary: summaryData,
        createdAt: serverTimestamp(),
      });

      // MVP: gamification (XP / streak / badges / reward modal) disabled.
      // const scores = finishedAnswers.map(a => a.score || 0);
      // const avgScore = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0;
      // const result = await applySessionResult(user.uid, {
      //   questions: questions.length,
      //   avgScore,
      //   difficulty: sessionConfig.difficulty,
      //   categoryLabel: sessionConfig.category.label,
      //   hadPerfect: scores.some(s => s >= 10),
      // });
      // setReward(result);
      clearProgress();
    } catch (err) {
      toast.error('Failed to generate summary: ' + err.message);
    }
    setLoadingSummary(false);
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    clearProgress();
    setScreen('dashboard');
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setCurrentEvaluation(null);
    setSummary(null);
    setSessionConfig(null);
    setPendingFollowUp(null);
    followUpCountRef.current = 0;
  };

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
      <p style={{ color: '#64748b', fontSize: '14px' }}>Loading...</p>
    </div>
  );

  if (!user) return <Login />;

  // const lp = levelProgress(stats?.xp || 0);   // MVP: level/XP off
  const desktopTabs = [
    { id: 'dashboard', label: '🏠 Home' },
    { id: 'select', label: '🎯 Practice' },
    { id: 'history', label: '📚 History' },
    // { id: 'profile', label: '🏆 Profile' },   // MVP: profile tab hidden
  ];
  const showNav = ['dashboard', 'select', 'history'].includes(screen);

  return (
    <div style={{ minHeight: '100vh', background: '#f6f7f9' }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#ffffff', color: '#0f172a', border: '1px solid #dfe3ea' }
      }} />

      {/* MVP: reward modal disabled */}
      {/* {reward && <RewardModal reward={reward} onClose={() => setReward(null)} />} */}

      {/* ── Top bar ── */}
      <nav style={{
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #eef1f5',
        padding: isMobile ? '0 16px' : '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
        height: '58px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🎯</span>
          {!isMobile && (
            <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }}>
              AI Interview Coach
            </span>
          )}
        </div>

        {/* Desktop tabs */}
        {!isMobile && showNav && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {desktopTabs.map(tab => (
              <button key={tab.id} onClick={() => setScreen(tab.id)} style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                background: screen === tab.id ? 'rgba(99,102,241,0.2)' : 'none',
                border: `1px solid ${screen === tab.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                color: screen === tab.id ? '#4f46e5' : '#64748b',
                transition: 'all 0.2s',
              }}>{tab.label}</button>
            ))}
          </div>
        )}

        {/* Right side: avatar + sign out (streak/level chips removed for MVP) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
          <div style={{ display: 'flex' }}>
            <Avatar user={user} size={30} />
          </div>
          {!isMobile && (
            <button onClick={() => signOut(auth)} style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#dc2626', borderRadius: '8px', padding: '6px 12px',
              fontSize: '12px', fontWeight: '600',
            }}>Sign out</button>
          )}
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div
        className={isMobile && showNav ? 'app-main has-bottom-nav' : 'app-main'}
        style={{ padding: isMobile ? '24px 16px' : '36px 24px' }}
      >
        {/* Loading questions overlay */}
        {loadingQuestions && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '3px', margin: '0 auto 20px' }} />
            <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
              Generating your questions...
            </p>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              AI is creating {sessionConfig?.count} {sessionConfig?.difficulty} questions for {sessionConfig?.role}
            </p>
          </div>
        )}

        {/* Loading summary overlay */}
        {loadingSummary && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '3px', margin: '0 auto 20px' }} />
            <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
              Analyzing your performance...
            </p>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              AI is generating your session summary and recommendations
            </p>
          </div>
        )}

        {/* Dashboard */}
        {screen === 'dashboard' && !loadingQuestions && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: '800', letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #0f172a, #4f46e5)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '6px',
              }}>
                Welcome back, {user.displayName?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Practice makes perfect — let's ace that interview
              </p>
            </div>
            <Dashboard onStartNew={() => setScreen('select')} onViewProfile={() => setScreen('profile')} stats={stats} />
          </>
        )}

        {/* Role Selector */}
        {screen === 'select' && !loadingQuestions && (
          <RoleSelector onStart={handleStart} />
        )}

        {/* Interview Question */}
        {screen === 'interview' && questions.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? '20px' : '28px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '20px' }}>{sessionConfig?.category?.icon}</span>
              <span style={{ color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                {sessionConfig?.role}
              </span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{
                color: sessionConfig?.difficulty === 'Easy' ? '#16a34a' : sessionConfig?.difficulty === 'Medium' ? '#d97706' : '#dc2626',
                fontSize: '13px', fontWeight: '700',
              }}>{sessionConfig?.difficulty}</span>
              <button
                onClick={() => setFollowUpsOn(v => !v)}
                title="When on, the interviewer asks adaptive follow-up questions based on your answers"
                style={{
                  marginLeft: 'auto', background: followUpsOn ? 'rgba(168,85,247,0.12)' : 'none',
                  border: `1px solid ${followUpsOn ? 'rgba(168,85,247,0.35)' : '#e2e6ec'}`,
                  color: followUpsOn ? '#d8b4fe' : '#64748b', borderRadius: '8px',
                  padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                }}
              >🎙 Follow-ups {followUpsOn ? 'On' : 'Off'}</button>
              <button
                onClick={() => { if (window.confirm('Exit interview? Progress will be lost.')) reset(); }}
                style={{
                  background: 'none',
                  border: '1px solid #e2e6ec',
                  color: '#64748b', borderRadius: '8px',
                  padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                }}
              >✕ Exit</button>
            </div>

            <QuestionCard
              question={questions[currentIndex]}
              index={currentIndex}
              total={questions.length}
              onSubmit={handleSubmitAnswer}
              loading={loadingEval}
              difficulty={sessionConfig?.difficulty}
            />
          </>
        )}

        {/* Feedback */}
        {screen === 'feedback' && currentEvaluation && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? '20px' : '28px' }}>
              <span style={{ color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                Feedback for Question {currentIndex + 1}
              </span>
            </div>
            <Feedback
              evaluation={currentEvaluation}
              question={questions[currentIndex]}
              onNext={handleNext}
              isLast={currentIndex >= questions.length - 1 && !pendingFollowUp}
              hasFollowUp={!!pendingFollowUp}
            />
          </>
        )}

        {/* Summary */}
        {screen === 'summary' && summary && !loadingSummary && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
                background: 'linear-gradient(135deg, #0f172a, #4f46e5)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Session Complete! 🎉</h2>
            </div>
            <SessionSummary
              summary={summary}
              sessionData={{ answers, category: sessionConfig?.category, role: sessionConfig?.role }}
              onRestart={() => setScreen('select')}
              onHome={reset}
            />
          </>
        )}

        {/* History */}
        {screen === 'history' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
                background: 'linear-gradient(135deg, #0f172a, #4f46e5)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '6px',
              }}>Practice History</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>All your past interview sessions</p>
            </div>
            <div style={{
              background: '#ffffff', border: '1px solid #e6e9ef',
              borderRadius: '16px', padding: isMobile ? '14px' : '24px',
            }}>
              <History onLoad={(session) => {
                toast.success('Session loaded');
                setSummary(session.summary);
                setAnswers(session.answers || []);
                setSessionConfig({
                  role: session.role,
                  category: { label: session.categoryLabel, icon: session.categoryIcon },
                  difficulty: session.difficulty,
                });
                setScreen('summary');
              }} />
            </div>
          </>
        )}

        {/* Profile — hidden for MVP (gamification off). Restore with the import above.
        {screen === 'profile' && (
          <>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{
                fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
                background: 'linear-gradient(135deg, #0f172a, #4f46e5)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Your Profile</h2>
              <button onClick={() => signOut(auth)} style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                color: '#dc2626', borderRadius: '8px', padding: '8px 14px',
                fontSize: '12px', fontWeight: '600',
              }}>Sign out</button>
            </div>
            <Profile user={user} stats={stats} />
          </>
        )}
        */}
      </div>

      {/* ── Mobile bottom nav ── */}
      {isMobile && showNav && (
        <BottomNav screen={screen} onNavigate={setScreen} />
      )}
    </div>
  );
}
