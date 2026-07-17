from pydantic import BaseModel

from app.schemas import TranslationSegment, TranslateSentenceResponse
from app.services.llm import call_llm_json
from app.config import settings
from app.services.utils import get_full_language_name


class TranslationSegmentDraft(BaseModel):
    source_text: str
    translation: str


class TranslationDraft(BaseModel):
    translation: str
    segments: list[TranslationSegmentDraft]

def translate_sentence(sentence: str, target_lang: str) -> TranslateSentenceResponse:
    print("Translator working")

    target_lang_full = get_full_language_name(target_lang)

    provider = settings.LLM_PROVIDER_TRANSLATOR

    system_prompt = f"""###FEATURE:TRANSLATOR###
    You are a professional Japanese-to-{target_lang_full} translator.
    Your task is to translate the given Japanese sentence into natural, fluent {target_lang_full}.
    [STRICT LANGUAGE RULES]
    - The output "translation" MUST be written EXCLUSIVELY in {target_lang_full}.
    - Match the tone and politeness level of the original Japanese sentence.
    - Split the entire source into ordered, non-overlapping sentence-sized segments.
    - Copy each "source_text" EXACTLY from the input, preserving punctuation and whitespace.
    - Include every part of the source exactly once and provide a translation for every segment.
    """.strip()
    
    user_prompt = f"""
    Translate the following Japanese section.
    Text:
    "{sentence}"
    """.strip()
    
    draft = call_llm_json(
        provider=provider,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=TranslationDraft,
        service_name="translate",
    )

    # Resolve offsets server-side so the UI never trusts positions invented by the model.
    segments: list[TranslationSegment] = []
    search_from = 0
    for segment in draft.segments:
        start = sentence.find(segment.source_text, search_from)
        if start == -1:
            continue
        end = start + len(segment.source_text)
        segments.append(
            TranslationSegment(
                source_text=segment.source_text,
                source_start=start,
                source_end=end,
                translation=segment.translation,
            )
        )
        search_from = end

    # A partial map is more confusing than no linking, so fall back to plain text.
    covered_text = "".join(
        sentence[segment.source_start:segment.source_end]
        for segment in segments
    )
    if "".join(covered_text.split()) != "".join(sentence.split()):
        segments = []

    return TranslateSentenceResponse(
        translation=draft.translation,
        segments=segments,
    )
