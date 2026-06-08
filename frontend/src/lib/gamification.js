// Pure gamification helpers — no Firebase here so they stay easy to reason about.

// ── Levels ──────────────────────────────────────────────────────────────────
// XP needed for a level grows gently: level n needs n*100 cumulative-ish.
// We use a simple curve: level = floor(sqrt(xp / 50)) + 1
export function levelFromXp(xp = 0) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export function xpForLevel(level) {
  // inverse of levelFromXp — cumulative XP required to reach `level`
  const l = Math.max(1, level) - 1;
  return l * l * 50;
}

export function levelProgress(xp = 0) {
  const level = levelFromXp(xp);
  const curBase = xpForLevel(level);
  const nextBase = xpForLevel(level + 1);
  const into = xp - curBase;
  const span = nextBase - curBase;
  return {
    level,
    into,
    span,
    pct: span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 100,
    toNext: Math.max(0, nextBase - xp),
  };
}

// ── XP earned for a completed session ────────────────────────────────────────
// Base for finishing + per-question + score bonus + difficulty multiplier.
export function xpForSession({ questions = 0, avgScore = 0, difficulty = 'Medium' } = {}) {
  const diffMult = difficulty === 'Hard' ? 1.5 : difficulty === 'Easy' ? 0.8 : 1;
  const base = 20;
  const perQ = questions * 5;
  const scoreBonus = Math.round(avgScore * 5); // up to 50
  return Math.round((base + perQ + scoreBonus) * diffMult);
}

// ── Streaks ──────────────────────────────────────────────────────────────────
export function dayKey(date = new Date()) {
  // Local YYYY-MM-DD so "today" matches the user's wall clock.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(aKey, bKey) {
  const a = new Date(aKey + 'T00:00:00');
  const b = new Date(bKey + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

/** Given the last practice day and current streak, compute the new streak for "today". */
export function updateStreak(lastDayKey, currentStreak = 0, today = dayKey()) {
  if (!lastDayKey) return { streak: 1, isNewDay: true };
  const gap = daysBetween(lastDayKey, today);
  if (gap <= 0) return { streak: currentStreak || 1, isNewDay: false }; // already practiced today
  if (gap === 1) return { streak: (currentStreak || 0) + 1, isNewDay: true }; // consecutive
  return { streak: 1, isNewDay: true }; // streak broken, restart
}

// ── Badges ───────────────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first_step', icon: '🎯', name: 'First Step', desc: 'Complete your first session' },
  { id: 'streak_3', icon: '🔥', name: 'On Fire', desc: '3-day streak' },
  { id: 'streak_7', icon: '⚡', name: 'Unstoppable', desc: '7-day streak' },
  { id: 'streak_30', icon: '👑', name: 'Legend', desc: '30-day streak' },
  { id: 'perfect', icon: '💎', name: 'Flawless', desc: 'Score 10/10 on a question' },
  { id: 'high_scorer', icon: '🏆', name: 'High Scorer', desc: 'Session average of 8+' },
  { id: 'marathon', icon: '🏃', name: 'Marathoner', desc: 'Answer 100 questions total' },
  { id: 'explorer', icon: '🧭', name: 'Explorer', desc: 'Practice 4 different categories' },
  { id: 'level_5', icon: '🌟', name: 'Rising Star', desc: 'Reach level 5' },
  { id: 'level_10', icon: '🚀', name: 'Pro', desc: 'Reach level 10' },
];

const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));
export const getBadge = (id) => BADGE_BY_ID[id];

/** Returns newly-earned badge ids given the post-session stats snapshot. */
export function evaluateBadges(stats, owned = []) {
  const have = new Set(owned);
  const earned = [];
  const give = (id) => { if (!have.has(id)) { earned.push(id); have.add(id); } };

  if ((stats.totalSessions || 0) >= 1) give('first_step');
  if ((stats.streak || 0) >= 3) give('streak_3');
  if ((stats.streak || 0) >= 7) give('streak_7');
  if ((stats.streak || 0) >= 30) give('streak_30');
  if (stats.hadPerfect) give('perfect');
  if ((stats.lastAvgScore || 0) >= 8) give('high_scorer');
  if ((stats.totalQuestions || 0) >= 100) give('marathon');
  if ((stats.categoriesCount || 0) >= 4) give('explorer');
  if (levelFromXp(stats.xp || 0) >= 5) give('level_5');
  if (levelFromXp(stats.xp || 0) >= 10) give('level_10');

  return earned;
}
