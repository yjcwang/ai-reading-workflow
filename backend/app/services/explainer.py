from app.schemas import ExplainRequest, ExplainResponse
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings

def explain_selection(req: ExplainRequest) -> ExplainResponse:
    print("Explainer working")

    provider = settings.LLM_PROVIDER_EXPLAINER # donot use os.getenv
    prompt = f"""
    You are a Japanese language assistant.

    Decide whether the selected text is a vocabulary item or a grammar pattern,
    then explain it for a learner.
    For vocab, output exactly ONE reading in hiragana. If unsure, set reading to null.
    Output an example in Japanese.
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
    return ExplainResponse(**data)

