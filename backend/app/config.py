from pydantic_settings import BaseSettings
from typing import Literal

# entrance to get env setting (e.g OpenAI key, temperature)

class Settings(BaseSettings):
    LLM_PROVIDER_ANALYZER: Literal["openai", "gemini", "mock", "ollama"] = "gemini"
    LLM_PROVIDER_EXPLAINER: Literal["openai", "gemini", "mock", "ollama"] = "ollama"

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-3-flash-preview"

    OLLAMA_MODEL: str = "qwen2.5:7b"

    class Config:
        env_file = ".env"

settings = Settings()
 
 