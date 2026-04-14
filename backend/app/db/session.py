"""Database engine and session helpers."""

from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine
from app.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR.parent / settings.SQLITE_DB_PATH

DATABASE_URL = settings.DATABASE_URL or f"sqlite:///{DB_FILE}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def get_session():
    # FastAPI injects one Session per request through Depends(get_session).
    with Session(engine) as session:
        yield session


def create_db_and_tables() -> None:
    # create_all() creates missing tables from imported SQLModel table classes.
    SQLModel.metadata.create_all(engine)
