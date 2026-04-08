import os
from io import BytesIO
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import cm

from app.schemas import AnalyzeResponse

# 字体常量定义
FONT_JP = "NotoSansJP"
FONT_SC = "NotoSansSC"

class PDFExporter:
    """
    高级 PDF 导出架构：支持多语言字形切换与自动布局
    """
    def __init__(self):
        self._register_fonts()
        self.styles = self._get_custom_styles()

    def _register_fonts(self):
        """注册中日双语字体"""
        base_path = Path(__file__).resolve().parents[1] / "assets" / "fonts"
        fonts = {
            FONT_JP: "NotoSansJP-Regular.ttf",
            FONT_SC: "NotoSansSC-Regular.ttf"
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
        """定义样式表：分离样式与逻辑"""
        styles = getSampleStyleSheet()
        
        # 日语主样式
        styles.add(ParagraphStyle(
            name='JP_Content',
            fontName=FONT_JP,
            fontSize=10,
            leading=16,
            wordWrap='CJK'
        ))

        # 中文/通用说明样式
        styles.add(ParagraphStyle(
            name='CN_Body',
            fontName=FONT_SC,
            fontSize=10,
            leading=14,
            textColor=colors.toColor("#333333"),
            wordWrap='CJK'
        ))

        # 备注样式：字体稍小，颜色稍淡
        styles.add(ParagraphStyle(
            name='Note_Body',
            parent=styles['CN_Body'],
            fontSize=9,
            textColor=colors.toColor("#666666"),
            leftIndent=10
        ))

        styles.add(ParagraphStyle(
            name='Heading',
            parent=styles['Heading1'],
            fontName=FONT_SC,
            fontSize=18,
            spaceAfter=12
        ))

        return styles

    def _fmt_mix(self, text: str, mode: str = "SC") -> str:
        """辅助方法：利用 HTML 标签在段落内强制指定字体"""
        font = FONT_SC if mode == "SC" else FONT_JP
        return f'<font name="{font}">{text}</font>'

    def build_pdf_bytes(self, data: AnalyzeResponse, target_lang: str = "en") -> bytes:
        i18n = {
            "en": {
                "main_title": "Summary List",
                "vocab_title": "Vocabulary",
                "grammar_title": "Grammar",
                "definition": "Definition",
                "example": "Example",
                "notes": "Notes"
            },
            "zh": {
                "main_title": "总结列表",
                "vocab_title": "词汇",
                "grammar_title": "语法",
                "definition": "释义",
                "example": "例",
                "notes": "备注"
            }
        }
        t = i18n.get(target_lang, i18n["en"])
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm
        )

        elements = []

        # 1. 标题
        elements.append(Paragraph(t["main_title"], self.styles['Heading']))
        elements.append(Spacer(1, 0.5*cm))

        # 2. Vocabulary Section
        elements.append(Paragraph(self._fmt_mix(t["vocab_title"], "SC"), self.styles['Heading']))
        elements.append(Spacer(1, 0.3*cm))

        for i, v in enumerate(data.vocab, 1):
            # 单词与读音 (JP)
            jp_title = f"<b>{i}. {v.expression}</b>"
            if v.reading:
                jp_title += f" ({v.reading})"
            elements.append(Paragraph(self._fmt_mix(jp_title, "JP"), self.styles['JP_Content']))

            # 含义 (SC)
            if v.definition:
                elements.append(Paragraph(self._fmt_mix(f"<i>{t['definition']}:</i> {v.definition}", "SC"), self.styles['CN_Body']))
            
            # 例句 (JP)
            if v.example:
                elements.append(Paragraph(self._fmt_mix(f"{t['example']}: {v.example}", "JP"), self.styles['JP_Content']))
            
            # --- 新增：词汇备注 (SC) ---
            if hasattr(v, 'notes') and v.notes:
                elements.append(Paragraph(self._fmt_mix(f"{t['notes']}: {v.notes}", "SC"), self.styles['Note_Body']))
            
            elements.append(Spacer(1, 0.3*cm))

        # 3. Grammar Section
        if data.grammar:
            elements.append(Spacer(1, 0.5*cm))
            elements.append(Paragraph(self._fmt_mix(t["grammar_title"], "SC"), self.styles['Heading']))
            
            for i, g in enumerate(data.grammar, 1):
                # 语法模式 (JP)
                elements.append(Paragraph(self._fmt_mix(f"{i}. {g.expression}", "JP"), self.styles['JP_Content']))
                
                # 解释 (SC)
                elements.append(Paragraph(self._fmt_mix(f"{t['definition']}: {g.definition}", "SC"), self.styles['CN_Body']))
                
                # --- 新增：语法例句 (JP) ---
                if hasattr(g, 'example') and g.example:
                    elements.append(Paragraph(self._fmt_mix(f"{t['example']}: {g.example}", "JP"), self.styles['JP_Content']))
                
                # --- 新增：语法备注 (SC) ---
                if hasattr(g, 'notes') and g.notes:
                    elements.append(Paragraph(self._fmt_mix(f"{t['notes']}: {g.notes}", "SC"), self.styles['Note_Body']))
                
                elements.append(Spacer(1, 0.3*cm))

        # 生成文档
        doc.build(elements)
        return buffer.getvalue()

def build_pdf_bytes(data: AnalyzeResponse, target_lang: str = "en") -> bytes:
    return PDFExporter().build_pdf_bytes(data, target_lang)
