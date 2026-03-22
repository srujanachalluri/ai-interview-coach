from groq import Groq
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()

def call_ai(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000,
    )
    return response.choices[0].message.content

async def generate_questions(role, category, difficulty, count=10):
    prompt = f"""You are an expert technical interviewer at a top tech company.

Generate exactly {count} interview questions for:
- Role: {role}
- Category: {category}
- Difficulty: {difficulty}

Respond ONLY with a JSON array, no markdown:
[
  {{
    "id": 1,
    "question": "question text here",
    "type": "technical",
    "hint": "brief hint about what a good answer covers"
  }}
]"""
    result = call_ai(prompt)
    return json.loads(clean_json(result))

async def evaluate_answer(question, answer, role, category):
    prompt = f"""You are a senior engineer conducting a {category} interview for {role}.

QUESTION: {question}
CANDIDATE ANSWER: {answer}

Respond ONLY with JSON (no markdown):
{{
  "score": <1-10>,
  "verdict": "Excellent" or "Good" or "Needs Improvement" or "Poor",
  "feedback": "<2-3 sentences of specific feedback>",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "model_answer": "<comprehensive model answer in 3-5 sentences>",
  "keywords_mentioned": ["key term they mentioned"],
  "keywords_missed": ["important term they missed"]
}}"""
    result = call_ai(prompt)
    return json.loads(clean_json(result))

async def generate_session_summary(role, category, answers):
    scores = [a.get("score", 0) for a in answers if a.get("score")]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    answers_text = "\n".join([
        f"Q{i+1}: {a['question']}\nAnswer: {a['answer']}\nScore: {a.get('score','N/A')}/10"
        for i, a in enumerate(answers)
    ])

    prompt = f"""You are a career coach reviewing an interview session.

Role: {role} | Category: {category} | Avg Score: {avg_score}/10

{answers_text}

Respond ONLY with JSON (no markdown):
{{
  "overall_score": {avg_score},
  "performance_level": "Ready to Interview" or "Almost Ready" or "Needs More Practice",
  "summary": "<2-3 sentence overall assessment>",
  "top_strengths": ["strength 1", "strength 2", "strength 3"],
  "key_improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "recommended_topics": ["topic 1", "topic 2", "topic 3"],
  "next_steps": "<actionable advice before a real interview>"
}}"""
    result = call_ai(prompt)
    return json.loads(clean_json(result))
