import json
from openai import OpenAI
from app.config import settings
import httpx
from typing import Any
from google import genai
from google.genai import types
from typing import Type
from pydantic import BaseModel

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
                    "surface": "(Mock)練習",
                    "reading": "れんしゅう",
                    "meaning": "practice",
                    "example": "毎日ピアノを練習します。", 
                    "notes": "Appears in study contexts."
                }
            ],
            "grammar": [
                {
                    "pattern": "(Mock)〜てみる",
                    "explanation": "Try doing something.",
                    "example": "やってみる", 
                    "notes": "Often used for attempts."
                }
            ]
        }
    elif cleaned_prompt.startswith("###FEATURE:EXPLAINER###"):
        data = {
            "type": "vocab",
            "surface": "(Mock)把握",
            "reading": "はあく",
            "meaning": "grasp",
            "example": "情報の背景を把握する",
            "notes": "Formal context."
        }
    elif cleaned_prompt.startswith("###FEATURE:TRANSLATOR###"):
        data = {
            "translation": "(Mock) This is a translated text."
        }
    else:
        preview = prompt[:50].replace("\n", " ")
        raise ValueError(
            f"MockProvider Error: No matching feature found in prompt. "
            f"Prompt prefix: [{preview}...]"
        )

    return json.dumps(data, ensure_ascii=False)
    
  

def _call_ollama(prompt: str) -> str:
    print("=== llm ===")
    print("OLLAMA")
    print(settings.OLLAMA_MODEL)
    print("=== llm ===")
    model = settings.OLLAMA_MODEL
    url = "http://127.0.0.1:11434/api/generate"
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,
            "top_p": 0.9,
            "repeat_penalty": 1.1,
            "num_ctx": 4096
        }
    }

    r = httpx.post(url, json=payload, timeout=120)
    r.raise_for_status()
    data = r.json()
    return data["response"]

# use api/chat
def _call_ollama_chat(
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
            "temperature": 0.2,
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
        "temperature": 0.2,
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
        "temperature": 0.2,
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


def call_llm_json(
    *,
    provider: str,
    system_prompt: str,
    user_prompt: str,
    response_model: Type[BaseModel] | None = None,
) -> str:
    schema = None
    if response_model is not None:
        schema = response_model.model_json_schema()

    provider = provider.strip().lower()

    if provider == "mock":
        return _mock_json_output(user_prompt)

    if provider == "ollama":
        return _call_ollama_chat(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_schema=schema,
        )

    if provider == "openai":
        return _call_openai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_schema=schema,
        )

    if provider == "gemini":
        return _call_gemini(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_schema=schema,
        )

    raise ValueError(f"Unknown LLM_PROVIDER: {provider}")
