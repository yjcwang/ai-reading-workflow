from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union

# define Request and Response structure with pydantic model

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Japanese text to analyze")
    level: Optional[str] = Field(default="N2", description="e.g., N5-N1 or beginner/intermediate") # equal with: str | None
    target_lang: str = "en"

class VocabItem(BaseModel):
    surface: str
    reading: Optional[str] = None
    meaning: str
    example: str
    notes: Optional[str] = None

class GrammarItem(BaseModel):
    pattern: str
    explanation: str
    example: str
    notes: Optional[str] = None

class AnalyzeResponse(BaseModel):
    vocab: List[VocabItem]
    grammar: List[GrammarItem]


class ExplainRequest(BaseModel):
    mode: Literal["sentence", "word"] = "word"
    selected_text: str = Field(..., min_length=1)
    context: Optional[str] = None  
    level: Optional[str] = Field(default="N2", description="e.g., N5-N1 or beginner/intermediate")
    target_lang: str = "en"

ExplainType = Literal["vocab", "grammar"]    
class ExplainWordResponse(BaseModel):
    kind: Literal["word"] = "word"
    type: ExplainType
    surface: str
    reading: Optional[str] = None
    meaning: str                         
    example: str             
    notes: Optional[str] = None           

class ExplainSentenceResponse(BaseModel):
    kind: Literal["sentence"] = "sentence"
    translation_en: str
    vocab: List[VocabItem]
    grammar: List[GrammarItem]

ExplainResponse = Union[ExplainWordResponse, ExplainSentenceResponse]

class TranslateSentenceResponse(BaseModel):
    translation: str

class ExportPDFRequest(BaseModel):
    data: AnalyzeResponse
    target_lang: str = "en" 
