import json
from openai import OpenAI
import google.generativeai as genai
from app.config import settings
import httpx

import json

def _mock_json_output(prompt: str) -> str:
    print("=== llm ===")
    print("MOCK (AnalyzeResponse)")
    print("=== llm ===")
    
    # 按照 AnalyzeResponse 的结构组织数据
    mock_data = {
        "vocab": [
            {
                "surface": "(Mock) 練習",
                "reading": "れんしゅう",
                "meaning_en": "practice",
                "example": "毎日ピアノを練習します。",  # 新 Schema 中的必填项
                "notes": "Appears in study contexts; high frequency." # 原 why 改为 notes
            },
            {
                "surface": "(Mock) 助言",
                "reading": "じょげん",
                "meaning_en": "advice",
                "example": "先生から助言をもらいました。",
                "notes": "Common in academic/work settings."
            }
        ],
        "grammar": [
            {
                "pattern": "(Mock) 〜てみる",
                "explanation_en": "Try doing something.",
                "example": "やってみる", # 原 example_from_text 改为 example
                "notes": "Often used for attempts."
            }
        ]
    }

    return json.dumps(mock_data, ensure_ascii=False)

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
