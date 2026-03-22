import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function Dashboard({ onStartNew }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'sessions'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round((sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / totalSessions) * 10) / 10
    : 0;
  const bestScore = totalSessions > 0 ? Math.max(...sessions.map(s => s.overallScore || 0)) : 0;
  const recentSessions = sessions.slice(0, 5);

  const scoreColor = (s) => s >= 8 ? '#4ade80' : s >= 6 ? '#fbbf24' : '#f87171';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div className="fade-in">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Sessions', value: totalSessions, icon: '🎯', color: '#818cf8' },
          { label: 'Avg Score', value: `${avgScore}/10`, icon: '📊', color: avgScore >= 7 ? '#4ade80' : '#fbbf24' },
          { label: 'Best Score', value: `${bestScore}/10`, icon: '🏆', color: '#fbbf24' },
          { label: 'Status', value: avgScore >= 8 ? 'Ready!' : avgScore >= 6 ? 'Getting there' : 'Keep going', icon: '💪', color: '#a5b4fc', small: true },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</p>
            <p style={{ color: stat.color, fontSize: stat.small ? '14px' : '24px', fontWeight: '800', marginBottom: '4px', lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ color: '#475569', fontSize: '12px', fontWeight: '600' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Start button */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button onClick={onStartNew} style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', borderRadius: '16px',
          padding: '16px 48px', fontSize: '16px', fontWeight: '700', color: 'white',
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
        }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.4)'; }}
        >
          🚀 Start New Interview
        </button>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            Recent Sessions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentSessions.map(session => (
              <div key={session.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{session.categoryIcon || '🎯'}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.role}
                  </p>
                  <p style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>
                    {session.categoryLabel} · {session.difficulty} · {session.createdAt?.toDate?.()?.toLocaleDateString()}
                  </p>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ color: scoreColor(session.overallScore || 0), fontSize: '18px', fontWeight: '800', lineHeight: 1 }}>
                    {session.overallScore || '–'}
                  </p>
                  <p style={{ color: '#334155', fontSize: '11px' }}>/10</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalSessions === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#334155' }}>
          <p style={{ fontSize: '40px', marginBottom: '14px' }}>🎯</p>
          <p style={{ color: '#64748b', fontWeight: '600', fontSize: '16px', marginBottom: '6px' }}>No sessions yet</p>
          <p style={{ color: '#334155', fontSize: '14px' }}>Start your first interview practice above!</p>
        </div>
      )}
    </div>
  );
}
