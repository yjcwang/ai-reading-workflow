"use client";

import { useEffect, useState } from "react";
import { deleteSavedResult, getSavedResultDetail, getSavedResults, saveResult } from "@/lib/api";
import type {
  ResultSummaryResponse,
  SaveResultRequest,
  SavedResultResponse,
} from "@/lib/types";

export function useSavedResultsFeature() {
  const [historyList, setHistoryList] = useState<ResultSummaryResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoadingResultId, setHistoryLoadingResultId] = useState<string | null>(null);
  const [historyDeletingResultId, setHistoryDeletingResultId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveSuccessLeaving, setSaveSuccessLeaving] = useState(false);

  useEffect(() => {
    if (!saveSuccess) return;

    setSaveSuccessLeaving(false);

    const leaveTimer = window.setTimeout(() => {
      setSaveSuccessLeaving(true);
    }, 2600);

    const removeTimer = window.setTimeout(() => {
      setSaveSuccess(null);
      setSaveSuccessLeaving(false);
    }, 3000);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [saveSuccess]);

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

  async function saveCurrentResult(payload: SaveResultRequest): Promise<SavedResultResponse | null> {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const saved = await saveResult(payload);
      await refreshHistory();
      setSaveSuccess("Saved to history.");
      return saved;
    } catch (e: any) {
      setSaveError(e?.message ?? "Unknown error");
      return null;
    } finally {
      setSaveLoading(false);
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

  async function removeSavedResult(resultId: string): Promise<boolean> {
    setHistoryDeletingResultId(resultId);
    setHistoryError(null);

    try {
      await deleteSavedResult(resultId);
      setHistoryList((prev) => prev.filter((item) => item.id !== resultId));
      return true;
    } catch (e: any) {
      setHistoryError(e?.message ?? "Unknown error");
      return false;
    } finally {
      setHistoryDeletingResultId(null);
    }
  }

  return {
    historyList,
    historyLoading,
    historyError,
    historyLoadingResultId,
    historyDeletingResultId,
    saveLoading,
    saveError,
    saveSuccess,
    saveSuccessLeaving,
    refreshHistory,
    saveCurrentResult,
    fetchSavedResultDetail,
    removeSavedResult,
  };
}
