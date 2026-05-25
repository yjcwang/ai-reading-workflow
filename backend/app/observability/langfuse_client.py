import logging
import os
from contextlib import nullcontext
from contextlib import AbstractContextManager
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


def start_llm_generation(
    *,
    service_name: str | None,
    provider: str | None,
    model: str | None,
    system_prompt: str | None,
    user_prompt: str | None,
) -> AbstractContextManager[Any | None]:
    """Create a Langfuse generation that wraps the provider request."""
    if not settings.LANGFUSE_PUBLIC_KEY:
        return nullcontext(None)

    return langfuse.start_as_current_observation(
        name=f"llm.{service_name or 'unknown'}",
        as_type="generation",
        input={
            "service": service_name,
            "provider": provider,
            "model": model,
            "system_prompt": (system_prompt or "")[:2000],
            "user_prompt": (user_prompt or "")[:2000],
        },
        metadata={
            "service": service_name or "unknown",
            "provider": provider or "unknown",
            "model": model or provider or "unknown",
            "success": None,
            "input_tokens_estimated": True,
        },
        model=model or provider,
    )


def flush_langfuse() -> None:
    try:
        if not settings.LANGFUSE_PUBLIC_KEY:
            return
        langfuse.flush()
    except Exception as exc:
        logger.warning("[Langfuse] failed to flush: %s", exc, exc_info=True)
