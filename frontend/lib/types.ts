// define structure of response 

export type Level = "N5" | "N4" | "N3" | "N2" | "N1";

export type VocabItem = {
  surface: string;
  reading?: string;
  meaning_en: string;
  why: string;
};

export type GrammarItem = {
  pattern: string;
  explanation_en: string;
  example_from_text: string;
  notes?: string;
};
// todo:Change optional

export type AnalyzeResponse = {
  vocab: VocabItem[];
  grammar: GrammarItem[];
};

// lib/types.ts
export type ExplainType = "vocab" | "grammar" | "phrase";

export type ExplainResponse = {
  type: ExplainType;
  surface: string;
  reading?: string | null;
  meaning_en: string;
  example: string;
  notes?: string | null;
};
