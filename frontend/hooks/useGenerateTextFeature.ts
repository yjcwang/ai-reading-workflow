"use client";

import { useState } from "react";
import { generateText } from "@/lib/api";
import type { GenerateTextRequest, Level } from "@/lib/types";

type UseGenerateTextFeatureOptions = {
  level: Level;
};

export function useGenerateTextFeature({
  level,
}: UseGenerateTextFeatureOptions) {
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerateRequest(
    request: GenerateTextRequest
  ): Promise<string | null> {
    setGenerateLoading(true);
    setGenerateError(null);

    try {
      const res = await generateText(request, level);
      return res.text;
    } catch (e: any) {
      setGenerateError(e?.message ?? "Unknown error");
      return null;
    } finally {
      setGenerateLoading(false);
    }
  }

  function resetGenerate() {
    setGenerateLoading(false);
    setGenerateError(null);
  }

  return {
    generateLoading,
    generateError,
    handleGenerateRequest,
    resetGenerate,
  };
}