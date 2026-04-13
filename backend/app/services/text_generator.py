from app.schemas import GenerateTextRequest, GenerateTextResponse
from app.services.llm import call_llm_json
from app.config import settings


def generate_text(req: GenerateTextRequest) -> GenerateTextResponse:
    print("Text Generator working")
    print("=== Generate Request ===")
    print("level:", req.level)
    print("topic:", req.topic)
    print("length:", req.length)
    print("style:", req.style)
    print("=== Generate Request ===")

    provider = settings.LLM_PROVIDER_TEXT_GENERATOR

    length_instruction = _get_length_instruction(req.length)
    style_instruction = _get_style_instruction(req.style)

    system_prompt = f"""###FEATURE:TEXT_GENERATOR###
    You are a Japanese reading material generator.
    Your task is to generate a short Japanese reading text for JLPT {req.level} learners.
    [STRICT OUTPUT RULES]
    - Output must match the response schema exactly.
    - Return valid JSON only.
    - Do not use markdown.
    - Do not add extra fields.
    [CONTENT RULES]
    - Write ONLY in Japanese.
    - The text must be coherent, natural, and readable.
    - Keep the difficulty aligned with JLPT {req.level}.
    - Avoid vocabulary and grammar far above JLPT {req.level}.
    - The text should stay focused on the requested topic.
    - The style must follow the requested writing style.
    [STYLE CONTROL]
    - {style_instruction}
    [LENGTH CONTROL]
    - {length_instruction}
    """.strip()

    user_prompt = f"""
    Generate one Japanese reading passage.
    Topic:
    {req.topic}
    Requirements:
    - JLPT level: {req.level}
    - Style: {req.style}
    - Length: {req.length}, {length_instruction}
    """.strip()

    return call_llm_json(
        provider=provider,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=GenerateTextResponse,
    )


def _get_length_instruction(length: str) -> str:
    if length == "short":
        return "Keep the text short, around 80 to 200 Japanese characters."
    if length == "medium":
        return "Keep the text medium length, around 300 to 500 Japanese characters."
    if length == "long":
        return "Keep the text longer, around 1000 to 1500 Japanese characters."
    return "Keep the text at a reasonable learner-friendly length."


def _get_style_instruction(style: str) -> str:
    if style == "daily":
        return "Use a simple everyday-life style."
    if style == "blog":
        return "Use a light personal blog style."
    if style == "news":
        return "Use a simple news-report style."
    if style == "conversation":
        return "Write mainly as a natural dialogue or conversation."
    if style == "science":
        return "Use a simple explanatory science style for learners."
    return "Use a natural learner-friendly style."
