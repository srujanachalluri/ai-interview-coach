import Confetti from './Confetti';
import { getBadge } from '../../lib/gamification';

/**
 * Celebratory modal shown after a session: XP gained, streak, level-ups, badges.
 * `reward` is the object returned by applySessionResult().
 */
export default function RewardModal({ reward, onClose }) {
  if (!reward) return null;
  const { gainedXp, streak, isNewDay, leveledUp, newLevel, newBadges = [] } = reward;
  const celebrate = leveledUp || newBadges.length > 0 || (isNewDay && streak >= 3);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2500,
        background: 'rgba(2,2,8,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      {celebrate && <Confetti />}
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in"
        style={{
          background: 'linear-gradient(180deg, #14142a, #0c0c1a)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '24px', padding: '32px 28px', maxWidth: '420px', width: '100%',
          textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: '52px', marginBottom: '8px' }}>
          {leveledUp ? '🚀' : newBadges.length ? '🏅' : '✨'}
        </div>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px',
        }}>
          {leveledUp ? `Level ${newLevel}!` : 'Session Complete!'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '22px' }}>
          {leveledUp ? "You leveled up — keep the momentum going." : 'Nice work. Rewards added to your profile.'}
        </p>

        {/* XP + streak */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: newBadges.length ? '22px' : '24px' }}>
          <div style={{
            flex: 1, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '16px', padding: '16px 12px',
          }}>
            <p style={{ color: '#a5b4fc', fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>+{gainedXp}</p>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>XP earned</p>
          </div>
          <div style={{
            flex: 1, background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)',
            borderRadius: '16px', padding: '16px 12px',
          }}>
            <p style={{ color: '#fb923c', fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>
              <span className="flame">🔥</span> {streak}
            </p>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
              day streak{isNewDay ? ' (+1)' : ''}
            </p>
          </div>
        </div>

        {/* New badges */}
        {newBadges.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              New badge{newBadges.length > 1 ? 's' : ''} unlocked
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {newBadges.map((id) => {
                const b = getBadge(id);
                if (!b) return null;
                return (
                  <div key={id} className="pop-in" style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', padding: '12px 14px', minWidth: '92px',
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>{b.icon}</div>
                    <p style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 700 }}>{b.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
            borderRadius: '14px', padding: '14px 32px', fontSize: '15px', fontWeight: 700,
            color: 'white', width: '100%', boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
