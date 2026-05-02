from pydantic import BaseModel, Field, field_serializer
from typing import List, Optional, Literal, Union
from datetime import datetime, timezone


def serialize_utc_datetime(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)
    return value.isoformat().replace("+00:00", "Z")

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
    text: str = Field(..., min_length=1)
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
class ArticleHistoryVocabItem(BaseModel):
    expression: str
    reading: Optional[str] = None
    definition: str
    example: str
    notes: Optional[str] = None

class ArticleHistoryGrammarItem(BaseModel):
    expression: str
    definition: str
    example: str
    notes: Optional[str] = None

class SaveArticleHistoryRequest(BaseModel):
    text: str = Field(..., min_length=1)
    level: str = Field(..., min_length=1)
    vocab: list[ArticleHistoryVocabItem]
    grammar: list[ArticleHistoryGrammarItem]


class ArticleHistoryDetailResponse(BaseModel):
    id: str
    text: str
    level: str
    created_at: datetime
    title: Optional[str] = None
    vocab: list[ArticleHistoryVocabItem]
    grammar: list[ArticleHistoryGrammarItem]

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)


class ArticleHistoryItemResponse(BaseModel):
    id: str
    text: str
    level: str
    created_at: datetime
    title: Optional[str] = None

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)


class VocabHistoryItemResponse(BaseModel):
    id: str
    result_id: str
    expression: str
    reading: Optional[str] = None
    definition: str
    example: Optional[str] = None
    source_title: Optional[str] = None
    source_text_preview: str
    source_level: str
    source_created_at: datetime

    @field_serializer("source_created_at")
    def serialize_source_created_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)


class GrammarHistoryItemResponse(BaseModel):
    id: str
    result_id: str
    expression: str
    definition: str
    example: Optional[str] = None
    source_title: Optional[str] = None
    source_text_preview: str
    source_level: str
    source_created_at: datetime

    @field_serializer("source_created_at")
    def serialize_source_created_at(self, value: datetime) -> str:
        return serialize_utc_datetime(value)
