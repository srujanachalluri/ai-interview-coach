import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { auth, db } from './firebase';
import { api } from './api';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import RoleSelector from './components/Interview/RoleSelector';
import QuestionCard from './components/Interview/QuestionCard';
import Feedback from './components/Interview/Feedback';
import SessionSummary from './components/Interview/SessionSummary';
import History from './components/History/History';

// ── Screens ───────────────────────────────────────────────────────────────────
// 'dashboard' | 'select' | 'interview' | 'feedback' | 'summary' | 'history'

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Screen state
  const [screen, setScreen] = useState('dashboard');

  // Interview state
  const [sessionConfig, setSessionConfig] = useState(null);   // { category, role, difficulty, count }
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);                  // [{question, answer, score, evaluation}]
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [summary, setSummary] = useState(null);

  // Loading states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Start interview ─────────────────────────────────────────────────────────
  const handleStart = async (config) => {
    setLoadingQuestions(true);
    setSessionConfig(config);
    setAnswers([]);
    setCurrentIndex(0);
    setCurrentEvaluation(null);
    setSummary(null);

    try {
      const data = await api.getQuestions(
        config.role,
        config.category.label,
        config.difficulty,
        config.count
      );
      setQuestions(data.questions);
      setScreen('interview');
      toast.success(`${data.questions.length} questions ready!`);
    } catch (err) {
      toast.error('Failed to load questions: ' + err.message);
    }
    setLoadingQuestions(false);
  };

  // ── Submit answer ───────────────────────────────────────────────────────────
  const handleSubmitAnswer = async (answer) => {
    setLoadingEval(true);
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

      const newAnswer = {
        question: question.question,
        answer,
        score: evalResult.score,
        verdict: evalResult.verdict,
        evaluation: evalResult,
      };

      setAnswers(prev => [...prev, newAnswer]);
      setScreen('feedback');

    } catch (err) {
      toast.error('Evaluation failed: ' + err.message);
    }
    setLoadingEval(false);
  };

  // ── Next question ───────────────────────────────────────────────────────────
  const handleNext = () => {
    const isLast = currentIndex >= questions.length - 1;

    if (isLast) {
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

    try {
      const data = await api.getSummary(
        sessionConfig.role,
        sessionConfig.category.label,
        answers
      );

      const summaryData = data.summary;
      setSummary(summaryData);

      // Save to Firebase
      await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        role: sessionConfig.role,
        categoryLabel: sessionConfig.category.label,
        categoryIcon: sessionConfig.category.icon,
        difficulty: sessionConfig.difficulty,
        totalQuestions: questions.length,
        answers: answers.map(a => ({
          question: a.question,
          answer: a.answer,
          score: a.score,
          verdict: a.verdict,
        })),
        overallScore: summaryData.overall_score,
        performanceLevel: summaryData.performance_level,
        summary: summaryData,
        createdAt: serverTimestamp(),
      });

      toast.success('Session saved!');
    } catch (err) {
      toast.error('Failed to generate summary: ' + err.message);
    }
    setLoadingSummary(false);
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setScreen('dashboard');
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setCurrentEvaluation(null);
    setSummary(null);
    setSessionConfig(null);
  };

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
      <p style={{ color: '#475569', fontSize: '14px' }}>Loading...</p>
    </div>
  );

  if (!user) return <Login />;

  // ── Tab labels ──────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'dashboard', label: '🏠 Home' },
    { id: 'select', label: '🎯 Practice' },
    { id: 'history', label: '📚 History' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080812' }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1e32', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      {/* ── Navbar ── */}
      <nav style={{
        background: 'rgba(8,8,18,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
        height: '60px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🎯</span>
          <span style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }}>
            AI Interview Coach
          </span>
        </div>

        {/* Tabs — only show on main screens */}
        {['dashboard', 'select', 'history'].includes(screen) && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setScreen(tab.id)} style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                background: screen === tab.id ? 'rgba(99,102,241,0.2)' : 'none',
                border: `1px solid ${screen === tab.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                color: screen === tab.id ? '#c7d2fe' : '#64748b',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{tab.label}</button>
            ))}
          </div>
        )}

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={user.photoURL} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)' }} alt="" />
          <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
            {user.displayName?.split(' ')[0]}
          </span>
          <button onClick={() => signOut(auth)} style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
            color: '#f87171', borderRadius: '8px', padding: '6px 12px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>Sign out</button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px' }}>

        {/* Loading questions overlay */}
        {loadingQuestions && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '3px', margin: '0 auto 20px' }} />
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
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
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
              Analyzing your performance...
            </p>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              AI is generating your session summary and recommendations
            </p>
          </div>
        )}

        {/* ── Dashboard ── */}
        {screen === 'dashboard' && !loadingQuestions && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{
                fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '6px',
              }}>
                Welcome back, {user.displayName?.split(' ')[0]}! 👋
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Practice makes perfect — let's ace that interview
              </p>
            </div>
            <Dashboard onStartNew={() => setScreen('select')} />
          </>
        )}

        {/* ── Role Selector ── */}
        {screen === 'select' && !loadingQuestions && (
          <RoleSelector onStart={handleStart} />
        )}

        {/* ── Interview Question ── */}
        {screen === 'interview' && questions.length > 0 && (
          <>
            {/* Session info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '28px', flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '20px' }}>{sessionConfig?.category?.icon}</span>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                {sessionConfig?.role}
              </span>
              <span style={{ color: '#334155' }}>•</span>
              <span style={{
                color: sessionConfig?.difficulty === 'Easy' ? '#4ade80' : sessionConfig?.difficulty === 'Medium' ? '#fbbf24' : '#f87171',
                fontSize: '13px', fontWeight: '700',
              }}>{sessionConfig?.difficulty}</span>
              <button
                onClick={() => { if (window.confirm('Exit interview? Progress will be lost.')) reset(); }}
                style={{
                  marginLeft: 'auto', background: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#475569', borderRadius: '8px',
                  padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                }}
              >✕ Exit</button>
            </div>

            <QuestionCard
              question={questions[currentIndex]}
              index={currentIndex}
              total={questions.length}
              onSubmit={handleSubmitAnswer}
              loading={loadingEval}
            />
          </>
        )}

        {/* ── Feedback ── */}
        {screen === 'feedback' && currentEvaluation && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                Feedback for Question {currentIndex + 1}
              </span>
            </div>
            <Feedback
              evaluation={currentEvaluation}
              question={questions[currentIndex]}
              onNext={handleNext}
              isLast={currentIndex >= questions.length - 1}
            />
          </>
        )}

        {/* ── Summary ── */}
        {screen === 'summary' && summary && !loadingSummary && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
                background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Session Complete! 🎉</h2>
            </div>
            <SessionSummary
              summary={summary}
              sessionData={{ answers, category: sessionConfig?.category }}
              onRestart={() => setScreen('select')}
              onHome={reset}
            />
          </>
        )}

        {/* ── History ── */}
        {screen === 'history' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{
                fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
                background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '6px',
              }}>Practice History</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>All your past interview sessions</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '24px',
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
      </div>
    </div>
  );
}
