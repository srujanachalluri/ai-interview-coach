import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebase';
import { useIsMobile } from '../../hooks/useIsMobile';

// Public marketing page shown to logged-out visitors — explains the product and
// lets them try it, instead of dropping them straight onto a Google login wall.

const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const ROLES = [
  { icon: '🤖', title: 'AI Engineer', blurb: 'LLMs, RAG, prompt design & model deployment' },
  { icon: '🧠', title: 'ML Engineer', blurb: 'Modeling, features, training pipelines & evaluation' },
  { icon: '💻', title: 'Software Engineer', blurb: 'Data structures, systems design, APIs & problem solving' },
];

const FEATURES = [
  { icon: '🎙', title: 'Answer by voice', desc: 'Speak your answers aloud — the interviewer reads questions to you and transcribes your response.' },
  { icon: '🤖', title: 'Instant AI feedback', desc: 'Every answer scored 1–10 with strengths, gaps, and the keywords you missed.' },
  { icon: '↳', title: 'Adaptive follow-ups', desc: 'The interviewer digs deeper based on your answers — just like a real one.' },
  { icon: '📝', title: 'Model answers', desc: 'See a strong example answer after every question so you know what "great" looks like.' },
  { icon: '📊', title: 'Track your progress', desc: 'Session history and a score trend so you can see yourself improving over time.' },
  { icon: '📄', title: 'Session reports', desc: 'Download a full PDF report of any session to review offline.' },
];

const STEPS = [
  { n: '1', title: 'Pick your track', desc: 'Choose AI, ML, or Software Engineering, plus difficulty and length.' },
  { n: '2', title: 'Answer by voice or text', desc: 'The AI interviewer asks real questions and adaptive follow-ups.' },
  { n: '3', title: 'Get scored feedback', desc: 'Instant scoring, strengths, gaps, and a model answer — then a session summary.' },
];

export default function Landing() {
  const isMobile = useIsMobile();
  const signIn = () => signInWithPopup(auth, provider).catch(() => {});

  const SignInBtn = ({ big }) => (
    <button
      onClick={signIn}
      className="hover-lift"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        background: '#fff', color: '#0f172a', border: '1px solid #e2e6ec',
        padding: big ? '15px 30px' : '9px 18px', borderRadius: '12px',
        fontSize: big ? '15px' : '14px', fontWeight: '700',
        boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
      }}
    >
      <GoogleIcon size={big ? 20 : 18} />
      {big ? 'Continue with Google' : 'Sign in'}
    </button>
  );

  const section = { maxWidth: '1080px', margin: '0 auto', padding: '0 24px' };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e6ec',
      }}>
        <div style={{ ...section, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🎯</span>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px', color: '#0f172a' }}>AI Interview Coach</span>
          </div>
          <SignInBtn />
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center', padding: isMobile ? '56px 24px 40px' : '84px 24px 56px',
        background: 'radial-gradient(60% 60% at 50% 0%, #eef1ff 0%, rgba(238,241,255,0) 65%)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '100px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, color: '#4f46e5',
        }}>
          🎙 Voice-powered mock interviews
        </div>
        <h1 style={{
          fontSize: isMobile ? '2.2rem' : '3.4rem', fontWeight: 800, letterSpacing: '-1.2px',
          lineHeight: 1.08, color: '#0f172a', maxWidth: '16ch', margin: '0 auto 18px',
        }}>
          Practice interviews.{' '}
          <span style={{ background: 'linear-gradient(120deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Get hired.
          </span>
        </h1>
        <p style={{ fontSize: isMobile ? '16px' : '19px', color: '#475569', maxWidth: '620px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          AI mock interviews for new-grad <strong style={{ color: '#0f172a' }}>AI, ML &amp; Software Engineering</strong> roles.
          Answer by voice, get instant scored feedback, and walk in ready.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <SignInBtn big />
          <a href="#how" style={{
            display: 'inline-flex', alignItems: 'center', padding: '15px 26px', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700, color: '#4f46e5',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
          }}>See how it works ↓</a>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '18px' }}>Free · No credit card · Sign in with Google to start</p>
      </section>

      {/* ── Roles ── */}
      <section style={{ ...section, padding: isMobile ? '32px 24px' : '48px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: isMobile ? '1.4rem' : '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          Built for the role you're chasing
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '28px' }}>Three new-grad engineering tracks, with more coming soon.</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {ROLES.map(r => (
            <div key={r.title} className="hover-lift" style={{
              background: '#fff', border: '1px solid #e2e6ec', borderRadius: '18px',
              padding: '26px 22px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{r.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{r.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{r.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ ...section, padding: isMobile ? '32px 24px' : '48px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: isMobile ? '1.4rem' : '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '28px', letterSpacing: '-0.4px' }}>
          Everything you need to prep
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: '#fff', border: '1px solid #e2e6ec', borderRadius: '16px', padding: '22px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', marginBottom: '14px',
                background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ ...section, padding: isMobile ? '32px 24px' : '48px 24px', scrollMarginTop: '70px' }}>
        <h2 style={{ textAlign: 'center', fontSize: isMobile ? '1.4rem' : '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '28px', letterSpacing: '-0.4px' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '16px', padding: '24px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px', marginBottom: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px',
              }}>{s.n}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sample preview ── */}
      <section style={{ ...section, padding: isMobile ? '32px 24px' : '48px 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' }}>
          <div style={{ padding: isMobile ? '22px' : '30px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4f46e5' }}>A quick taste</span>
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', padding: '18px', margin: '14px 0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', marginBottom: '6px' }}>🎙 AI INTERVIEWER · ML ENGINEER</p>
              <p style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>
                “Explain the bias–variance tradeoff, and how you'd diagnose whether a model is underfitting or overfitting.”
              </p>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%', flexShrink: 0,
                background: 'conic-gradient(#16a34a 288deg, #eef1f5 0deg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#16a34a', fontSize: '15px', fontWeight: 800, lineHeight: 1 }}>8</span>
                  <span style={{ color: '#64748b', fontSize: '9px' }}>/10</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: 700, marginBottom: '4px' }}>Strong answer</p>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.55 }}>
                  <strong style={{ color: '#0f172a' }}>Strengths:</strong> clear definition, mentioned validation curves.{' '}
                  <strong style={{ color: '#0f172a' }}>To improve:</strong> add a concrete regularization example.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ ...section, padding: isMobile ? '20px 24px 56px' : '32px 24px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '24px',
          padding: isMobile ? '36px 24px' : '56px', textAlign: 'center',
          boxShadow: '0 20px 50px rgba(99,102,241,0.3)',
        }}>
          <h2 style={{ fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '10px', letterSpacing: '-0.6px' }}>
            Ready to practice?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '26px' }}>
            Sign in and run your first mock interview in under a minute.
          </p>
          <SignInBtn big />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #e2e6ec', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
          © {new Date().getFullYear()} AI Interview Coach · Built by Srujana Challuri
        </p>
      </footer>
    </div>
  );
}
