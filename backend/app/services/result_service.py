"""Business logic for result operations."""

from fastapi import HTTPException
from sqlmodel import Session

from app.repositories.result_repository import ResultRepository
from app.schemas import (
    ResultSummaryResponse,
    SaveResultRequest,
    SavedGrammarItem,
    SavedResultResponse,
    SavedVocabItem,
)


class ResultService:
    def __init__(self, repository: ResultRepository | None = None) -> None:
        self.repository = repository or ResultRepository()

    def save_result(self, session: Session, req: SaveResultRequest) -> SavedResultResponse:
        # Save the parent row first so its id can be used by child vocab/grammar rows.
        result = self.repository.create_result(
            session,
            text=req.text,
            level=req.level,
            title=req.title,
        )

        self.repository.create_vocab_items(
            session,
            result_id=result.id,
            vocab_items=[item.model_dump() for item in req.vocab],
        )

        self.repository.create_grammar_items(
            session,
            result_id=result.id,
            grammar_items=[item.model_dump() for item in req.grammar],
        )

        # Commit once so the whole save operation succeeds or fails as one transaction.
        session.commit()
        session.refresh(result)

        return SavedResultResponse(
            id=result.id,
            text=result.text,
            level=result.level,
            created_at=result.created_at,
            title=result.title,
            vocab=req.vocab,
            grammar=req.grammar,
        )

    def list_results(self, session: Session) -> list[ResultSummaryResponse]:
        results = self.repository.list_results(session)

        return [
            ResultSummaryResponse(
                id=item.id,
                text=item.text,
                level=item.level,
                created_at=item.created_at,
                title=item.title,
            )
            for item in results
        ]

    def get_result_detail(self, session: Session, result_id: str) -> SavedResultResponse:
        result = self.repository.get_result_by_id(session, result_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")

        # Repository returns ORM rows; service maps them into API response schemas.
        vocab_items = self.repository.list_vocab_by_result_id(session, result_id)
        grammar_items = self.repository.list_grammar_by_result_id(session, result_id)

        return SavedResultResponse(
            id=result.id,
            text=result.text,
            level=result.level,
            created_at=result.created_at,
            title=result.title,
            vocab=[
                SavedVocabItem(
                    expression=item.expression,
                    reading=item.reading,
                    definition=item.definition,
                    example=item.example,
                )
                for item in vocab_items
            ],
            grammar=[
                SavedGrammarItem(
                    expression=item.expression,
                    definition=item.definition,
                    example=item.example,
                )
                for item in grammar_items
            ],
        )

    def delete_result(self, session: Session, result_id: str) -> dict[str, str]:
        result = self.repository.get_result_by_id(session, result_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")

        self.repository.delete_result(session, result)
        session.commit()

        return {"status": "ok"}
