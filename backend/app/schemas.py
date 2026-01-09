from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# define Request and Response structure with pydantic model

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Japanese text to analyze")
    level: Optional[str] = Field(default=None, description="e.g., N5-N1 or beginner/intermediate") # equal with: str | None

class VocabItem(BaseModel):
    surface: str
    reading: Optional[str] = None
    meaning_en: str
    example: str
    notes: Optional[str] = None

class GrammarItem(BaseModel):
    pattern: str
    explanation_en: str
    example: str
    notes: Optional[str] = None

class AnalyzeResponse(BaseModel):
    vocab: List[VocabItem]
    grammar: List[GrammarItem]


ExplainType = Literal["vocab", "grammar"]    

class ExplainRequest(BaseModel):
    selected_text: str = Field(..., min_length=1)
    context: Optional[str] = None  
    mode: Literal["auto", "vocab", "grammar"] = "auto"

class ExplainResponse(BaseModel):
    type: ExplainType
    surface: str
    reading: Optional[str] = None
    meaning_en: str                         
    example: str             
    notes: Optional[str] = None           
