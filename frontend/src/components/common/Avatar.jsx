import { useState } from 'react';

const COLORS = [
  ['#6366f1', '#8b5cf6'], ['#0ea5e9', '#6366f1'], ['#f59e0b', '#ef4444'],
  ['#10b981', '#0ea5e9'], ['#ec4899', '#8b5cf6'], ['#f43f5e', '#f59e0b'],
];

function initials(name = '', email = '') {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function pickColor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export default function Avatar({ user, size = 30, style = {} }) {
  const [broken, setBroken] = useState(false);
  const name = user?.displayName || '';
  const email = user?.email || '';
  const photo = user?.photoURL;
  const [c1, c2] = pickColor(name || email);

  const base = {
    width: size, height: size, borderRadius: '50%',
    border: '2px solid rgba(99,102,241,0.4)', flexShrink: 0,
    objectFit: 'cover', ...style,
  };

  if (photo && !broken) {
    return <img src={photo} onError={() => setBroken(true)} alt="" style={base} referrerPolicy="no-referrer" />;
  }

  return (
    <div style={{
      ...base,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 800, fontSize: size * 0.4, letterSpacing: '-0.5px',
    }}>
      {initials(name, email)}
    </div>
  );
}
