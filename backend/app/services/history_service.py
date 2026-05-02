"""Business logic for history operations."""

import logging

from fastapi import HTTPException
from sqlmodel import Session

from app.repositories.history_repository import HistoryRepository
from app.schemas import (
    ArticleHistoryDetailResponse,
    ArticleHistoryGrammarItem,
    ArticleHistoryItemResponse,
    ArticleHistoryVocabItem,
    GrammarHistoryItemResponse,
    SaveArticleHistoryRequest,
    VocabHistoryItemResponse,
)
from app.services.title_generator import generate_title_from_text

logger = logging.getLogger(__name__)


class HistoryService:
    def __init__(self, repository: HistoryRepository | None = None) -> None:
        self.repository = repository or HistoryRepository()

    def save_article_history(
        self,
        session: Session,
        req: SaveArticleHistoryRequest,
    ) -> ArticleHistoryDetailResponse:
        try:
            title = generate_title_from_text(text=req.text, level=req.level)
        except Exception:
            logger.exception("Failed to generate title for saved result")
            title = self._build_fallback_title(req.text)

        # Save the parent row first so its id can be used by child vocab/grammar rows.
        article = self.repository.create_article_history(
            session,
            text=req.text,
            level=req.level,
            title=title,
        )

        self.repository.create_vocab_history_items(
            session,
            article_id=article.id,
            vocab_items=[item.model_dump() for item in req.vocab],
        )

        self.repository.create_grammar_history_items(
            session,
            article_id=article.id,
            grammar_items=[item.model_dump() for item in req.grammar],
        )

        # Commit once so the whole save operation succeeds or fails as one transaction.
        session.commit()
        session.refresh(article)

        return ArticleHistoryDetailResponse(
            id=article.id,
            text=article.text,
            level=article.level,
            created_at=article.created_at,
            title=article.title,
            vocab=req.vocab,
            grammar=req.grammar,
        )

    def list_article_history(self, session: Session) -> list[ArticleHistoryItemResponse]:
        articles = self.repository.list_article_history(session)

        return [
            ArticleHistoryItemResponse(
                id=item.id,
                text=item.text,
                level=item.level,
                created_at=item.created_at,
                title=item.title,
            )
            for item in articles
        ]

    def list_vocab_history(self, session: Session) -> list[VocabHistoryItemResponse]:
        rows = self.repository.list_vocab_history(session)

        return [
            VocabHistoryItemResponse(
                id=vocab.id,
                result_id=result.id,
                expression=vocab.expression,
                reading=vocab.reading,
                definition=vocab.definition,
                example=vocab.example,
                source_title=result.title,
                source_text_preview=self._build_text_preview(result.text),
                source_level=result.level,
                source_created_at=result.created_at,
            )
            for vocab, result in rows
        ]

    def list_grammar_history(self, session: Session) -> list[GrammarHistoryItemResponse]:
        rows = self.repository.list_grammar_history(session)

        return [
            GrammarHistoryItemResponse(
                id=grammar.id,
                result_id=result.id,
                expression=grammar.expression,
                definition=grammar.definition,
                example=grammar.example,
                source_title=result.title,
                source_text_preview=self._build_text_preview(result.text),
                source_level=result.level,
                source_created_at=result.created_at,
            )
            for grammar, result in rows
        ]

    def get_article_history_detail(
        self,
        session: Session,
        article_id: str,
    ) -> ArticleHistoryDetailResponse:
        article = self.repository.get_article_history_by_id(session, article_id)
        if not article:
            raise HTTPException(status_code=404, detail="Article history not found")

        # Repository returns ORM rows; service maps them into API response schemas.
        vocab_items = self.repository.list_vocab_history_by_article_id(session, article_id)
        grammar_items = self.repository.list_grammar_history_by_article_id(session, article_id)

        return ArticleHistoryDetailResponse(
            id=article.id,
            text=article.text,
            level=article.level,
            created_at=article.created_at,
            title=article.title,
            vocab=[
                ArticleHistoryVocabItem(
                    expression=item.expression,
                    reading=item.reading,
                    definition=item.definition,
                    example=item.example,
                )
                for item in vocab_items
            ],
            grammar=[
                ArticleHistoryGrammarItem(
                    expression=item.expression,
                    definition=item.definition,
                    example=item.example,
                )
                for item in grammar_items
            ],
        )

    def delete_article_history(self, session: Session, article_id: str) -> dict[str, str]:
        article = self.repository.get_article_history_by_id(session, article_id)
        if not article:
            raise HTTPException(status_code=404, detail="Article history not found")

        self.repository.delete_article_history(session, article)
        session.commit()

        return {"status": "ok"}

    def _build_fallback_title(self, text: str, max_length: int = 20) -> str:
        compact = " ".join(text.split()).strip()
        if len(compact) <= max_length:
            return compact
        return compact[:max_length].rstrip() + "..."

    def _build_text_preview(self, text: str, max_length: int = 120) -> str:
        compact = " ".join(text.split()).strip()
        if len(compact) <= max_length:
            return compact
        return compact[:max_length].rstrip() + "..."
