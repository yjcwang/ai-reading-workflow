from fastapi import APIRouter
from fastapi.responses import Response
from app.schemas import AnalyzeRequest, AnalyzeResponse, ExplainRequest, ExplainResponse
from app.services.analyzer import analyze_text
from app.services.explainer import explain_selection
from app.services.pdf_exporter import build_pdf_bytes

# controller layer, engage service

router = APIRouter()

# AnalyzeRequest, AnalyzeResponse are two Pydantic objects defined in schemas, to constraint in- and output format
@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(req: AnalyzeRequest):
    return analyze_text(req)

@router.post("/explain", response_model=ExplainResponse)
def explain_endpoint(req: ExplainRequest):
    return explain_selection(req)

@router.post("/export_pdf")
def export_pdf_endpoint(req: AnalyzeResponse):
    pdf_bytes = build_pdf_bytes(req)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="my-list.pdf"'},
    )


