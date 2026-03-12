from app.schemas import TranslateSentenceResponse
from app.services.utils import extract_json
from app.services.llm import call_llm_json
from app.config import settings
from app.services.utils import get_full_language_name

def translate_sentence(sentence: str, target_lang: str) -> TranslateSentenceResponse:
    print("Translator working")

    target_lang_full = get_full_language_name(target_lang)

    provider = settings.LLM_PROVIDER_EXPLAINER 

    system_prompt = f"""###FEATURE:TRANSLATOR###
    You are a professional Japanese-to-{target_lang_full} translator.
    Your task is to translate the given Japanese sentence into natural, fluent {target_lang_full}.
    [STRICT LANGUAGE RULES]
    - The output "translation" MUST be written EXCLUSIVELY in {target_lang_full}.
    - Match the tone and politeness level of the original Japanese sentence.
    """.strip()
    
    user_prompt = f"""
    Translate the following Japanese section.
    Text:
    "{sentence}"
    """.strip()

    raw = call_llm_json(
        provider=provider,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=TranslateSentenceResponse,
    )
    print("=== RAW FROM LLM START ===")
    print(raw)
    print("=== RAW FROM LLM END ===")
    data = extract_json(raw)
    return TranslateSentenceResponse(**data)
