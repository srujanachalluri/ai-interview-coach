import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  dayKey, updateStreak, xpForSession, levelFromXp, evaluateBadges,
} from './gamification';

// User stats live in the user's own document: users/{uid}
// (sessions remain a subcollection at users/{uid}/sessions)

const DEFAULT_STATS = {
  xp: 0,
  streak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  totalSessions: 0,
  totalQuestions: 0,
  badges: [],
  categories: [], // distinct category labels practiced
};

export function subscribeStats(uid, cb) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb({ ...DEFAULT_STATS, ...(snap.exists() ? snap.data() : {}) });
  });
}

export async function getStats(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return { ...DEFAULT_STATS, ...(snap.exists() ? snap.data() : {}) };
}

/**
 * Apply the result of a finished session: streak, XP, totals, badges.
 * Returns a summary of what changed so the UI can celebrate.
 */
export async function applySessionResult(uid, {
  questions, avgScore, difficulty, categoryLabel, hadPerfect,
}) {
  const prev = await getStats(uid);
  const today = dayKey();

  const { streak, isNewDay } = updateStreak(prev.lastPracticeDate, prev.streak, today);
  const gainedXp = xpForSession({ questions, avgScore, difficulty });

  const categories = Array.from(new Set([...(prev.categories || []), categoryLabel].filter(Boolean)));

  const next = {
    xp: (prev.xp || 0) + gainedXp,
    streak,
    longestStreak: Math.max(prev.longestStreak || 0, streak),
    lastPracticeDate: today,
    totalSessions: (prev.totalSessions || 0) + 1,
    totalQuestions: (prev.totalQuestions || 0) + (questions || 0),
    categories,
  };

  const prevLevel = levelFromXp(prev.xp || 0);
  const newLevel = levelFromXp(next.xp);

  const newBadges = evaluateBadges(
    {
      ...next,
      hadPerfect,
      lastAvgScore: avgScore,
      categoriesCount: categories.length,
    },
    prev.badges || []
  );

  next.badges = [...(prev.badges || []), ...newBadges];

  await setDoc(doc(db, 'users', uid), next, { merge: true });

  return {
    gainedXp,
    streak,
    isNewDay,
    leveledUp: newLevel > prevLevel,
    newLevel,
    newBadges,
  };
}
