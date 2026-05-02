from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlmodel import Session

from app.db.session import get_session
from app.schemas import (
    ArticleHistoryDetailResponse,
    ArticleHistoryItemResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    ExplainRequest,
    ExplainResponse,
    ExportPDFRequest,
    GenerateTextRequest,
    GenerateTextResponse,
    GrammarHistoryItemResponse,
    SaveArticleHistoryRequest,
    VocabHistoryItemResponse,
)
from app.services.analyzer import analyze_text
from app.services.explainer import explain_word, explain_sentence
from app.services.pdf_exporter import build_pdf_bytes
from app.services.history_service import HistoryService
from app.services.text_generator import generate_text

# Controller layer: receives HTTP requests and delegates actual work to services.
router = APIRouter()
history_service = HistoryService()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(req: AnalyzeRequest):
    return analyze_text(req)


@router.post("/explain", response_model=ExplainResponse)
def explain_endpoint(req: ExplainRequest):
    if req.mode == "word":
        return explain_word(req)
    else:
        return explain_sentence(req)


@router.post("/export_pdf")
def export_pdf_endpoint(req: ExportPDFRequest):
    pdf_bytes = build_pdf_bytes(req.text, req.data, req.target_lang)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename={"my-list.pdf"}'},
    )


@router.post("/generate-text", response_model=GenerateTextResponse)
def generate_text_endpoint(req: GenerateTextRequest):
    return generate_text(req)


@router.post("/history/articles", response_model=ArticleHistoryDetailResponse)
def save_article_history_endpoint(
    req: SaveArticleHistoryRequest,
    session: Session = Depends(get_session),
):
    return history_service.save_article_history(session, req)


@router.get("/history/articles", response_model=list[ArticleHistoryItemResponse])
def list_article_history_endpoint(
    session: Session = Depends(get_session),
):
    return history_service.list_article_history(session)


@router.get("/history/articles/search", response_model=list[ArticleHistoryItemResponse])
def search_article_history_endpoint(
    q: str = Query(..., min_length=1),
    session: Session = Depends(get_session),
):
    return history_service.search_article_history(session, q)


@router.get("/history/vocab", response_model=list[VocabHistoryItemResponse])
def list_vocab_history_endpoint(
    session: Session = Depends(get_session),
):
    return history_service.list_vocab_history(session)


@router.get("/history/vocab/search", response_model=list[VocabHistoryItemResponse])
def search_vocab_history_endpoint(
    q: str = Query(..., min_length=1),
    session: Session = Depends(get_session),
):
    return history_service.search_vocab_history(session, q)


@router.get("/history/grammar", response_model=list[GrammarHistoryItemResponse])
def list_grammar_history_endpoint(
    session: Session = Depends(get_session),
):
    return history_service.list_grammar_history(session)


@router.get("/history/grammar/search", response_model=list[GrammarHistoryItemResponse])
def search_grammar_history_endpoint(
    q: str = Query(..., min_length=1),
    session: Session = Depends(get_session),
):
    return history_service.search_grammar_history(session, q)


@router.get("/history/articles/{article_id}", response_model=ArticleHistoryDetailResponse)
def get_article_history_detail_endpoint(
    article_id: str,
    session: Session = Depends(get_session),
):
    return history_service.get_article_history_detail(session, article_id)


@router.delete("/history/articles/{article_id}")
def delete_article_history_endpoint(
    article_id: str,
    session: Session = Depends(get_session),
):
    return history_service.delete_article_history(session, article_id)
