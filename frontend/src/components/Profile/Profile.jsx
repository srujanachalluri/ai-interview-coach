import { useIsMobile } from '../../hooks/useIsMobile';
import { levelProgress, BADGES } from '../../lib/gamification';
import Avatar from '../common/Avatar';

export default function Profile({ user, stats }) {
  const isMobile = useIsMobile();
  const lp = levelProgress(stats?.xp || 0);
  const owned = new Set(stats?.badges || []);

  const tiles = [
    { label: 'Current streak', value: `${stats?.streak || 0} 🔥`, color: '#fb923c' },
    { label: 'Longest streak', value: stats?.longestStreak || 0, color: '#fbbf24' },
    { label: 'Total sessions', value: stats?.totalSessions || 0, color: '#818cf8' },
    { label: 'Questions answered', value: stats?.totalQuestions || 0, color: '#4ade80' },
  ];

  return (
    <div className="fade-in">
      {/* Identity + level */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px',
        padding: isMobile ? '22px' : '28px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '18px',
        flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left',
      }}>
        <Avatar user={user} size={isMobile ? 72 : 84} style={{ border: '3px solid rgba(99,102,241,0.5)' }} />
        <div style={{ flex: 1, width: '100%' }}>
          <h2 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 800 }}>
            {user?.displayName || 'Interview Pro'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>{user?.email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <span style={{
              width: '30px', height: '30px', borderRadius: '9px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px',
            }}>{lp.level}</span>
            <span style={{ color: '#c7d2fe', fontWeight: 700 }}>Level {lp.level}</span>
            <span style={{ color: '#64748b', fontSize: '12px', marginLeft: 'auto' }}>{lp.toNext} XP to level {lp.level + 1}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', height: '8px' }}>
            <div style={{ width: `${lp.pct}%`, height: '100%', borderRadius: '8px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? '10px' : '14px', marginBottom: '28px' }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
            <p style={{ color: t.color, fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>{t.value}</p>
            <p style={{ color: '#475569', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <h3 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
        Badges · {owned.size}/{BADGES.length}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(160px,1fr))', gap: '12px' }}>
        {BADGES.map(b => {
          const earned = owned.has(b.id);
          return (
            <div key={b.id} style={{
              background: earned ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${earned ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '16px', padding: '18px', textAlign: 'center',
              opacity: earned ? 1 : 0.5,
            }}>
              <div style={{ fontSize: '34px', marginBottom: '8px', filter: earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{b.name}</p>
              <p style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.4 }}>{b.desc}</p>
              {earned && <p style={{ color: '#4ade80', fontSize: '11px', fontWeight: 700, marginTop: '8px' }}>✓ Unlocked</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
