from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union
from datetime import datetime

# define Request and Response structure with pydantic model
# analyzer ------------  
class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Japanese text to analyze")
    level: Optional[str] = Field(default="N2", description="e.g., N5-N1 or beginner/intermediate") # equal with: str | None
    target_lang: str = "en"

class VocabItem(BaseModel):
    expression: str
    reading: Optional[str] = None
    definition: str
    example: str
    notes: Optional[str] = None

class GrammarItem(BaseModel):
    expression: str
    definition: str
    example: str
    notes: Optional[str] = None

class AnalyzeResponse(BaseModel):
    vocab: List[VocabItem]
    grammar: List[GrammarItem]

# explainer ------------   
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
    expression: str
    reading: Optional[str] = None
    definition: str
    example: str             
    notes: Optional[str] = None   

class TranslateSentenceResponse(BaseModel):
    translation: str        

class ExplainSentenceResponse(BaseModel):
    kind: Literal["sentence"] = "sentence"
    translation: TranslateSentenceResponse
    vocab: List[VocabItem]
    grammar: List[GrammarItem]

ExplainResponse = Union[ExplainWordResponse, ExplainSentenceResponse]

# PDF exporter ------------  
class ExportPDFRequest(BaseModel):
    data: AnalyzeResponse
    target_lang: str = "en" 

# text generator ------------    
# notice that request schema in backend has a 'level' field more than in backend
class GenerateTextRequest(BaseModel):
    level: Literal["N5", "N4", "N3", "N2", "N1"]
    topic: str = Field(..., min_length=1, max_length=200)
    length: Literal["short", "medium", "long"] = "medium"
    style: Literal["daily", "blog", "news", "conversation", "science"] = "daily"

class GenerateTextResponse(BaseModel):
    text: str


class GenerateTitleResponse(BaseModel):
    title: str

# database ------------
class SavedVocabItem(BaseModel):
    expression: str
    reading: Optional[str] = None
    definition: str
    example: str
    notes: Optional[str] = None

class SavedGrammarItem(BaseModel):
    expression: str
    definition: str
    example: str
    notes: Optional[str] = None

class SaveResultRequest(BaseModel):
    text: str = Field(..., min_length=1)
    level: str = Field(..., min_length=1)
    vocab: list[SavedVocabItem]
    grammar: list[SavedGrammarItem]


class SavedResultResponse(BaseModel):
    id: str
    text: str
    level: str
    created_at: datetime
    title: Optional[str] = None
    vocab: list[SavedVocabItem]
    grammar: list[SavedGrammarItem]


class ResultSummaryResponse(BaseModel):
    id: str
    text: str
    level: str
    created_at: datetime
    title: Optional[str] = None
