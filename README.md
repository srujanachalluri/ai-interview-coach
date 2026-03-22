# 🎯 AI Interview Coach

> Practice interviews with AI — get instant scoring, detailed feedback, and improvement tips across 6 categories.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-6366f1?style=for-the-badge)](https://your-frontend.vercel.app)
[![Backend](https://img.shields.io/badge/API-FastAPI_Python-009688?style=for-the-badge&logo=fastapi)](https://your-backend.onrender.com)

---

## ✨ Features

- 🤖 **AI-Generated Questions** — Gemini creates 5/10/15 questions per session
- 📊 **Instant Scoring** — Each answer scored 1-10 with detailed feedback
- ✅ **Model Answers** — See what a great answer looks like
- 🔑 **Keyword Analysis** — Know which keywords you hit and missed
- 🏆 **Session Summary** — Overall score + study recommendations
- 📥 **PDF Report** — Download your full session report
- 🔥 **Firebase History** — All sessions saved, load and review anytime
- 6️⃣ **6 Categories** — Frontend, Backend, Data Science, DevOps, System Design, Behavioral

---

## 🏗️ Architecture

```
frontend/ (React + Vite)  →  backend/ (Python FastAPI)  →  Gemini AI
         ↓                                                    
    Firebase (Auth + Firestore)
```

---

## 🚀 Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in Firebase values + set VITE_API_URL=http://localhost:8000
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🌐 Deployment

### Backend → Render.com (Free)

1. Push `backend/` folder to a GitHub repo
2. Go to render.com → New Web Service → Connect repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `GEMINI_API_KEY=your_key`
6. Deploy → copy the URL (e.g. https://ai-interview-api.onrender.com)

### Frontend → Vercel (Free)

1. Push `frontend/` to GitHub
2. Import on vercel.com
3. Add environment variables (Firebase + `VITE_API_URL=https://your-render-url.onrender.com`)
4. Deploy

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Firebase |
| Backend | Python, FastAPI, Uvicorn |
| AI | Google Gemini 2.0 Flash |
| Database | Firebase Firestore |
| Auth | Firebase Google OAuth |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
ai-interview-coach/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── gemini.py        # AI logic
│   ├── requirements.txt
│   └── render.yaml      # Render deployment config
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/Login.jsx
    │   │   ├── Dashboard/Dashboard.jsx
    │   │   ├── Interview/RoleSelector.jsx
    │   │   ├── Interview/QuestionCard.jsx
    │   │   ├── Interview/Feedback.jsx
    │   │   ├── Interview/SessionSummary.jsx
    │   │   └── History/History.jsx
    │   ├── api.js        # Backend API calls
    │   ├── firebase.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```
