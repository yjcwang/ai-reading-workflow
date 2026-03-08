import json
from openai import OpenAI
import google.generativeai as genai
from app.config import settings
import httpx

import json

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

def _call_openai(prompt: str) -> str:
    print("=== llm ===")
    print("OPENAI")
    print(settings.OPENAI_MODEL)
    print("=== llm ===")
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    resp = client.chat.completions.create(
        model=settings.OPENAI_MODEL, 
        messages=[
            {"role": "system", "content": "You must output valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    return resp.choices[0].message.content

def _call_gemini(prompt: str) -> str:
    print("=== llm ===")
    print("GEMINI")
    print(settings.GEMINI_MODEL)
    print("=== llm ===")
    genai.configure(api_key=settings.GEMINI_API_KEY)

    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL 
    )

    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "top_p": 0.9,
        }
    )

    return response.text


def call_llm_json(prompt: str, provider: str) -> str:
    
    if provider == "mock":
        return _mock_json_output(prompt)
    
    if provider == "ollama":
        return _call_ollama(prompt)

    if provider == "openai":
        return _call_openai(prompt)

    if provider == "gemini":
        return _call_gemini(prompt)

    raise ValueError(f"Unknown LLM_PROVIDER: {provider}")
