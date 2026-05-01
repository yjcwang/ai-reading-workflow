from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from app.schemas import AnalyzeResponse

FONT_JP = "NotoSansJP"
FONT_SC = "NotoSansSC"


class PDFExporter:
    """Build learner-friendly PDF exports with JP/CN font support."""

    def __init__(self):
        self._register_fonts()
        self.styles = self._get_custom_styles()

    def _register_fonts(self):
        """Register fonts once so CJK text renders correctly in ReportLab."""
        base_path = Path(__file__).resolve().parents[1] / "assets" / "fonts"
        fonts = {
            FONT_JP: "NotoSansJP-Regular.ttf",
            FONT_SC: "NotoSansSC-Regular.ttf",
        }

        for name, filename in fonts.items():
            path = base_path / filename
            if not path.exists():
                raise FileNotFoundError(f"Missing font file: {path}")

            try:
                pdfmetrics.getFont(name)
            except KeyError:
                pdfmetrics.registerFont(TTFont(name, str(path)))

    def _get_custom_styles(self):
        """Keep visual styles centralized so export layout stays simple."""
        styles = getSampleStyleSheet()

        styles.add(
            ParagraphStyle(
                name="JP_Content",
                fontName=FONT_JP,
                fontSize=10,
                leading=16,
                wordWrap="CJK",
            )
        )

        styles.add(
            ParagraphStyle(
                name="CN_Body",
                fontName=FONT_SC,
                fontSize=10,
                leading=14,
                textColor=colors.toColor("#333333"),
                wordWrap="CJK",
            )
        )

        styles.add(
            ParagraphStyle(
                name="Note_Body",
                parent=styles["CN_Body"],
                fontSize=9,
                textColor=colors.toColor("#666666"),
                leftIndent=10,
            )
        )

        styles.add(
            ParagraphStyle(
                name="Heading",
                parent=styles["Heading1"],
                fontName=FONT_SC,
                fontSize=18,
                spaceAfter=12,
            )
        )

        return styles

    def _fmt_mix(self, text: str, mode: str = "SC") -> str:
        """Force a specific font inside a paragraph block."""
        font = FONT_SC if mode == "SC" else FONT_JP
        return f'<font name="{font}">{text}</font>'

    def build_pdf_bytes(
        self,
        text: str,
        data: AnalyzeResponse,
        target_lang: str = "en",
    ) -> bytes:
        i18n = {
            "en": {
                "main_title": "Summary List",
                "text_title": "Text",
                "vocab_title": "Vocabulary",
                "grammar_title": "Grammar",
                "definition": "Definition",
                "example": "Example",
                "notes": "Notes",
            },
            "zh": {
                "main_title": "总结列表",
                "text_title": "文章",
                "vocab_title": "词汇",
                "grammar_title": "语法",
                "definition": "释义",
                "example": "例句",
                "notes": "备注",
            },
        }
        t = i18n.get(target_lang, i18n["en"])

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        elements = []

        elements.append(Paragraph(t["main_title"], self.styles["Heading"]))
        elements.append(Spacer(1, 0.5 * cm))

        elements.append(Paragraph(self._fmt_mix(t["text_title"], "SC"), self.styles["Heading"]))
        elements.append(Spacer(1, 0.2 * cm))
        elements.append(Paragraph(self._fmt_mix(text, "JP"), self.styles["JP_Content"]))
        elements.append(Spacer(1, 0.5 * cm))

        elements.append(Paragraph(self._fmt_mix(t["vocab_title"], "SC"), self.styles["Heading"]))
        elements.append(Spacer(1, 0.3 * cm))

        for i, v in enumerate(data.vocab, 1):
            jp_title = f"<b>{i}. {v.expression}</b>"
            if v.reading:
                jp_title += f" ({v.reading})"
            elements.append(Paragraph(self._fmt_mix(jp_title, "JP"), self.styles["JP_Content"]))

            if v.definition:
                elements.append(
                    Paragraph(
                        self._fmt_mix(f"<i>{t['definition']}:</i> {v.definition}", "SC"),
                        self.styles["CN_Body"],
                    )
                )

            if v.example:
                elements.append(
                    Paragraph(
                        self._fmt_mix(f"{t['example']}: {v.example}", "JP"),
                        self.styles["JP_Content"],
                    )
                )

            if getattr(v, "notes", None):
                elements.append(
                    Paragraph(
                        self._fmt_mix(f"{t['notes']}: {v.notes}", "SC"),
                        self.styles["Note_Body"],
                    )
                )

            elements.append(Spacer(1, 0.3 * cm))

        if data.grammar:
            elements.append(Spacer(1, 0.5 * cm))
            elements.append(
                Paragraph(self._fmt_mix(t["grammar_title"], "SC"), self.styles["Heading"])
            )

            for i, g in enumerate(data.grammar, 1):
                elements.append(
                    Paragraph(self._fmt_mix(f"{i}. {g.expression}", "JP"), self.styles["JP_Content"])
                )

                elements.append(
                    Paragraph(
                        self._fmt_mix(f"{t['definition']}: {g.definition}", "SC"),
                        self.styles["CN_Body"],
                    )
                )

                if g.example:
                    elements.append(
                        Paragraph(
                            self._fmt_mix(f"{t['example']}: {g.example}", "JP"),
                            self.styles["JP_Content"],
                        )
                    )

                if getattr(g, "notes", None):
                    elements.append(
                        Paragraph(
                            self._fmt_mix(f"{t['notes']}: {g.notes}", "SC"),
                            self.styles["Note_Body"],
                        )
                    )

                elements.append(Spacer(1, 0.3 * cm))

        doc.build(elements)
        return buffer.getvalue()


def build_pdf_bytes(text: str, data: AnalyzeResponse, target_lang: str = "en") -> bytes:
    return PDFExporter().build_pdf_bytes(text, data, target_lang)
