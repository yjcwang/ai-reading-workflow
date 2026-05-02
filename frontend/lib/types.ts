export type TargetLang = "zh" | "en";

export type Level = "N5" | "N4" | "N3" | "N2" | "N1";

export type VocabItem = {
  expression: string;
  reading?: string;
  definition: string;
  example: string;
  notes?: string;
};

export type GrammarItem = {
  expression: string;
  definition: string;
  example: string;
  notes?: string;
};

export type AnalyzeResponse = {
  vocab: VocabItem[];
  grammar: GrammarItem[];
};

export type ExportPdfRequest = {
  text: string;
  data: AnalyzeResponse;
};

export type ExplainType = "vocab" | "grammar";

export type ExplainWordResponse = {
  kind: "word";
  type: ExplainType;
  expression: string;
  reading?: string | null;
  definition: string;
  example: string;
  notes?: string | null;
};

export type TranslateSentenceResponse = {
  translation: string;
};

export type ExplainSentenceResponse = {
  kind: "sentence";
  sentence_jp: string;
  translation: TranslateSentenceResponse;
  vocab: VocabItem[];
  grammar: GrammarItem[];
};

export type ExplainResponse = ExplainWordResponse | ExplainSentenceResponse;


export type GenerateTextRequest = {
  topic: string;
  length: "short" | "medium" | "long";
  style: "daily" | "campus" | "news" | "conversation" | "science";
};

export const DEFAULT_GENERATE_REQUEST: GenerateTextRequest = {
  topic: "",
  length: "medium",
  style: "daily",
};

export type GenerateTextResponse = {
  text: string;
};

export type ArticleHistoryVocabItem = {
  expression: string;
  reading?: string | null;
  definition: string;
  example: string;
  notes?: string | null;
};

export type ArticleHistoryGrammarItem = {
  expression: string;
  definition: string;
  example: string;
  notes?: string | null;
};

export type SaveArticleHistoryRequest = {
  text: string;
  level: Level;
  vocab: ArticleHistoryVocabItem[];
  grammar: ArticleHistoryGrammarItem[];
};

export type ArticleHistoryDetailResponse = {
  id: string;
  text: string;
  level: string;
  created_at: string;
  title?: string | null;
  vocab: ArticleHistoryVocabItem[];
  grammar: ArticleHistoryGrammarItem[];
};

export type ArticleHistoryItemResponse = {
  id: string;
  text: string;
  level: string;
  created_at: string;
  title?: string | null;
};

export type HistoryView = "articles" | "vocab" | "grammar";

export type HistorySortOrder = "desc" | "asc";

export type VocabHistoryItemResponse = {
  id: string;
  result_id: string;
  expression: string;
  reading?: string | null;
  definition: string;
  example?: string | null;
  source_title?: string | null;
  source_text_preview: string;
  source_level: string;
  source_created_at: string;
};

export type GrammarHistoryItemResponse = {
  id: string;
  result_id: string;
  expression: string;
  definition: string;
  example?: string | null;
  source_title?: string | null;
  source_text_preview: string;
  source_level: string;
  source_created_at: string;
};

