"use client";

import { useState } from "react";
import { explain } from "@/lib/api";
import type { ExplainResponse, Level, TargetLang } from "@/lib/types";

export function inferExplainMode(selectedText: string): "word" | "sentence" {
  return selectedText.length >= 12 ? "sentence" : "word";
}

type ExplainPayload = {
  selectedText: string;
  context: string;
};

type UseExplainFeatureOptions = {
  level: Level;
  targetLang: TargetLang;
};

export function useExplainFeature({
  level,
  targetLang,
}: UseExplainFeatureOptions) {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);

  async function handleExplainRequest(payload: ExplainPayload) {
    setExplainOpen(false);
    setExplainLoading(true);
    setExplainError(null);
    setExplainData(null);

    const mode = inferExplainMode(payload.selectedText);

    try {
      const res = await explain(
        mode,
        payload.selectedText,
        payload.context,
        level,
        targetLang,
      );

      if (res.kind === "sentence") {
        setExplainData({
          ...res,
          sentence_jp: payload.selectedText,
        });
      } else {
        setExplainData(res);
      }
      setExplainOpen(true);
    } catch (e: unknown) {
      setExplainError(e instanceof Error ? e.message : "Unknown error");
      setExplainOpen(true);
    } finally {
      setExplainLoading(false);
    }
  }

  function closeExplain() {
    setExplainOpen(false);
  }

  function resetExplain() {
    setExplainOpen(false);
    setExplainLoading(false);
    setExplainError(null);
    setExplainData(null);
  }

  return {
    explainOpen,
    explainLoading,
    explainError,
    explainData,
    handleExplainRequest,
    closeExplain,
    resetExplain,
  };
}
