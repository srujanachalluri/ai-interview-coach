const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const call = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
};

export const api = {
  getCategories: () => call('/api/categories'),

  getQuestions: (role, category, difficulty = 'Medium', count = 10) =>
    call('/api/questions', {
      method: 'POST',
      body: JSON.stringify({ role, category, difficulty, count }),
    }),

  evaluate: (question, answer, role, category) =>
    call('/api/evaluate', {
      method: 'POST',
      body: JSON.stringify({ question, answer, role, category }),
    }),

  getSummary: (role, category, answers) =>
    call('/api/summary', {
      method: 'POST',
      body: JSON.stringify({ role, category, answers }),
    }),
};
