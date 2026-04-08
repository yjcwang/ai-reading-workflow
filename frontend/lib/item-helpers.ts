import type { AnalyzeResponse, ExplainWordResponse } from "@/lib/types";

export function addItemFromExplain(
  prev: AnalyzeResponse,
  item: ExplainWordResponse,
): AnalyzeResponse {
  if (item.type === "vocab") {
    const newItem = {
      expression: item.expression,
      reading: item.reading ?? undefined,
      definition: item.definition,
      example: item.example,
      notes: item.notes ?? undefined,
    };

    if (prev.vocab.some((v) => v.expression === newItem.expression)) {
      return prev;
    }

    return {
      ...prev,
      vocab: [newItem, ...prev.vocab],
    };
  }

  const newItem = {
    expression: item.expression,
    definition: item.definition,
    example: item.example,
    notes: item.notes ?? undefined,
  };

  if (prev.grammar.some((g) => g.expression === newItem.expression)) {
    return prev;
  }

  return {
    ...prev,
    grammar: [newItem, ...prev.grammar],
  };
}

export function deleteVocabByExpression(
  prev: AnalyzeResponse,
  expression: string,
): AnalyzeResponse {
  return {
    ...prev,
    vocab: prev.vocab.filter((v) => v.expression !== expression),
  };
}

export function deleteGrammarByExpression(
  prev: AnalyzeResponse,
  expression: string,
): AnalyzeResponse {
  return {
    ...prev,
    grammar: prev.grammar.filter((g) => g.expression !== expression),
  };
}
