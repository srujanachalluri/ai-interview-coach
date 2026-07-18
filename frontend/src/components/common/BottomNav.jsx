// Native-app-style bottom tab bar shown on mobile.
const TABS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'select', label: 'Practice', icon: '🎯' },
  { id: 'history', label: 'History', icon: '📚' },
  // { id: 'profile', label: 'Profile', icon: '🏆' },   // MVP: profile tab hidden
];

export default function BottomNav({ screen, onNavigate }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      background: 'rgba(10,10,22,0.92)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      height: 'var(--bottom-nav-h)',
    }}>
      {TABS.map((tab) => {
        const active = screen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1, background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '3px', padding: '8px 0', color: active ? '#a5b4fc' : '#64748b',
              transition: 'color 0.15s',
            }}
          >
            <span style={{
              fontSize: '20px',
              transform: active ? 'translateY(-1px) scale(1.08)' : 'none',
              transition: 'transform 0.15s',
              filter: active ? 'none' : 'grayscale(0.4) opacity(0.85)',
            }}>{tab.icon}</span>
            <span style={{ fontSize: '10.5px', fontWeight: active ? 700 : 600 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
