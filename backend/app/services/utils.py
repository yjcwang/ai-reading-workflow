import json

def extract_json(raw: str) -> dict:
    # make sure valid json extracted
    if not raw or not raw.strip():
        raise ValueError("LLM returned empty output")

    s = raw.strip()

    # remove ```json ``` 
    if s.startswith("```"):
        s = s.strip("`")

    start = s.find("{")
    end = s.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"No JSON object found in LLM output:\n{s}")

    return json.loads(s[start:end+1])

LANGUAGE_NAMES = {
    "en": "English",
    "zh": "Chinese",
}

def get_full_language_name(lang_code: str) -> str:
    return LANGUAGE_NAMES.get(lang_code.lower(), "English")