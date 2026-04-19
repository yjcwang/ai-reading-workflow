"""Result SQLModel table definitions."""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from sqlmodel import Field, Relationship, SQLModel


def generate_uuid() -> str:
    return str(uuid4())


class Result(SQLModel, table=True):
    # Parent table: one saved reading result.
    __tablename__ = "results"

    id: str = Field(default_factory=generate_uuid, primary_key=True, index=True)
    text: str
    level: str = Field(index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    title: Optional[str] = None

    # Relationship fields make it possible to navigate related rows in Python.
    vocab_items: List["Vocab"] = Relationship(back_populates="result")
    grammar_items: List["Grammar"] = Relationship(back_populates="result")


class Vocab(SQLModel, table=True):
    # Child table: each row belongs to one Result through result_id.
    __tablename__ = "vocab_items"

    id: str = Field(default_factory=generate_uuid, primary_key=True, index=True)
    result_id: str = Field(foreign_key="results.id", index=True)

    expression: str = Field(index=True)
    reading: Optional[str] = None
    definition: str
    example: Optional[str] = None

    result: Optional["Result"] = Relationship(back_populates="vocab_items")


class Grammar(SQLModel, table=True):
    # Child table: each row belongs to one Result through result_id.
    __tablename__ = "grammar_items"

    id: str = Field(default_factory=generate_uuid, primary_key=True, index=True)
    result_id: str = Field(foreign_key="results.id", index=True)

    expression: str = Field(index=True)
    definition: str
    example: Optional[str] = None

    result: Optional["Result"] = Relationship(back_populates="grammar_items")
