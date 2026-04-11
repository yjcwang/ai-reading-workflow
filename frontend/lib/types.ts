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
  title: string;
  text: string;
};

export type SavedVocabItem = {
  expression: string;
  reading?: string | null;
  definition: string;
  example: string;
  notes?: string | null;
};

export type SavedGrammarItem = {
  expression: string;
  definition: string;
  example: string;
  notes?: string | null;
};

export type SaveResultRequest = {
  text: string;
  level: Level;
  title?: string | null;
  vocab: SavedVocabItem[];
  grammar: SavedGrammarItem[];
};

export type SavedResultResponse = {
  id: string;
  text: string;
  level: string;
  created_at: string;
  title?: string | null;
  vocab: SavedVocabItem[];
  grammar: SavedGrammarItem[];
};

export type ResultSummaryResponse = {
  id: string;
  text: string;
  level: string;
  created_at: string;
  title?: string | null;
};

