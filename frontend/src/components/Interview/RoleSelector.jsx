import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function RoleSelector({ onStart }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(data => {
      setCategories(data.categories);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const canStart = selectedCategory && (selectedRole || customRole.trim());

  const handleStart = () => {
    onStart({
      category: selectedCategory,
      role: customRole.trim() || selectedRole,
      difficulty,
      count,
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
      <p style={{ color: '#64748b' }}>Loading categories...</p>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{
          fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.4px',
          background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>Choose Your Interview Type</h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Select a category, role, and difficulty to get started</p>
      </div>

      {/* Category Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat); setSelectedRole(''); }}
            style={{
              background: selectedCategory?.id === cat.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedCategory?.id === cat.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '16px', padding: '20px',
              textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedCategory?.id === cat.id ? '0 4px 20px rgba(99,102,241,0.2)' : 'none',
            }}
            onMouseOver={e => { if (selectedCategory?.id !== cat.id) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
            onMouseOut={e => { if (selectedCategory?.id !== cat.id) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
          >
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{cat.icon}</div>
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{cat.label}</p>
            <p style={{ color: '#475569', fontSize: '12px' }}>{cat.roles.length} roles available</p>
            {selectedCategory?.id === cat.id && (
              <div style={{ marginTop: '8px', width: '20px', height: '3px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '2px' }} />
            )}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="fade-in" style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
        }}>
          <h3 style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>
            {selectedCategory.icon} Configure your {selectedCategory.label} interview
          </h3>

          {/* Role Select */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Select Role
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {selectedCategory.roles.map(role => (
                <button key={role} onClick={() => setSelectedRole(role)} style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                  background: selectedRole === role ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedRole === role ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedRole === role ? '#c7d2fe' : '#64748b',
                  cursor: 'pointer', transition: 'all 0.15s',
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
                padding: '10px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Settings row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Difficulty</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                    background: difficulty === d ? (d === 'Easy' ? 'rgba(74,222,128,0.15)' : d === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)') : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${difficulty === d ? (d === 'Easy' ? 'rgba(74,222,128,0.4)' : d === 'Medium' ? 'rgba(251,191,36,0.4)' : 'rgba(248,113,113,0.4)') : 'rgba(255,255,255,0.08)'}`,
                    color: difficulty === d ? (d === 'Easy' ? '#4ade80' : d === 'Medium' ? '#fbbf24' : '#f87171') : '#64748b',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{d}</button>
                ))}
              </div>
            </div>

            <div style={{ minWidth: '160px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Questions</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[5, 10, 15].map(n => (
                  <button key={n} onClick={() => setCount(n)} style={{
                    flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                    background: count === n ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${count === n ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: count === n ? '#c7d2fe' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>{n}</button>
                ))}
              </div>
            </div>
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
            padding: '16px 48px', fontSize: '16px', fontWeight: '700',
            color: canStart ? 'white' : '#334155',
            cursor: canStart ? 'pointer' : 'default',
            transition: 'all 0.2s',
            boxShadow: canStart ? '0 4px 24px rgba(99,102,241,0.4)' : 'none',
          }}
          onMouseOver={e => { if (canStart) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; } }}
          onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = canStart ? '0 4px 24px rgba(99,102,241,0.4)' : 'none'; }}
        >
          🚀 Start Interview Practice
        </button>
      </div>
    </div>
  );
}
