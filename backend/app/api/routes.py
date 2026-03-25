from fastapi import APIRouter
from fastapi.responses import Response
from app.schemas import AnalyzeRequest, AnalyzeResponse, ExplainRequest, ExplainResponse, ExportPDFRequest, GenerateTextRequest, GenerateTextResponse
from app.services.analyzer import analyze_text
from app.services.explainer import explain_word, explain_sentence
from app.services.pdf_exporter import build_pdf_bytes
from app.services.text_generator import generate_text

# controller layer, engage service

router = APIRouter()

# AnalyzeRequest, AnalyzeResponse are two Pydantic objects defined in schemas, to constraint in- and output format
@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(req: AnalyzeRequest):
    return analyze_text(req)

@router.post("/explain", response_model=ExplainResponse)
def explain_endpoint(req: ExplainRequest):
    if req.mode == "word": return explain_word(req)
    else: return explain_sentence(req)

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


