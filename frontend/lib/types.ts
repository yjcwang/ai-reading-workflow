export type TargetLang = "zh" | "en";

export type Level = "N5" | "N4" | "N3" | "N2" | "N1";

export type VocabItem = {
  surface: string;
  reading?: string;
  meaning: string;
  example: string;
  notes?: string;
};

export type GrammarItem = {
  pattern: string;
  explanation: string;
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
  surface: string;
  reading?: string | null;
  meaning: string;
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

