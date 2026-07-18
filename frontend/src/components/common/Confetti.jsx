import { useMemo } from 'react';

const COLORS = ['#6366f1', '#8b5cf6', '#16a34a', '#d97706', '#dc2626', '#38bdf8'];

/** Lightweight CSS confetti burst — render it conditionally for ~2.5s. */
export default function Confetti({ count = 80 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 2 + Math.random() * 1.5,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        rot: Math.random() * 360,
      })),
    [count]
  );

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3000, overflow: 'hidden' }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rot}deg)`,
            animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
