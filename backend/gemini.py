from groq import Groq
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"


def clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def extract_json(text: str):
    """Best-effort JSON extraction from an LLM response.

    Tries a straight parse, then strips code fences, then grabs the first
    balanced {...} or [...] block. Raises ValueError if nothing parses.
    """
    candidates = [text, clean_json(text)]
    for c in candidates:
        try:
            return json.loads(c)
        except Exception:
            pass

    # Find the outermost JSON object or array in the text.
    cleaned = clean_json(text)
    for opener, closer in (("[", "]"), ("{", "}")):
        start = cleaned.find(opener)
        end = cleaned.rfind(closer)
        if start != -1 and end != -1 and end > start:
            snippet = cleaned[start:end + 1]
            try:
                return json.loads(snippet)
            except Exception:
                continue
    raise ValueError("Could not parse JSON from model response")


def call_ai(prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content


def call_ai_json(prompt: str, retries: int = 2, **kwargs):
    """Call the model and parse JSON, retrying with a stricter nudge on failure."""
    last_err = None
    for attempt in range(retries + 1):
        try:
            p = prompt
            if attempt > 0:
                p = prompt + "\n\nIMPORTANT: Return ONLY valid JSON. No prose, no markdown fences."
            return extract_json(call_ai(p, **kwargs))
        except Exception as e:  # parse or API error
            last_err = e
    raise last_err if last_err else RuntimeError("AI call failed")


async def generate_questions(role, category, difficulty, count=10, context=""):
    context_block = ""
    if context and context.strip():
        trimmed = context.strip()[:4000]
        context_block = f"""
The candidate provided this resume / job description. Tailor the questions to it —
reference specific technologies, projects, and responsibilities mentioned:
\"\"\"
{trimmed}
\"\"\"
"""

    prompt = f"""You are an expert technical interviewer at a top tech company.

Generate exactly {count} interview questions for:
- Role: {role}
- Category: {category}
- Difficulty: {difficulty}
{context_block}
Make questions realistic, varied, and progressively challenging.

Respond ONLY with a JSON array, no markdown:
[
  {{
    "id": 1,
    "question": "question text here",
    "type": "technical",
    "hint": "brief hint about what a good answer covers"
  }}
]"""
    data = call_ai_json(prompt)
    if isinstance(data, dict):
        data = data.get("questions", [])
    # Normalize so the UI never breaks on missing fields.
    out = []
    for i, q in enumerate(data[:count]):
        if not isinstance(q, dict):
            continue
        out.append({
            "id": q.get("id", i + 1),
            "question": (q.get("question") or "").strip(),
            "type": q.get("type", "technical"),
            "hint": q.get("hint", "Think about the key concepts and give a concrete example."),
        })
    out = [q for q in out if q["question"]]
    if not out:
        raise ValueError("No valid questions generated")
    return out


def _is_behavioral(category: str) -> bool:
    """Behavioral / HR interviews get the STAR breakdown; technical ones don't."""
    c = (category or "").lower()
    return "behav" in c or "hr" in c


def _star_component(c):
    """Normalize one STAR component so the UI never breaks on a missing field."""
    c = c or {}
    try:
        score = int(round(float(c.get("score", 0) or 0)))
    except Exception:
        score = 0
    return {
        "present": bool(c.get("present", score > 0)),
        "score": max(0, min(2, score)),
        "note": (c.get("note") or "").strip(),
    }


async def evaluate_answer(question, answer, role, category):
    behavioral = _is_behavioral(category)

    # For behavioral answers, also grade the STAR structure of the story.
    star_instructions = ""
    if behavioral:
        star_instructions = """

This is a BEHAVIORAL question. ALSO grade the answer against the STAR method.
For each part decide if it is present and give a 0-2 score (0 = missing,
1 = partial, 2 = clear). Add this extra key to the JSON:
  "star": {
    "situation": {"present": true/false, "score": 0-2, "note": "<short note>"},
    "task":      {"present": true/false, "score": 0-2, "note": "<short note>"},
    "action":    {"present": true/false, "score": 0-2, "note": "<short note>"},
    "result":    {"present": true/false, "score": 0-2, "note": "<short note>"},
    "tip": "<one concrete tip to make it a stronger STAR story>"
  }"""

    prompt = f"""You are a senior engineer conducting a {category} interview for {role}.

QUESTION: {question}
CANDIDATE ANSWER: {answer}

Be fair but rigorous. Respond ONLY with JSON (no markdown):
{{
  "score": <1-10>,
  "verdict": "Excellent" or "Good" or "Needs Improvement" or "Poor",
  "feedback": "<2-3 sentences of specific feedback>",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "model_answer": "<comprehensive model answer in 3-5 sentences>",
  "keywords_mentioned": ["key term they mentioned"],
  "keywords_missed": ["important term they missed"]
}}{star_instructions}"""
    data = call_ai_json(prompt)
    # Defensive defaults so the Feedback UI always renders.
    try:
        score = int(round(float(data.get("score", 5))))
    except Exception:
        score = 5
    score = max(1, min(10, score))
    result = {
        "score": score,
        "verdict": data.get("verdict", "Good"),
        "feedback": data.get("feedback", ""),
        "strengths": data.get("strengths", []) or [],
        "improvements": data.get("improvements", []) or [],
        "model_answer": data.get("model_answer", ""),
        "keywords_mentioned": data.get("keywords_mentioned", []) or [],
        "keywords_missed": data.get("keywords_missed", []) or [],
    }
    if behavioral:
        star = data.get("star") or {}
        result["star"] = {
            "situation": _star_component(star.get("situation")),
            "task": _star_component(star.get("task")),
            "action": _star_component(star.get("action")),
            "result": _star_component(star.get("result")),
            "tip": (star.get("tip") or "").strip(),
        }
    return result


async def generate_followup(question, answer, role, category):
    """Decide, like a real interviewer, whether to probe deeper — and if so, ask ONE follow-up."""
    prompt = f"""You are a senior engineer conducting a {category} interview for a {role} position.

You just asked: "{question}"
The candidate answered: "{answer}"

Like a real interviewer, decide whether to ask ONE natural follow-up that probes deeper,
challenges a vague claim, or asks for a concrete example. Only follow up if it genuinely
adds value — if the answer was already thorough, don't.

Respond ONLY with JSON (no markdown):
{{
  "should_followup": true or false,
  "followup": "<a single, specific follow-up question that builds on what they said>",
  "reason": "<one short phrase on why you're asking>"
}}"""
    try:
        data = call_ai_json(prompt, max_tokens=400, temperature=0.6)
    except Exception:
        return {"should_followup": False, "followup": "", "reason": ""}
    followup = (data.get("followup") or "").strip()
    return {
        "should_followup": bool(data.get("should_followup", False)) and bool(followup),
        "followup": followup,
        "reason": (data.get("reason") or "").strip(),
    }


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
    data = call_ai_json(prompt)
    return {
        "overall_score": data.get("overall_score", avg_score),
        "performance_level": data.get("performance_level", "Needs More Practice"),
        "summary": data.get("summary", ""),
        "top_strengths": data.get("top_strengths", []) or [],
        "key_improvements": data.get("key_improvements", []) or [],
        "recommended_topics": data.get("recommended_topics", []) or [],
        "next_steps": data.get("next_steps", ""),
    }
