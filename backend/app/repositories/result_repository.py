"""Data access helpers for result records."""

from sqlmodel import Session, select

from app.models.result_models import Grammar, Result, Vocab


class ResultRepository:
    # Repository layer handles raw database reads and writes only.
    def create_result(
        self,
        session: Session,
        *,
        text: str,
        level: str,
        title: str | None,
    ) -> Result:
        result = Result(
            text=text,
            level=level,
            title=title,
        )
        session.add(result)
        # flush() pushes the INSERT now so result.id is available before commit().
        session.flush()
        session.refresh(result)
        return result

    def create_vocab_items(
        self,
        session: Session,
        *,
        result_id: str,
        vocab_items: list[dict],
    ) -> list[Vocab]:
        rows: list[Vocab] = []

        for item in vocab_items:
            row = Vocab(
                result_id=result_id,
                expression=item["expression"],
                reading=item.get("reading"),
                definition=item["definition"],
                example=item.get("example"),
            )
            rows.append(row)

        session.add_all(rows)
        session.flush()
        return rows

    def create_grammar_items(
        self,
        session: Session,
        *,
        result_id: str,
        grammar_items: list[dict],
    ) -> list[Grammar]:
        rows: list[Grammar] = []

        for item in grammar_items:
            row = Grammar(
                result_id=result_id,
                expression=item["expression"],
                definition=item["definition"],
                example=item.get("example"),
            )
            rows.append(row)

        session.add_all(rows)
        session.flush()
        return rows
    
    # SELECT * FROM results WHERE id = ?
    def get_result_by_id(self, session: Session, result_id: str) -> Result | None:
        statement = select(Result).where(Result.id == result_id)
        return session.exec(statement).first()

    def list_results(self, session: Session) -> list[Result]:
        statement = select(Result).order_by(Result.created_at.desc())
        return list(session.exec(statement).all())

    # SELECT * FROM vocab_items WHERE result_id = ?
    def list_vocab_by_result_id(self, session: Session, result_id: str) -> list[Vocab]:
        statement = select(Vocab).where(Vocab.result_id == result_id)
        return list(session.exec(statement).all())

    # SELECT * FROM grammar_items WHERE result_id = ?
    def list_grammar_by_result_id(self, session: Session, result_id: str) -> list[Grammar]:
        statement = select(Grammar).where(Grammar.result_id == result_id)
        return list(session.exec(statement).all())

    def delete_result(self, session: Session, result: Result) -> None:
        # Child rows are deleted first 
        vocab_items = self.list_vocab_by_result_id(session, result.id)
        grammar_items = self.list_grammar_by_result_id(session, result.id)

        for item in vocab_items:
            session.delete(item)

        for item in grammar_items:
            session.delete(item)

        session.delete(result)
        session.flush()
