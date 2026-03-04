from app.schemas import TranslateSentenceResponse
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings
from app.services.utils import get_full_language_name

def translate_sentence(sentence: str, target_lang: str) -> str:
    print("Translator working")

    target_lang_full = get_full_language_name(target_lang)

    provider = settings.LLM_PROVIDER_EXPLAINER 
    prompt = f"""###FEATURE:TRANSLATOR###
    You are a professional Japanese-to-{target_lang_full} translator.
    Your task is to translate the given Japanese sentence into natural, fluent {target_lang_full}.
    [STRICT LANGUAGE RULES]
    - The output "translation" MUST be written EXCLUSIVELY in {target_lang_full}.
    - Match the tone and politeness level of the original Japanese sentence.
    [OUTPUT FORMAT]
    - Return ONLY valid JSON.
    - No markdown, no extra text.
    - The JSON must follow this exact shape:
    {{
      "translation": "..."
    }}
    [INPUT SENTENCE]
    {sentence}
""".strip()

    raw = call_llm_json(prompt, provider)
    print("=== RAW FROM LLM START ===")
    print(raw)
    print("=== RAW FROM LLM END ===")
    data = extract_json(raw)
    return TranslateSentenceResponse(**data).translation
