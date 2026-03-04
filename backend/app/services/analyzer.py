from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings


def analyze_text(req: AnalyzeRequest) -> AnalyzeResponse:
    print("Analyzer working")
    print("=== Level ===")
    print(req.level)
    print("=== Level ===")
    
    provider = settings.LLM_PROVIDER_ANALYZER 
    prompt = f"""###FEATURE:ANALYZER###
    You are an AI Japanese reading tutor.
    The learner's level is: JLPT {req.level}.
    STRICT REQUIREMENTS:
    - Only extract vocabulary and grammar that are appropriate for JLPT {req.level}.
    - If the text contains items that are TOO EASY or TOO DIFFICULT for JLPT {req.level}, DO NOT include them.
    - Focus on items that are worth learning at this level.
    Quality over Quantity.
    Reading must be hiragana only (no romaji, no katakana, no English).
    Do NOT output generic patterns like "V1 + (te) + V2" or "N1 + N2". Only list named grammar patterns used in the text.
    Return ONLY valid JSON with this shape:
    {{
    "vocab": [{{"surface": "...", "reading": "...", "meaning_en": "...", "example": "...", "notes": "..."}}],
    "grammar": [{{"pattern": "...", "explanation_en": "...", "example": "...", "notes": "..."}}]
    }}

    Text: 
    {req.text}
    """
    raw = call_llm_json(prompt, provider)
    print("=== RAW FROM LLM START ===")
    print(raw)
    print("=== RAW FROM LLM END ===")

    # dspy

    data = extract_json(raw) 
    return AnalyzeResponse(**data)
