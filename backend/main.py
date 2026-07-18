from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from gemini import generate_questions, evaluate_answer, generate_session_summary, generate_followup

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for AI-powered interview practice",
    version="1.0.0"
)

# ── CORS — allow frontend to call backend ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://*.vercel.app",
        "*"  # Update this with your specific Vercel URL in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ───────────────────────────────────────────────────────────
class QuestionsRequest(BaseModel):
    role: str
    category: str
    difficulty: str = "Medium"
    count: int = 10
    context: str = ""


class EvaluateRequest(BaseModel):
    question: str
    answer: str
    role: str
    category: str


class SummaryRequest(BaseModel):
    role: str
    category: str
    answers: list[dict]


class FollowupRequest(BaseModel):
    question: str
    answer: str
    role: str
    category: str


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "AI Interview Coach API is running 🚀",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/questions")
async def get_questions(req: QuestionsRequest):
    """Generate interview questions for a given role and category."""
    try:
        if req.count < 1 or req.count > 15:
            raise HTTPException(status_code=400, detail="Count must be between 1 and 15")

        questions = await generate_questions(
            role=req.role,
            category=req.category,
            difficulty=req.difficulty,
            count=req.count,
            context=req.context
        )
        return {
            "success": True,
            "role": req.role,
            "category": req.category,
            "difficulty": req.difficulty,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/evaluate")
async def evaluate(req: EvaluateRequest):
    """Evaluate a candidate's answer to an interview question."""
    try:
        if not req.answer.strip():
            raise HTTPException(status_code=400, detail="Answer cannot be empty")

        if len(req.answer) < 10:
            raise HTTPException(status_code=400, detail="Answer is too short")

        evaluation = await evaluate_answer(
            question=req.question,
            answer=req.answer,
            role=req.role,
            category=req.category
        )
        return {
            "success": True,
            "evaluation": evaluation
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/followup")
async def followup(req: FollowupRequest):
    """Generate one adaptive follow-up question based on the candidate's answer."""
    try:
        if not req.answer.strip():
            return {"success": True, "should_followup": False, "followup": ""}

        result = await generate_followup(
            question=req.question,
            answer=req.answer,
            role=req.role,
            category=req.category,
        )
        return {"success": True, **result}
    except Exception as e:
        # A failed follow-up should never break the interview flow.
        return {"success": False, "should_followup": False, "followup": "", "detail": str(e)}


@app.post("/api/summary")
async def get_summary(req: SummaryRequest):
    """Generate an overall session summary after completing all questions."""
    try:
        if not req.answers:
            raise HTTPException(status_code=400, detail="No answers provided")

        summary = await generate_session_summary(
            role=req.role,
            category=req.category,
            answers=req.answers
        )
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories")
async def get_categories():
    """Return available interview categories and roles."""
    return {
        "categories": [
            {
                "id": "frontend",
                "label": "Frontend Dev",
                "icon": "🎨",
                "color": "#61DAFB",
                "roles": ["Junior Frontend Developer", "Senior Frontend Developer", "React Developer", "Vue Developer", "Angular Developer"]
            },
            {
                "id": "backend",
                "label": "Backend Dev",
                "icon": "⚙️",
                "color": "#68D391",
                "roles": ["Junior Backend Developer", "Senior Backend Developer", "Node.js Developer", "Python Developer", "Java Developer"]
            },
            {
                "id": "data",
                "label": "Data Science",
                "icon": "📊",
                "color": "#F6AD55",
                "roles": ["Data Scientist", "ML Engineer", "Data Analyst", "AI Engineer", "Research Scientist"]
            },
            {
                "id": "devops",
                "label": "DevOps / Cloud",
                "icon": "☁️",
                "color": "#76E4F7",
                "roles": ["DevOps Engineer", "Cloud Architect", "SRE Engineer", "Platform Engineer", "Infrastructure Engineer"]
            },
            {
                "id": "system",
                "label": "System Design",
                "icon": "🏗️",
                "color": "#B794F4",
                "roles": ["Software Architect", "Senior Engineer", "Staff Engineer", "Principal Engineer", "Tech Lead"]
            },
            {
                "id": "behavioral",
                "label": "Behavioral / HR",
                "icon": "🤝",
                "color": "#FC8181",
                "roles": ["Any Role", "Engineering Manager", "Team Lead", "Senior Developer", "Junior Developer"]
            }
        ],
        "difficulties": ["Easy", "Medium", "Hard"]
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
