import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function RoleSelector({ onStart }) {
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(10);
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getCategories().then(data => {
      setCategories(data.categories);
      setLoading(false);
    }).catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const canStart = selectedCategory && (selectedRole || customRole.trim());

  const handleStart = () => {
    onStart({
      category: selectedCategory,
      role: customRole.trim() || selectedRole,
      difficulty,
      count,
      context: context.trim(),
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
      <p style={{ color: '#64748b' }}>Loading categories...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ fontSize: '40px', marginBottom: '14px' }}>⚠️</p>
      <p style={{ color: '#f87171', fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>Couldn't load categories</p>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>{error}</p>
      <button onClick={() => { setError(null); setLoading(true); api.getCategories().then(d => { setCategories(d.categories); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); }); }}
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', padding: '12px 28px', color: 'white', fontWeight: 700, fontSize: '14px' }}>
        🔄 Retry
      </button>
    </div>
  );

  const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '36px' }}>
        <h2 style={{
          fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
          background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>Choose Your Interview Type</h2>
        <p style={{ color: '#64748b', fontSize: isMobile ? '14px' : '15px' }}>Select a category, role, and difficulty to get started</p>
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: isMobile ? '10px' : '14px', marginBottom: '28px',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat); setSelectedRole(''); }}
            className="hover-lift"
            style={{
              background: selectedCategory?.id === cat.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedCategory?.id === cat.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '16px', padding: isMobile ? '16px' : '20px',
              textAlign: 'left', transition: 'all 0.2s',
              boxShadow: selectedCategory?.id === cat.id ? '0 4px 20px rgba(99,102,241,0.2)' : 'none',
            }}
          >
            <div style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '10px' }}>{cat.icon}</div>
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: isMobile ? '14px' : '15px', marginBottom: '4px' }}>{cat.label}</p>
            <p style={{ color: '#475569', fontSize: '12px' }}>{cat.roles.length} roles</p>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="fade-in" style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: isMobile ? '18px' : '24px', marginBottom: '24px',
        }}>
          <h3 style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>
            {selectedCategory.icon} Configure your {selectedCategory.label} interview
          </h3>

          {/* Role Select */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Select Role</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {selectedCategory.roles.map(role => (
                <button key={role} onClick={() => setSelectedRole(role)} style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                  background: selectedRole === role ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedRole === role ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedRole === role ? '#c7d2fe' : '#64748b',
                  transition: 'all 0.15s',
                }}>{role}</button>
              ))}
            </div>
            <input
              value={customRole}
              onChange={e => { setCustomRole(e.target.value); setSelectedRole(''); }}
              placeholder="Or type a custom role (e.g. Full Stack Developer)"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                padding: '11px 14px', color: '#f1f5f9', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Settings row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ flex: 1, minWidth: isMobile ? '100%' : '160px' }}>
              <label style={labelStyle}>Difficulty</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                    background: difficulty === d ? (d === 'Easy' ? 'rgba(74,222,128,0.15)' : d === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)') : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${difficulty === d ? (d === 'Easy' ? 'rgba(74,222,128,0.4)' : d === 'Medium' ? 'rgba(251,191,36,0.4)' : 'rgba(248,113,113,0.4)') : 'rgba(255,255,255,0.08)'}`,
                    color: difficulty === d ? (d === 'Easy' ? '#4ade80' : d === 'Medium' ? '#fbbf24' : '#f87171') : '#64748b',
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
                    background: count === n ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${count === n ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: count === n ? '#c7d2fe' : '#64748b',
                    transition: 'all 0.15s',
                  }}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Resume / JD context */}
          <div>
            <button
              onClick={() => setShowContext(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)',
                borderRadius: '10px', padding: '11px 14px', color: '#a5b4fc',
                fontSize: '13px', fontWeight: '700', textAlign: 'left',
              }}
            >
              📄 {showContext ? 'Hide' : 'Tailor to my resume / job description'}
              {context.trim() && !showContext && (
                <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '12px' }}>✓ added</span>
              )}
              {!context.trim() && <span style={{ marginLeft: 'auto', color: '#475569', fontSize: '11px' }}>optional</span>}
            </button>
            {showContext && (
              <div className="fade-in" style={{ marginTop: '10px' }}>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Paste your resume or the job description here. The AI will tailor questions to the skills, projects and requirements it finds."
                  rows={6}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                    padding: '12px 14px', color: '#f1f5f9', outline: 'none',
                    resize: 'vertical', lineHeight: '1.6', minHeight: '120px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <p style={{ color: '#334155', fontSize: '11px', marginTop: '6px' }}>
                  {context.length} characters · stays private to this session
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            background: canStart ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: '16px',
            padding: isMobile ? '15px 0' : '16px 48px', fontSize: '16px', fontWeight: '700',
            color: canStart ? 'white' : '#334155',
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
