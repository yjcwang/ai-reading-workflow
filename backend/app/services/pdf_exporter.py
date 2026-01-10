from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from pathlib import Path
from app.schemas import AnalyzeResponse

FONT_NAME = "NotoSansJP"

def _register_font_once():
    # 用相对当前文件的路径，避免你从不同目录启动导致找不到字体
    font_path = Path(__file__).resolve().parents[1] / "assets" / "fonts" / "NotoSansJP-Regular.ttf"
    if not font_path.exists():
        raise FileNotFoundError(f"Font not found: {font_path}")

    try:
        pdfmetrics.getFont(FONT_NAME)
    except KeyError:
        pdfmetrics.registerFont(TTFont(FONT_NAME, str(font_path)))

def _draw_wrapped(c: canvas.Canvas, text: str, x: int, y0: int, max_width: int, font_size: int = 10, line_h: int = 14):
    """
    简单按字符换行（对日文/中文/英文都够用）
    返回写完后的 y
    """
    c.setFont(FONT_NAME, font_size)
    y = y0
    cur = ""
    for ch in text:
        test = cur + ch
        if pdfmetrics.stringWidth(test, FONT_NAME, font_size) <= max_width:
            cur = test
        else:
            c.drawString(x, y, cur)
            y -= line_h
            cur = ch
    if cur:
        c.drawString(x, y, cur)
        y -= line_h
    return y

def build_pdf_bytes(data: AnalyzeResponse) -> bytes:
    _register_font_once()

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    margin_x = 40
    y = height - 50

    def new_page():
        nonlocal y
        c.showPage()
        c.setFont(FONT_NAME, 10)
        y = height - 50

    # 标题
    c.setFont(FONT_NAME, 16)
    c.drawString(margin_x, y, "My List Export")
    y -= 24

    c.setFont(FONT_NAME, 10)
    c.drawString(margin_x, y, f"Vocab: {len(data.vocab)} · Grammar: {len(data.grammar)}")
    y -= 24

    # Vocabulary
    c.setFont(FONT_NAME, 12)
    c.drawString(margin_x, y, "Vocabulary")
    y -= 18

    for i, v in enumerate(data.vocab, start=1):
        if y < 90:
            new_page()

        title = f"{i}. {v.surface}"
        if v.reading:
            title += f" ({v.reading})"

        c.setFont(FONT_NAME, 11)
        c.drawString(margin_x, y, title)
        y -= 16

        y = _draw_wrapped(c, f"Meaning: {v.meaning_en}", margin_x + 10, y, max_width=520)

        if v.example:
            y = _draw_wrapped(c, f"Example: {v.example}", margin_x + 10, y, max_width=520)

        if v.notes:
            y = _draw_wrapped(c, f"Notes: {v.notes}", margin_x + 10, y, max_width=520)

        y -= 8

    y -= 10
    if y < 120:
        new_page()

    # Grammar
    c.setFont(FONT_NAME, 12)
    c.drawString(margin_x, y, "Grammar")
    y -= 18

    for i, g in enumerate(data.grammar, start=1):
        if y < 90:
            new_page()

        c.setFont(FONT_NAME, 11)
        c.drawString(margin_x, y, f"{i}. {g.pattern}")
        y -= 16

        y = _draw_wrapped(c, f"Explanation: {g.explanation_en}", margin_x + 10, y, max_width=520)

        if g.example:
            y = _draw_wrapped(c, f"Example: {g.example}", margin_x + 10, y, max_width=520)

        if g.notes:
            y = _draw_wrapped(c, f"Notes: {g.notes}", margin_x + 10, y, max_width=520)

        y -= 8

    c.save()
    return buf.getvalue()
