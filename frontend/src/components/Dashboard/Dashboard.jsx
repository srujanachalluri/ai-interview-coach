import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useIsMobile } from '../../hooks/useIsMobile';
import { levelProgress } from '../../lib/gamification';

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

  const streak = stats?.streak || 0;
  const lp = levelProgress(stats?.xp || 0);

  // Score trend: oldest → newest of the last up-to-10 sessions.
  const trend = [...sessions].slice(0, 10).reverse().map(s => s.overallScore || 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
    </div>
  );

  return (
    <div className="fade-in">
      {/* Streak + Level hero strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.4fr',
        gap: '14px', marginBottom: '20px',
      }}>
        {/* Streak */}
        <div
          onClick={onViewProfile}
          style={{
            background: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(248,113,113,0.1))',
            border: '1px solid rgba(251,146,60,0.25)', borderRadius: '18px',
            padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '40px' }}><span className="flame">🔥</span></div>
          <div>
            <p style={{ color: '#fb923c', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{streak}</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
              day streak{streak > 0 ? ' — keep it alive!' : ' — start today'}
            </p>
          </div>
        </div>

        {/* Level + XP */}
        <div
          onClick={onViewProfile}
          style={{
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '18px', padding: '20px', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '14px',
              }}>{lp.level}</span>
              <span style={{ color: '#c7d2fe', fontWeight: 700, fontSize: '15px' }}>Level {lp.level}</span>
            </div>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>{lp.toNext} XP to next</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', height: '8px' }}>
            <div style={{
              width: `${lp.pct}%`, height: '100%', borderRadius: '8px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>
            {(stats?.xp || 0).toLocaleString()} total XP
          </p>
        </div>
      </div>

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
