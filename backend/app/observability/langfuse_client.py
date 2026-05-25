import logging
import os
from typing import Any

from langfuse import get_client

from app.config import settings

logger = logging.getLogger(__name__)


def _configure_langfuse_environment() -> None:
    """Expose .env-backed settings to the Langfuse SDK before client creation."""
    if settings.LANGFUSE_PUBLIC_KEY:
        os.environ.setdefault("LANGFUSE_PUBLIC_KEY", settings.LANGFUSE_PUBLIC_KEY)
    if settings.LANGFUSE_SECRET_KEY:
        os.environ.setdefault("LANGFUSE_SECRET_KEY", settings.LANGFUSE_SECRET_KEY)
    if settings.LANGFUSE_HOST:
        os.environ.setdefault("LANGFUSE_HOST", settings.LANGFUSE_HOST)
    elif settings.LANGFUSE_BASE_URL:
        os.environ.setdefault("LANGFUSE_HOST", settings.LANGFUSE_BASE_URL)


# Let the SDK read LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, and LANGFUSE_HOST.
_configure_langfuse_environment()
langfuse = get_client()


def record_llm_call(
    service_name: str | None,
    provider: str | None,
    model: str | None,
    system_prompt: str | None,
    user_prompt: str | None,
    response: Any | None,
    *,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    cost: float | None = None,
    llm_duration_ms: int | None = None,
    success: bool = True,
    error_type: str | None = None,
    error_message: str | None = None,
    raw_content: Any | None = None,
) -> None:
    """Record an LLM call to Langfuse with basic metadata."""

    if not settings.LANGFUSE_PUBLIC_KEY:
        return

    metadata = {
        "service": service_name or "unknown",
        "provider": provider or "unknown",
        "success": success,
        "error_type": error_type,
        "error_message": error_message,
        "llm_duration_ms": llm_duration_ms,
        "input_tokens_estimated": True,
    }

    try:
        with langfuse.start_as_current_observation(
            name=f"llm.{service_name or 'unknown'}",
            as_type="generation",
            input={
                "service": service_name,
                "provider": provider,
                "model": model,
                "system_prompt": (system_prompt or "")[:2000],
                "user_prompt": (user_prompt or "")[:2000],
            },
            output=(str(response) if response is not None else "")[:4000],
            metadata=metadata,
            model=model or provider,
            usage_details={
                "input": int(input_tokens or 0),
                "output": int(output_tokens or 0),
            },
            cost_details={"total_cost": float(cost)} if cost is not None else None,
        ) as generation:
            if raw_content is not None and response is None:
                generation.update(output=str(raw_content)[:4000])
    except Exception as exc:
        logger.warning(
            "[Langfuse] failed to record LLM call: %s", exc, exc_info=True
        )


def flush_langfuse() -> None:
    try:
        if not settings.LANGFUSE_PUBLIC_KEY:
            return
        langfuse.flush()
    except Exception:
        pass
