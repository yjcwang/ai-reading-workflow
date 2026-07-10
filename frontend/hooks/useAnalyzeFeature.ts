"use client";

import { useState } from "react";
import { analyze, translate } from "@/lib/api";
import type { AnalyzeResponse, Level, TargetLang, TranslateSentenceResponse } from "@/lib/types";

type UseAnalyzeFeatureOptions = {
  level: Level;
  targetLang: TargetLang;
};

const EMPTY_ANALYZE_RESULT: AnalyzeResponse = {
  vocab: [],
  grammar: [],
};

export function useAnalyzeFeature({
  level,
  targetLang,
}: UseAnalyzeFeatureOptions) {
  const [data, setData] = useState<AnalyzeResponse>(EMPTY_ANALYZE_RESULT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedText, setLockedText] = useState<string | null>(null);
  const [translation, setTranslation] = useState<TranslateSentenceResponse | null>(null);

  async function handleAnalyzeRequest(draftText: string) {
    const text = draftText.trim();
    if (!text) return;

    setLockedText(text);
    setLoading(true);
    setError(null);
    setTranslation(null);

    try {
      const [analyzeResult, translateResult] = await Promise.all([
        analyze(text, level, targetLang),
        translate(text, targetLang),
      ]);
      setData(analyzeResult);
      setTranslation(translateResult);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setData(EMPTY_ANALYZE_RESULT);
      setTranslation(null);
    } finally {
      setLoading(false);
    }
  }

  function resetAnalyze() {
    setLockedText(null);
    setData(EMPTY_ANALYZE_RESULT);
    setTranslation(null);
    setError(null);
    setLoading(false);
  }

  function loadHistoryResult(
    historyText: string,
    historyData: AnalyzeResponse,
    historyTranslation?: TranslateSentenceResponse | null,
  ) {
    setLockedText(historyText);
    setData(historyData);
    setTranslation(historyTranslation ?? null);
    setError(null);
    setLoading(false);
  }

  return {
    data,
    setData,
    translation,
    analyzeLoading: loading,
    error,
    lockedText,
    handleAnalyzeRequest,
    loadHistoryResult,
    resetAnalyze,
  };
}
