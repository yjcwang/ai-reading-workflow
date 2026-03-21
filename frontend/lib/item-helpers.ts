import type { AnalyzeResponse, ExplainWordResponse } from "@/lib/types";

export function addItemFromExplain(
  prev: AnalyzeResponse,
  item: ExplainWordResponse,
): AnalyzeResponse {
  if (item.type === "vocab") {
    const newItem = {
      surface: item.surface,
      reading: item.reading ?? undefined,
      meaning: item.meaning,
      example: item.example,
      notes: item.notes ?? undefined,
    };

    if (prev.vocab.some((v) => v.surface === newItem.surface)) {
      return prev;
    }

    return {
      ...prev,
      vocab: [newItem, ...prev.vocab],
    };
  }

  const newItem = {
    pattern: item.surface,
    explanation: item.meaning,
    example: item.example,
    notes: item.notes ?? undefined,
  };

  if (prev.grammar.some((g) => g.pattern === newItem.pattern)) {
    return prev;
  }

  return {
    ...prev,
    grammar: [newItem, ...prev.grammar],
  };
}

export function deleteVocabBySurface(
  prev: AnalyzeResponse,
  surface: string,
): AnalyzeResponse {
  return {
    ...prev,
    vocab: prev.vocab.filter((v) => v.surface !== surface),
  };
}

export function deleteGrammarByPattern(
  prev: AnalyzeResponse,
  pattern: string,
): AnalyzeResponse {
  return {
    ...prev,
    grammar: prev.grammar.filter((g) => g.pattern !== pattern),
  };
}