import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebase';

export default function Login() {
  const signIn = () => signInWithPopup(auth, provider);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#080812', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div className="fade-in" style={{
        textAlign: 'center', padding: '52px 48px',
        background: 'rgba(255,255,255,0.03)', borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)', maxWidth: '460px', width: '90%',
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', margin: '0 auto 24px',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}>🎯</div>

        <h1 style={{
          fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px',
          background: 'linear-gradient(135deg, #fff, #a5b4fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>AI Interview Coach</h1>

        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '10px', fontWeight: '500' }}>
          Practice interviews with AI — speak or type your answers and get instant, honest feedback
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '36px', flexWrap: 'wrap' }}>
          {['🎙 Voice answers', '🤖 AI Feedback', '🔥 Daily streaks', '📄 Resume-tailored', '📊 Progress'].map(f => (
            <span key={f} style={{
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '20px', padding: '4px 12px', fontSize: '12px',
              color: '#a5b4fc', fontWeight: '600',
            }}>{f}</span>
          ))}
        </div>

        <button onClick={signIn} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'white', color: '#0f0f1a', border: 'none',
          padding: '15px 32px', borderRadius: '14px',
          fontSize: '15px', fontWeight: '700', margin: '0 auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
