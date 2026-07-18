import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useIsMobile } from '../../hooks/useIsMobile';
// import { levelProgress } from '../../lib/gamification';   // MVP: level/XP off

export default function Dashboard({ onStartNew, onViewProfile, stats }) {
  const isMobile = useIsMobile();
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

  // MVP: streak/level removed.
  // const streak = stats?.streak || 0;
  // const lp = levelProgress(stats?.xp || 0);

  // Score trend: oldest → newest of the last up-to-10 sessions.
  const trend = [...sessions].slice(0, 10).reverse().map(s => s.overallScore || 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div className="fade-in">
      {/* MVP: streak + level hero strip removed for a cleaner, professional look. */}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: isMobile ? '10px' : '16px', marginBottom: '28px' }}>
        {[
          { label: 'Sessions', value: totalSessions, icon: '🎯', color: '#818cf8' },
          { label: 'Avg Score', value: `${avgScore}/10`, icon: '📊', color: avgScore >= 7 ? '#4ade80' : '#fbbf24' },
          { label: 'Best Score', value: `${bestScore}/10`, icon: '🏆', color: '#fbbf24' },
          { label: 'Status', value: avgScore >= 8 ? 'Ready!' : avgScore >= 6 ? 'Getting there' : 'Keep going', icon: '💪', color: '#a5b4fc', small: true },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: isMobile ? '16px' : '20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '8px' }}>{stat.icon}</p>
            <p style={{ color: stat.color, fontSize: stat.small ? '14px' : (isMobile ? '20px' : '24px'), fontWeight: '800', marginBottom: '4px', lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ color: '#475569', fontSize: '12px', fontWeight: '600' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Score trend chart */}
      {trend.length >= 2 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            📈 Score Trend
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '90px' }}>
            {trend.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%', maxWidth: '32px',
                  height: `${Math.max(6, (v / 10) * 100)}%`,
                  background: `linear-gradient(180deg, ${scoreColor(v)}, ${scoreColor(v)}66)`,
                  borderRadius: '6px 6px 2px 2px', transition: 'height 0.5s ease',
                }} title={`${v}/10`} />
                <span style={{ color: '#475569', fontSize: '9px', fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <button onClick={onStartNew} style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', borderRadius: '16px',
          padding: isMobile ? '15px 0' : '16px 48px', fontSize: '16px', fontWeight: '700', color: 'white',
          transition: 'all 0.2s', width: isMobile ? '100%' : 'auto',
          boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
        }}>
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
