import { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function Feedback({ evaluation, question, onNext, isLast }) {
  const isMobile = useIsMobile();
  const [showModel, setShowModel] = useState(false);
  const { score, verdict, feedback, strengths, improvements, model_answer, keywords_mentioned, keywords_missed } = evaluation;

  const scoreColor = score >= 8 ? '#4ade80' : score >= 6 ? '#fbbf24' : score >= 4 ? '#f97316' : '#f87171';
  const verdictBg = score >= 8 ? 'rgba(74,222,128,0.1)' : score >= 6 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';
  const verdictBorder = score >= 8 ? 'rgba(74,222,128,0.3)' : score >= 6 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)';

  return (
    <div className="fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* Score header */}
      <div style={{
        background: verdictBg, border: `1px solid ${verdictBorder}`,
        borderRadius: '16px', padding: isMobile ? '18px' : '24px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: isMobile ? '14px' : '20px',
        flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left',
      }}>
        {/* Score circle */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
          background: `conic-gradient(${scoreColor} ${score * 36}deg, rgba(255,255,255,0.06) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 24px ${scoreColor}40`,
        }}>
          <div style={{
            width: '62px', height: '62px', borderRadius: '50%', background: '#0f0f1e',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: scoreColor, fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>{score}</span>
            <span style={{ color: '#475569', fontSize: '10px', fontWeight: '600' }}>/10</span>
          </div>
        </div>

        <div>
          <p style={{ color: scoreColor, fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>{verdict}</p>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>{feedback}</p>
        </div>
      </div>

      {/* Two column: strengths + improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '14px', padding: '18px',
        }}>
          <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ✅ Strengths
          </p>
          {(strengths || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#4ade80', flexShrink: 0, marginTop: '2px' }}>•</span>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{s}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '14px', padding: '18px',
        }}>
          <p style={{ color: '#f87171', fontWeight: '700', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            📈 Improve
          </p>
          {(improvements || []).map((imp, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }}>•</span>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{imp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px', padding: '18px', marginBottom: '20px',
      }}>
        <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          🔑 Keywords
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {(keywords_mentioned || []).map(k => (
            <span key={k} style={{
              background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
              color: '#4ade80', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
            }}>✓ {k}</span>
          ))}
          {(keywords_missed || []).map(k => (
            <span key={k} style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
            }}>✗ {k}</span>
          ))}
        </div>
        <p style={{ color: '#334155', fontSize: '11px' }}>Green = mentioned · Red = missed</p>
      </div>

      {/* Model Answer */}
      <div style={{
        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '14px', padding: '18px', marginBottom: '24px',
      }}>
        <button
          onClick={() => setShowModel(!showModel)}
          style={{
            background: 'none', border: 'none', color: '#818cf8',
            fontWeight: '700', fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left',
          }}
        >
          🎯 {showModel ? 'Hide' : 'Show'} Model Answer
          <span style={{ color: '#475569', fontSize: '12px', marginLeft: 'auto' }}>
            {showModel ? '▲' : '▼'}
          </span>
        </button>
        {showModel && (
          <p className="fade-in" style={{
            color: '#94a3b8', fontSize: '14px', lineHeight: '1.7',
            marginTop: '14px', paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {model_answer}
          </p>
        )}
      </div>

      {/* Next button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={onNext} style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', borderRadius: '14px',
          padding: '14px 40px', fontSize: '15px', fontWeight: '700', color: 'white',
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
        }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'none'; }}
        >
          {isLast ? '🏁 See Final Results' : '→ Next Question'}
        </button>
      </div>
    </div>
  );
}
