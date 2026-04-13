from app.config import settings
from app.schemas import GenerateTitleResponse
from app.services.llm import call_llm_json


def generate_title_from_text(*, text: str, level: str) -> str:
    # text/ title-generator share same llm model
    print("Title Generator working")
    provider = settings.LLM_PROVIDER_TEXT_GENERATOR

    system_prompt = f"""###FEATURE:TITLE_GENERATOR###
    You are a Japanese reading title generator.
    Your task is to create one short, natural Japanese title for a saved reading item.
    [STRICT OUTPUT RULES]
    - Output must match the response schema exactly.
    - Return valid JSON only.
    - Do not use markdown.
    - Do not add extra fields.
    [CONTENT RULES]
    - Write ONLY in Japanese.
    - The title must be concise, specific, and useful as a history item label.
    - Prefer a natural title, not a copied first sentence fragment.
    - Keep it appropriate for JLPT {level} learners.
    - Keep it under 20 Japanese characters when possible.
    """.strip()

    user_prompt = f"""
    Generate one short Japanese title for this reading text.
    JLPT level:
    {level}

    Text:
    {text}
    """.strip()

    response = call_llm_json(
        provider=provider,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=GenerateTitleResponse,
    )

    return response.title.strip()
