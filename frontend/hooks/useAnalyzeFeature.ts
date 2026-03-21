"use client";

import { useState } from "react";
import { analyze } from "@/lib/api";
import type { AnalyzeResponse, Level, TargetLang } from "@/lib/types";

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

  async function handleAnalyzeRequest(draftText: string) {
    const text = draftText.trim();
    if (!text) return;

    setLockedText(text);
    setLoading(true);
    setError(null);

    try {
      const res = await analyze(text, level, targetLang);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setData(EMPTY_ANALYZE_RESULT);
    } finally {
      setLoading(false);
    }
  }

  function resetAnalyze() {
    setLockedText(null);
    setData(EMPTY_ANALYZE_RESULT);
    setError(null);
    setLoading(false);
  }

  return {
    data,
    setData,
    loading,
    error,
    lockedText,
    handleAnalyzeRequest,
    resetAnalyze,
  };
}