from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings
from app.services.utils import get_full_language_name


def analyze_text(req: AnalyzeRequest) -> AnalyzeResponse:
    print("Analyzer working")
    print("=== Level ===")
    print(req.level)
    print("=== Level ===")

    target_lang_full = get_full_language_name(req.target_lang)
    print("language is: ", target_lang_full)
    
    provider = settings.LLM_PROVIDER_ANALYZER 

    system_prompt = f"""###FEATURE:ANALYZER###
    You are a Japanese language expert and translator.
    Your task is to analyze Japanese text and provide explanations EXCLUSIVELY in {target_lang_full}.
    [STRICT LANGUAGE RULES]
    - ALL "meaning", "explanation", and "notes" fields MUST be written in {target_lang_full}.
    - DO NOT use Japanese to explain Japanese.
    [JLPT {req.level} CONTEXT]
    - Extract vocabulary and grammar relevant to JLPT {req.level}.
    - Focus on items that are worth learning at this level.
    [MORE rules]
    - Reading: Hiragana only.
    - Do NOT output generic patterns like "V1 + (te) + V2" or "N1 + N2". Only list named grammar patterns used in the text.   
    """.strip()

    user_prompt = f"""
    Analyze the following Japanese text.
    Text:
    {req.text}
    """.strip()

    return call_llm_json(
        provider=provider,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=AnalyzeResponse,
    )
