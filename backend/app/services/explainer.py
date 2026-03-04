from app.schemas import ExplainRequest, ExplainWordResponse, ExplainSentenceResponse, AnalyzeRequest
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings
from app.services.analyzer import analyze_text
from app.services.translator import translate_sentence
from app.services.utils import get_full_language_name

# two logic of explainer, for short word-> word mode, long sentence-> sentence mode
# mode distinguish is decided at frontend\app\page.tsx
def explain_word(req: ExplainRequest) -> ExplainWordResponse:
    print("Explainer working")
    print("word mode")
    print("=== Level ===")
    print(req.level)
    print("=== Level ===")

    target_lang_full = get_full_language_name(req.target_lang)

    provider = settings.LLM_PROVIDER_EXPLAINER
    prompt = f"""###FEATURE:EXPLAINER###
    You are a Japanese language expert and translator. 
    Your task is to analyze the selected text and provide explanations EXCLUSIVELY in {target_lang_full}.
    [STRICT LANGUAGE RULES]
    - ALL "meaning" and "notes" fields MUST be written in {target_lang_full}.
    [JLPT {req.level} CONTEXT]
    - The learner's level is JLPT {req.level}. 
    [MORE rules]
    1. Identify if the "selected_text" is "vocab" (vocabulary/phrase) or "grammar" (grammar pattern).
    2. Provide exactly ONE reading in Hiragana for vocabulary. Set to null if not applicable.
    3. Provide a clear example sentence in Japanese.
    4. Use the "context" to ensure the explanation is accurate for this specific usage.
    [OUTPUT FORMAT]
    Return ONLY valid JSON with this shape:
    {{
      "type": "vocab" | "grammar",
      "surface": "...",
      "reading": "hiragana or null",
      "meaning": "({target_lang_full} explanation here)",
      "example": "Japanese example sentence",
      "notes": "({target_lang_full} additional tips or null)"
    }}

    [INPUT]
    selected_text: "{req.selected_text}"
    context: "{req.context or ""}"
    """
    raw = call_llm_json(prompt, provider)
    print("=== RAW FROM LLM START ===")
    print(raw)
    print("=== RAW FROM LLM END ===")

    data = extract_json(raw)  
    return ExplainWordResponse(**data)

# explain with scentence mode is not strictly explainer, it is composition of translator and analyzer
def explain_sentence(req: ExplainRequest) -> ExplainSentenceResponse:
    print("Explainer working")
    print("sentence mode")
    print("=== Level ===")
    print(req.level)
    print("=== Level ===")
    print("Engage Translator and Analyzer...")

    translation = translate_sentence(req.selected_text, req.target_lang)
    analysis = analyze_text(AnalyzeRequest(text=req.selected_text, level=req.level, target_lang=req.target_lang))

    return ExplainSentenceResponse(
        translation=translation,
        vocab=analysis.vocab,
        grammar=analysis.grammar,
    )
