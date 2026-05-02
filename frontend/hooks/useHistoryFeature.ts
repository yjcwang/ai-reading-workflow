"use client";

import { useEffect, useState } from "react";
import {
  deleteArticleHistory,
  getArticleHistory,
  getArticleHistoryDetail,
  getGrammarHistoryItems,
  getVocabHistoryItems,
  saveArticleHistory,
  searchArticleHistory,
  searchGrammarHistoryItems,
  searchVocabHistoryItems,
} from "@/lib/api";
import { UI_STRINGS } from "@/lib/i18n";
import type {
  ArticleHistoryDetailResponse,
  ArticleHistoryItemResponse,
  GrammarHistoryItemResponse,
  HistorySortOrder,
  HistoryView,
  SaveArticleHistoryRequest,
  TargetLang,
  VocabHistoryItemResponse,
} from "@/lib/types";

export function useHistoryFeature(targetLang: TargetLang) {
  const tUI = UI_STRINGS[targetLang];
  const [historyView, setHistoryView] = useState<HistoryView>("articles");
  const [historySortOrder, setHistorySortOrder] = useState<HistorySortOrder>("desc");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [articleHistoryList, setArticleHistoryList] = useState<ArticleHistoryItemResponse[]>([]);
  const [vocabHistoryList, setVocabHistoryList] = useState<VocabHistoryItemResponse[]>([]);
  const [grammarHistoryList, setGrammarHistoryList] = useState<GrammarHistoryItemResponse[]>([]);
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

  async function refreshArticleHistory() {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const articles = await getArticleHistory();
      setArticleHistoryList(articles);
    } catch (e: unknown) {
      setHistoryError(getErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function refreshVocabHistory() {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const results = await getVocabHistoryItems();
      setVocabHistoryList(results);
    } catch (e: unknown) {
      setHistoryError(getErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function refreshGrammarHistory() {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const results = await getGrammarHistoryItems();
      setGrammarHistoryList(results);
    } catch (e: unknown) {
      setHistoryError(getErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function refreshCurrentHistory(view: HistoryView = historyView) {
    const query = historySearchQuery.trim();
    if (query) {
      await searchCurrentHistory(query, view);
      return;
    }

    if (view === "vocab") {
      await refreshVocabHistory();
      return;
    }

    if (view === "grammar") {
      await refreshGrammarHistory();
      return;
    }

    await refreshArticleHistory();
  }

  async function changeHistoryView(view: HistoryView) {
    setHistoryView(view);
    const query = historySearchQuery.trim();
    if (query) {
      await searchCurrentHistory(query, view);
      return;
    }

    await refreshCurrentHistory(view);
  }

  async function searchCurrentHistory(query: string, view: HistoryView = historyView) {
    const trimmedQuery = query.trim();
    setHistorySearchQuery(query);

    if (!trimmedQuery) {
      await refreshCurrentHistoryWithoutSearch(view);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      if (view === "vocab") {
        const results = await searchVocabHistoryItems(trimmedQuery);
        setVocabHistoryList(results);
        return;
      }

      if (view === "grammar") {
        const results = await searchGrammarHistoryItems(trimmedQuery);
        setGrammarHistoryList(results);
        return;
      }

      const articles = await searchArticleHistory(trimmedQuery);
      setArticleHistoryList(articles);
    } catch (e: unknown) {
      setHistoryError(getErrorMessage(e));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function clearHistorySearch() {
    setHistorySearchQuery("");
    await refreshCurrentHistoryWithoutSearch(historyView);
  }

  async function refreshCurrentHistoryWithoutSearch(view: HistoryView) {
    if (view === "vocab") {
      await refreshVocabHistory();
      return;
    }

    if (view === "grammar") {
      await refreshGrammarHistory();
      return;
    }

    await refreshArticleHistory();
  }

  async function saveCurrentArticleHistory(
    payload: SaveArticleHistoryRequest,
  ): Promise<ArticleHistoryDetailResponse | null> {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const saved = await saveArticleHistory(payload);
      await refreshCurrentHistory();
      setSaveSuccess(tUI.resultPanel.saveSuccess);
      return saved;
    } catch (e: unknown) {
      setSaveError(getErrorMessage(e));
      return null;
    } finally {
      setSaveLoading(false);
    }
  }

  async function fetchArticleHistoryDetail(
    resultId: string,
  ): Promise<ArticleHistoryDetailResponse | null> {
    setHistoryLoadingResultId(resultId);
    setHistoryError(null);

    try {
      return await getArticleHistoryDetail(resultId);
    } catch (e: unknown) {
      setHistoryError(getErrorMessage(e));
      return null;
    } finally {
      setHistoryLoadingResultId(null);
    }
  }

  async function removeArticleHistory(resultId: string): Promise<boolean> {
    setHistoryDeletingResultId(resultId);
    setHistoryError(null);

    try {
      await deleteArticleHistory(resultId);
      setArticleHistoryList((prev) => prev.filter((item) => item.id !== resultId));
      setVocabHistoryList((prev) => prev.filter((item) => item.result_id !== resultId));
      setGrammarHistoryList((prev) => prev.filter((item) => item.result_id !== resultId));
      return true;
    } catch (e: unknown) {
      setHistoryError(getErrorMessage(e));
      return false;
    } finally {
      setHistoryDeletingResultId(null);
    }
  }

  return {
    historyView,
    historySortOrder,
    historySearchQuery,
    articleHistoryList: sortByCreatedAt(articleHistoryList, historySortOrder, (item) => item.created_at),
    vocabHistoryList: sortByCreatedAt(vocabHistoryList, historySortOrder, (item) => item.source_created_at),
    grammarHistoryList: sortByCreatedAt(grammarHistoryList, historySortOrder, (item) => item.source_created_at),
    historyLoading,
    historyError,
    historyLoadingResultId,
    historyDeletingResultId,
    saveLoading,
    saveError,
    saveSuccess,
    saveSuccessLeaving,
    refreshArticleHistory,
    refreshVocabHistory,
    refreshGrammarHistory,
    refreshCurrentHistory,
    changeHistoryView,
    setHistorySortOrder,
    setHistorySearchQuery,
    searchCurrentHistory,
    clearHistorySearch,
    saveCurrentArticleHistory,
    fetchArticleHistoryDetail,
    removeArticleHistory,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

function sortByCreatedAt<T>(
  items: T[],
  order: HistorySortOrder,
  getCreatedAt: (item: T) => string,
): T[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(getCreatedAt(a)).getTime();
    const bTime = new Date(getCreatedAt(b)).getTime();
    const normalizedA = Number.isNaN(aTime) ? 0 : aTime;
    const normalizedB = Number.isNaN(bTime) ? 0 : bTime;

    return order === "asc" ? normalizedA - normalizedB : normalizedB - normalizedA;
  });
}
