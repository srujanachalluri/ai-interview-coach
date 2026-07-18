const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const call = async (endpoint, options = {}) => {
  let res;
  try {
    res = await fetch(`${BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (e) {
    // Network/CORS/server-down — give a human message instead of "Failed to fetch".
    throw new Error('Can’t reach the server. Check your connection and try again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
};

export const api = {
  getCategories: () => call('/api/categories'),

  getQuestions: (role, category, difficulty = 'Medium', count = 10, context = '') =>
    call('/api/questions', {
      method: 'POST',
      body: JSON.stringify({ role, category, difficulty, count, context }),
    }),

  evaluate: (question, answer, role, category) =>
    call('/api/evaluate', {
      method: 'POST',
      body: JSON.stringify({ question, answer, role, category }),
    }),

  followup: (question, answer, role, category) =>
    call('/api/followup', {
      method: 'POST',
      body: JSON.stringify({ question, answer, role, category }),
    }),

  getSummary: (role, category, answers) =>
    call('/api/summary', {
      method: 'POST',
      body: JSON.stringify({ role, category, answers }),
    }),
};
