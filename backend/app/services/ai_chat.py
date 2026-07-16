import json

from app.config import settings
from app.schemas import AskAIRequest, AskAIResponse
from app.services.llm import call_llm_json
from app.services.utils import get_full_language_name


def answer_ai_chat(req: AskAIRequest) -> AskAIResponse:
    """Answer a short learner question using the current article context."""
    target_lang_full = get_full_language_name(req.target_lang)
    provider = settings.LLM_PROVIDER_AI_CHAT
    history = "\n".join(
        f"{message.role}: {message.content}" for message in req.messages[-8:]
    )

    context_payload = json.dumps(
        req.context_payload or {},
        ensure_ascii=False,
        indent=2,
    )
    analysis_payload = req.analysis.model_dump_json(indent=2)

    system_prompt = f"""###FEATURE:AI_CHAT###
    You are a concise Japanese reading tutor.
    Answer EXCLUSIVELY in {target_lang_full}.
    Keep answers short: 1-4 sentences unless the user asks for details.
    Use JLPT {req.level} as the learner level.
    Stay grounded in the provided article, analysis, and active context.
    Return JSON with exactly this shape: {{"answer": "..."}}.
    """.strip()

    user_prompt = f"""
    Active context type:
    {req.context_type}

    Active context payload:
    {context_payload}

    Article text:
    {req.article_text}

    Analysis:
    {analysis_payload}

    Recent chat:
    {history}

    User question:
    {req.question}
    """.strip()

    return call_llm_json(
        provider=provider,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=AskAIResponse,
        service_name="ai_chat",
    )
