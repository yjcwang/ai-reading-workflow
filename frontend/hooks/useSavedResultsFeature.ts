"use client";

import { useState } from "react";
import { getSavedResultDetail, getSavedResults } from "@/lib/api";
import type { ResultSummaryResponse, SavedResultResponse } from "@/lib/types";

export function useSavedResultsFeature() {
  const [historyList, setHistoryList] = useState<ResultSummaryResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoadingResultId, setHistoryLoadingResultId] = useState<string | null>(null);

  async function refreshHistory() {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const results = await getSavedResults();
      setHistoryList(results);
    } catch (e: any) {
      setHistoryError(e?.message ?? "Unknown error");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function fetchSavedResultDetail(resultId: string): Promise<SavedResultResponse | null> {
    setHistoryLoadingResultId(resultId);
    setHistoryError(null);

    try {
      return await getSavedResultDetail(resultId);
    } catch (e: any) {
      setHistoryError(e?.message ?? "Unknown error");
      return null;
    } finally {
      setHistoryLoadingResultId(null);
    }
  }

  return {
    historyList,
    historyLoading,
    historyError,
    historyLoadingResultId,
    refreshHistory,
    fetchSavedResultDetail,
  };
}
