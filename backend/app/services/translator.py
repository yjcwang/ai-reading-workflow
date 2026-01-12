from app.schemas import TranslateSentenceResponse
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings

def translate_sentence(sentence: str) -> str:
    print("Translator working")

    provider = settings.LLM_PROVIDER_EXPLAINER # donot use os.getenv
    prompt = f"""
    You are a professional Japanese-to-English translator.
    Translate the given Japanese sentence into natural English.

    Rules:
    - Output ONLY valid JSON.
    - No markdown, no code block.
    - The first character must be {{ and the last character must be }}.

    Input sentence:
    {sentence}

    Output format:
    {{
    "translation_en": string
    }}
""".strip()

    raw = call_llm_json(prompt, provider)
    print("=== RAW FROM LLM START ===")
    print(raw)
    print("=== RAW FROM LLM END ===")
    data = extract_json(raw)
    return TranslateSentenceResponse(**data).translation_en
