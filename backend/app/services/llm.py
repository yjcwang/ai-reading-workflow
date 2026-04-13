import json
from openai import OpenAI
from app.config import settings
import httpx
from typing import Any
from google import genai
from google.genai import types
from typing import Type, TypeVar, Any, Callable, Dict
from pydantic import BaseModel, ValidationError
import logging
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)
from app.services.utils import extract_json

def _mock_json_output(prompt: str) -> str:

    print("=== llm ===")
    print("MOCK")
    print("=== llm ===")

    cleaned_prompt = prompt.strip()
    # use ###FEATURE:### to distinguish between different service to generate correct response
    if cleaned_prompt.startswith("###FEATURE:ANALYZER###"):
        data = {
            "vocab": [
                {
                    "expression": "(Mock)練習",
                    "reading": "れんしゅう",
                    "definition": "practice",
                    "example": "毎日ピアノを練習します。", 
                    "notes": "Appears in study contexts."
                }
            ],
            "grammar": [
                {
                    "expression": "(Mock)〜てみる",
                    "definition": "Try doing something.",
                    "example": "やってみる", 
                    "notes": "Often used for attempts."
                }
            ]
        }
    elif cleaned_prompt.startswith("###FEATURE:EXPLAINER###"):
        data = {
            "type": "vocab",
            "expression": "(Mock)把握",
            "reading": "はあく",
            "definition": "grasp",
            "example": "情報の背景を把握する",
            "notes": "Formal context."
        }
    elif cleaned_prompt.startswith("###FEATURE:TRANSLATOR###"):
        data = {
            "translation": "(Mock) This is a translated text."
        }
    elif cleaned_prompt.startswith("###FEATURE:TEXT_GENERATOR###"):
        data = {
            "text": "(Mock) 近年、情報へのアクセスはかつてないほど容易になった一方で 表面的な理解にとどまってしまうケースも増えているように感じる。"
        }
    elif cleaned_prompt.startswith("###FEATURE:TITLE_GENERATOR###"):
        data = {
            "title": "(Mock) Saved Reading Title"
        }
    else:
        preview = prompt[:50].replace("\n", " ")
        raise ValueError(
            f"MockProvider Error: No matching feature found in prompt. "
            f"Prompt prefix: [{preview}...]"
        )

    return json.dumps(data, ensure_ascii=False)
    
# use api/chat
def _call_ollama(
    *,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
) -> str:
    print("=== llm ===")
    print("OLLAMA")
    print(settings.OLLAMA_MODEL)
    print("=== llm ===")

    model = settings.OLLAMA_MODEL
    url = "http://127.0.0.1:11434/api/chat"

    payload: dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {
            "temperature": 0.1,
            "top_p": 0.9,
            "repeat_penalty": 1.1,
            "num_ctx": 4096,
        },
        "keep_alive": "10m",
    }

    if response_schema is not None:
        payload["format"] = response_schema
    else:
        payload["format"] = "json"

    timeout = httpx.Timeout(connect=5.0, read=180.0, write=10.0, pool=5.0)

    r = httpx.post(url, json=payload, timeout=timeout)
    r.raise_for_status()

    data = r.json()

    print("=== OLLAMA METRICS ===")
    nano_to_sec = 1_000_000_000
    print("total_duration:", data.get("total_duration") / nano_to_sec)
    print("load_duration:", data.get("load_duration") / nano_to_sec)
    print("prompt_eval_count:", data.get("prompt_eval_count"))
    print("eval_count:", data.get("eval_count"))

    return data["message"]["content"]

# TODO: this is not yet tested
def _call_openai(
    *,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
) -> str:
    print("=== llm ===")
    print("OPENAI")
    print(settings.OPENAI_MODEL)
    print("=== llm ===")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    request_kwargs: dict[str, Any] = {
        "model": settings.OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.1,
    }

    if response_schema is not None:
        request_kwargs["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": "analyze_response",
                "schema": response_schema,
            },
        }

    resp = client.chat.completions.create(**request_kwargs)

    content = resp.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned empty content")

    return content

