from typing import Literal
from pydantic_settings import BaseSettings

# entrance to get env setting (e.g OpenAI key, temperature)

class Settings(BaseSettings):
    LLM_PROVIDER_ANALYZER: Literal["openai", "gemini", "mock", "ollama", "deepseek"] = "gemini"
    LLM_PROVIDER_EXPLAINER: Literal["openai", "gemini", "mock", "ollama", "deepseek"] = "ollama"
    LLM_PROVIDER_TRANSLATOR: Literal["openai", "gemini", "mock", "ollama", "deepseek"] = "ollama"
    LLM_PROVIDER_TEXT_GENERATOR: Literal["openai", "gemini", "mock", "ollama", "deepseek"] = "ollama"

    OLLAMA_MODEL: str = "qwen2.5:7b"

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-3-flash-preview"

    DEEPSEEK_API_KEY: str | None = None
    DEEPSEEK_MODEL: str = "deepseek-chat"

    DATABASE_URL: str | None = None
    SQLITE_DB_PATH: str = "app/app.db"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    

    class Config:
        env_file = ".env"

settings = Settings()
 
 
