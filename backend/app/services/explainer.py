from app.schemas import ExplainRequest, ExplainWordResponse, ExplainSentenceResponse, AnalyzeRequest
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings
from app.services.analyzer import analyze_text
from app.services.translator import translate_sentence

# two logic of explainer, for short word-> word mode, long sentence-> sentence mode
# mode distinguish is decided at frontend
def explain_word(req: ExplainRequest) -> ExplainWordResponse:
    print("Explainer working")
    print("word mode")
    print("=== Level ===")
    print(req.level)
    print("=== Level ===")

    provider = settings.LLM_PROVIDER_EXPLAINER # donot use os.getenv
    prompt = f"""
    You are a Japanese language assistant.
    The learner's level is: JLPT {req.level}.

    Decide first in "type" whether the selected text is a vocabulary or a grammar,
    then explain it for a learner.
    For vocab, output exactly ONE reading in hiragana. If unsure, set reading to null.
    Output an example in Japanese and additionally notes if necessary.
    Output ONLY valid JSON. No markdown. No extra text.

    Input:
    selected_text: "{req.selected_text}"
    context: "{req.context or ""}"

    Output format:
    {{
    "type": "vocab" | "grammar",
    "surface": string,
    "reading": string | null,
    "meaning_en": string,
    "example": string,
    "notes": string | null
    }}
    """
    raw = call_llm_json(prompt, provider)
    print("=== RAW FROM LLM START ===")
    print(raw)
    print("=== RAW FROM LLM END ===")

    data = extract_json(raw)  
    return ExplainWordResponse(**data)

def explain_sentence(req: ExplainRequest) -> ExplainSentenceResponse:
    print("Explainer working")
    print("sentence mode")
    print("=== Level ===")
    print(req.level)
    print("=== Level ===")
    print("Engage Translator and Analyzer...")

    translation_en = translate_sentence(req.selected_text)
    analysis = analyze_text(AnalyzeRequest(text=req.selected_text, level=req.level))

    return ExplainSentenceResponse(
        translation_en=translation_en,
        vocab=analysis.vocab,
        grammar=analysis.grammar,
    )
