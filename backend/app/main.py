import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import router
from app.db.init_db import init_db
from app.db.session import DATABASE_URL
from app.models import Grammar, Result, Vocab  # noqa: F401

logger = logging.getLogger(__name__)

app = FastAPI(title="JP Reading Assistant API", version="0.1.0")


def _get_allowed_origins() -> list[str]:
    return [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]


@app.on_event("startup")
def on_startup() -> None:
    logger.warning("Startup begin")
    logger.warning("Database URL: %s", DATABASE_URL)
    init_db()
    logger.warning("Startup complete")


app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["API"])


@app.get("/health")
def health():
    return {"status": "ok"}