# TODO: this is not yet tested
def _call_gemini(
    *,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
) -> str:
    print("=== llm ===")
    print("GEMINI")
    print(settings.GEMINI_MODEL)
    print("=== llm ===")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    config_kwargs: dict[str, Any] = {
        "temperature": 0.1,
        "top_p": 0.9,
        "system_instruction": system_prompt,
    }

    if response_schema is not None:
        config_kwargs["response_mime_type"] = "application/json"
        config_kwargs["response_schema"] = response_schema
    else:
        config_kwargs["response_mime_type"] = "application/json"

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=user_prompt,
        config=types.GenerateContentConfig(**config_kwargs),
    )

    if not response.text:
        raise ValueError("Gemini returned empty content")

    return response.text

def _call_deepseek(
    *,
    system_prompt: str,
    user_prompt: str,
    response_schema: dict[str, Any] | None = None,
) -> str:
    print("=== llm ===")
    print("DEEPSEEK")
    print(settings.DEEPSEEK_MODEL)
    print("=== llm ===")

    client = OpenAI(
        api_key=settings.DEEPSEEK_API_KEY,
        base_url="https://api.deepseek.com"
    )

    # deepseek API doesn't support direct json schema, thus this need to be injected into system prompt
    full_system_prompt = system_prompt
    if response_schema:
        schema_str = json.dumps(response_schema, ensure_ascii=False, indent=2)
        full_system_prompt += f"\n\nReturn a JSON object that strictly follows this schema:\n{schema_str}"

    request_kwargs: dict[str, Any] = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": full_system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.1, 
        "response_format": {"type": "json_object"} 
    }

    response = client.chat.completions.create(**request_kwargs)
    return response.choices[0].message.content



logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

LLM_STRATEGY_MAP: Dict[str, Callable] = {
    "mock": _mock_json_output,
    "ollama": _call_ollama,
    "openai": _call_openai,
    "gemini": _call_gemini,
    "deepseek": _call_deepseek,
}

@retry(
    # Case1: Network error
    # Case2: Pydantic Validation error
    # Case3: Invalid json
    retry=retry_if_exception_type((httpx.HTTPError, ValidationError, ValueError)),
    stop=stop_after_attempt(3), 
    wait=wait_exponential(multiplier=1, min=2, max=10), # Expontential Backoff: 2s, 4s, 8s...
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True
)
def call_llm_with_retry(
    *,
    provider: str,
    system_prompt: str,
    user_prompt: str,
    response_model: Type[T],
) -> T:
    
    schema = None
    if response_model is not None:
        schema = response_model.model_json_schema()

    provider = provider.strip().lower()

    handler = LLM_STRATEGY_MAP.get(provider)
    
    # Find provider in dictionary
    if not handler:
        valid_providers = ", ".join(LLM_STRATEGY_MAP.keys())
        raise ValueError(
            f"Unsupported LLM provider: '{provider}'. "
            f"Supported providers are: [{valid_providers}]"
        )

    # Engage llm caller function
    if provider == "mock":
        raw_content = handler(system_prompt)
    
    else: raw_content = handler(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_schema=schema,
    )

    print("=== RAW FROM LLM START ===")
    print(raw_content)
    print("=== RAW FROM LLM END ===")

    # Try extract JSON
    try:
        data = extract_json(raw_content)
    except Exception as e:
        logger.error(f"Failed to extract JSON from LLM response: {raw_content}")
        raise ValueError("Invalid JSON format") from e

    # Pydantic Validation
    try:
        validated_data = response_model(**data)
        return validated_data
    except ValidationError as e:
        logger.error(f"LLM output schema mismatch. Provider: {provider}, Error: {e}")
        raise e


def call_llm_json(
    *,
    provider: str,
    system_prompt: str,
    user_prompt: str,
    response_model: Type[T],
) -> T:
    return call_llm_with_retry(
        provider=provider,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_model=response_model
    )
