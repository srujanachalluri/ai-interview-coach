import { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

// ── Minimal MVP: three new-grad engineering tracks. ──────────────────────────
// Each role carries its own `category` (label + icon) so the rest of the app
// (prompts, saved sessions, history) keeps working unchanged.
// To add more roles later, just extend this array.
const ROLES = [
  {
    id: 'ai',
    role: 'AI Engineer (New Grad)',
    category: { label: 'AI Engineering', icon: '🤖' },
    blurb: 'LLMs, RAG, prompt design & model deployment',
  },
  {
    id: 'ml',
    role: 'Machine Learning Engineer (New Grad)',
    category: { label: 'Machine Learning Engineering', icon: '🧠' },
    blurb: 'Modeling, features, training pipelines & evaluation',
  },
  {
    id: 'swe',
    role: 'Software Engineer (New Grad)',
    category: { label: 'Software Engineering', icon: '💻' },
    blurb: 'Data structures, systems design, APIs & problem solving',
  },
];

export default function RoleSelector({ onStart }) {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(10);

  const canStart = !!selected;

  const handleStart = () => {
    if (!selected) return;
    onStart({
      category: selected.category,
      role: selected.role,
      difficulty,
      count,
      context: '', // resume/JD tailoring — reserved for a later version
    });
  };

  const labelStyle = {
    display: 'block', color: '#475569', fontSize: '12px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
  };

  return (
    <div className="fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '36px' }}>
        <h2 style={{
          fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
          background: 'linear-gradient(135deg, #0f172a, #4f46e5)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>Choose your interview track</h2>
        <p style={{ color: '#64748b', fontSize: isMobile ? '14px' : '15px' }}>
          Mock interviews for new-grad AI, ML &amp; Software Engineering roles
        </p>
      </div>

      {/* ── Role cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '12px' : '16px', marginBottom: '28px',
      }}>
        {ROLES.map(r => {
          const active = selected?.id === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="hover-lift"
              style={{
                background: active ? 'rgba(99,102,241,0.15)' : '#ffffff',
                border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : '#e2e6ec'}`,
                borderRadius: '18px', padding: isMobile ? '20px' : '24px 20px',
                textAlign: isMobile ? 'left' : 'center', transition: 'all 0.2s',
                display: 'flex', flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center', gap: isMobile ? '14px' : '10px',
                boxShadow: active ? '0 4px 24px rgba(99,102,241,0.25)' : 'none',
              }}
            >
              <div style={{ fontSize: isMobile ? '32px' : '40px', lineHeight: 1 }}>{r.category.icon}</div>
              <div>
                <p style={{ color: '#0f172a', fontWeight: '800', fontSize: isMobile ? '15px' : '16px', marginBottom: '4px', letterSpacing: '-0.2px' }}>
                  {r.role.replace(' (New Grad)', '')}
                </p>
                <p style={{ color: active ? '#4f46e5' : '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>New grad</p>
                <p style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.45 }}>{r.blurb}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Settings: difficulty + count ── */}
      {selected && (
        <div className="fade-in" style={{
          background: '#ffffff', border: '1px solid #e2e6ec',
          borderRadius: '16px', padding: isMobile ? '18px' : '24px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: isMobile ? '100%' : '160px' }}>
              <label style={labelStyle}>Difficulty</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                    background: difficulty === d ? (d === 'Easy' ? 'rgba(74,222,128,0.15)' : d === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)') : '#f8fafc',
                    border: `1px solid ${difficulty === d ? (d === 'Easy' ? 'rgba(74,222,128,0.4)' : d === 'Medium' ? 'rgba(251,191,36,0.4)' : 'rgba(248,113,113,0.4)') : '#e2e6ec'}`,
                    color: difficulty === d ? (d === 'Easy' ? '#16a34a' : d === 'Medium' ? '#d97706' : '#dc2626') : '#64748b',
                    transition: 'all 0.15s',
                  }}>{d}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: isMobile ? '100%' : '160px' }}>
              <label style={labelStyle}>Questions</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[5, 10, 15].map(n => (
                  <button key={n} onClick={() => setCount(n)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                    background: count === n ? 'rgba(99,102,241,0.15)' : '#f8fafc',
                    border: `1px solid ${count === n ? 'rgba(99,102,241,0.4)' : '#e2e6ec'}`,
                    color: count === n ? '#4f46e5' : '#64748b',
                    transition: 'all 0.15s',
                  }}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Start ── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            background: canStart ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#eef1f5',
            border: 'none', borderRadius: '16px',
            padding: isMobile ? '15px 0' : '16px 48px', fontSize: '16px', fontWeight: '700',
            color: canStart ? 'white' : '#94a3b8',
            cursor: canStart ? 'pointer' : 'default',
            transition: 'all 0.2s', width: isMobile ? '100%' : 'auto',
            boxShadow: canStart ? '0 4px 24px rgba(99,102,241,0.4)' : 'none',
          }}
        >
          🚀 Start Interview Practice
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   COMMENTED FOR MVP — restore later to re-enable the fuller experience:
   • 6 categories fetched from the backend (api.getCategories)
   • Free-text custom role input
   • "Tailor to my resume / job description" context box
   The previous implementation lived here; see git history to restore it.
   ────────────────────────────────────────────────────────────────────────── */
