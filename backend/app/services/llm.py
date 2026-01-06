import json
from openai import OpenAI
import google.generativeai as genai
from app.config import settings
import httpx

def _mock_json_output(prompt: str) -> str:
    return json.dumps({
        "vocab": [
            {"surface": "(Mock) 練習", "reading": "れんしゅう", "meaning_en": "practice", "why": "Appears in study contexts; high frequency."},
            {"surface": "(Mock) 助言", "reading": "じょげん", "meaning_en": "advice", "why": "Common in academic/work settings."}
        ],
        "grammar": [
            {"pattern": "(Mock) 〜てみる", "explanation_en": "Try doing something.", "example_from_text": "（例）やってみる", "notes": "Often used for attempts."}
        ]
    }, ensure_ascii=False)

def _call_ollama(prompt: str) -> str:
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


def call_llm_json(prompt: str) -> str:
    provider = settings.LLM_PROVIDER # donot use os.getenv

    print("=== llm ===")
    print(provider)
    print("=== llm ===")

    if provider == "mock":
        return _mock_json_output(prompt)
    
    if provider == "ollama":
        return _call_ollama(prompt)

    if provider == "openai":
        return _call_openai(prompt)

    if provider == "gemini":
        return _call_gemini(prompt)

    raise ValueError(f"Unknown LLM_PROVIDER: {provider}")
