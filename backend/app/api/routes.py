from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlmodel import Session

from app.db.session import get_session
from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ExplainRequest,
    ExplainResponse,
    ExportPDFRequest,
    GenerateTextRequest,
    GenerateTextResponse,
    ResultSummaryResponse,
    SaveResultRequest,
    SavedResultResponse,
)
from app.services.analyzer import analyze_text
from app.services.explainer import explain_word, explain_sentence
from app.services.pdf_exporter import build_pdf_bytes
from app.services.result_service import ResultService
from app.services.text_generator import generate_text

# Controller layer: receives HTTP requests and delegates actual work to services.
router = APIRouter()
result_service = ResultService()


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
    pdf_bytes = build_pdf_bytes(req.data, req.target_lang)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename={"my-list.pdf"}'},
    )


@router.post("/generate-text", response_model=GenerateTextResponse)
def generate_text_endpoint(req: GenerateTextRequest):
    return generate_text(req)


@router.post("/results", response_model=SavedResultResponse)
def save_result_endpoint(
    req: SaveResultRequest,
    session: Session = Depends(get_session),
):
    return result_service.save_result(session, req)


@router.get("/results", response_model=list[ResultSummaryResponse])
def list_results_endpoint(
    session: Session = Depends(get_session),
):
    return result_service.list_results(session)


@router.get("/results/{result_id}", response_model=SavedResultResponse)
def get_result_detail_endpoint(
    result_id: str,
    session: Session = Depends(get_session),
):
    return result_service.get_result_detail(session, result_id)


@router.delete("/results/{result_id}")
def delete_result_endpoint(
    result_id: str,
    session: Session = Depends(get_session),
):
    return result_service.delete_result(session, result_id)
