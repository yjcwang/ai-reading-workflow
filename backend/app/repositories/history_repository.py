"""Data access helpers for history records."""

from sqlmodel import Session, select

from app.models.history_models import ArticleHistory, GrammarHistory, VocabHistory


class HistoryRepository:
    # Repository layer handles raw database reads and writes only.
    def create_article_history(
        self,
        session: Session,
        *,
        text: str,
        level: str,
        title: str | None,
    ) -> ArticleHistory:
        article = ArticleHistory(
            text=text,
            level=level,
            title=title,
        )
        session.add(article)
        # flush() pushes the INSERT now so article.id is available before commit().
        session.flush()
        session.refresh(article)
        return article

    def create_vocab_history_items(
        self,
        session: Session,
        *,
        article_id: str,
        vocab_items: list[dict],
    ) -> list[VocabHistory]:
        rows: list[VocabHistory] = []

        for item in vocab_items:
            row = VocabHistory(
                # result_id is the existing DB column name for the source article history id.
                result_id=article_id,
                expression=item["expression"],
                reading=item.get("reading"),
                definition=item["definition"],
                example=item.get("example"),
            )
            rows.append(row)

        session.add_all(rows)
        session.flush()
        return rows

    def create_grammar_history_items(
        self,
        session: Session,
        *,
        article_id: str,
        grammar_items: list[dict],
    ) -> list[GrammarHistory]:
        rows: list[GrammarHistory] = []

        for item in grammar_items:
            row = GrammarHistory(
                # result_id is the existing DB column name for the source article history id.
                result_id=article_id,
                expression=item["expression"],
                definition=item["definition"],
                example=item.get("example"),
            )
            rows.append(row)

        session.add_all(rows)
        session.flush()
        return rows
    
    # SELECT * FROM results WHERE id = ?
    def get_article_history_by_id(self, session: Session, article_id: str) -> ArticleHistory | None:
        statement = select(ArticleHistory).where(ArticleHistory.id == article_id)
        return session.exec(statement).first()

    def list_article_history(self, session: Session) -> list[ArticleHistory]:
        statement = select(ArticleHistory).order_by(ArticleHistory.created_at.desc())
        return list(session.exec(statement).all())

    def list_vocab_history(self, session: Session) -> list[tuple[VocabHistory, ArticleHistory]]:
        statement = (
            select(VocabHistory, ArticleHistory)
            .join(ArticleHistory, VocabHistory.result_id == ArticleHistory.id)
            .order_by(ArticleHistory.created_at.desc())
        )
        return list(session.exec(statement).all())

    def list_grammar_history(self, session: Session) -> list[tuple[GrammarHistory, ArticleHistory]]:
        statement = (
            select(GrammarHistory, ArticleHistory)
            .join(ArticleHistory, GrammarHistory.result_id == ArticleHistory.id)
            .order_by(ArticleHistory.created_at.desc())
        )
        return list(session.exec(statement).all())

    # SELECT * FROM vocab_items WHERE result_id = ?
    def list_vocab_history_by_article_id(self, session: Session, article_id: str) -> list[VocabHistory]:
        # result_id is the existing DB column name for the source article history id.
        statement = select(VocabHistory).where(VocabHistory.result_id == article_id)
        return list(session.exec(statement).all())

    # SELECT * FROM grammar_items WHERE result_id = ?
    def list_grammar_history_by_article_id(self, session: Session, article_id: str) -> list[GrammarHistory]:
        # result_id is the existing DB column name for the source article history id.
        statement = select(GrammarHistory).where(GrammarHistory.result_id == article_id)
        return list(session.exec(statement).all())

    def delete_article_history(self, session: Session, article: ArticleHistory) -> None:
        # Child rows are deleted first 
        vocab_items = self.list_vocab_history_by_article_id(session, article.id)
        grammar_items = self.list_grammar_history_by_article_id(session, article.id)

        for item in vocab_items:
            session.delete(item)

        for item in grammar_items:
            session.delete(item)

        session.delete(article)
        session.flush()
