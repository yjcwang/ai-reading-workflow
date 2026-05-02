"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { useTheme } from "@/hooks/useTheme";
import { useTargetLang } from "@/hooks/useTargetLang";
import { useExplainFeature, inferExplainMode } from "@/hooks/useExplainFeature";
import { useAnalyzeFeature } from "@/hooks/useAnalyzeFeature";
import { useExportPdf } from "@/hooks/useExportPdf";
import { useGenerateTextFeature } from "@/hooks/useGenerateTextFeature";
import { useHistoryFeature } from "@/hooks/useHistoryFeature";
import {
  addItemFromExplain,
  deleteGrammarByExpression,
  deleteVocabByExpression,
} from "@/lib/item-helpers";
import type {
  ArticleHistoryDetailResponse,
  ExplainWordResponse,
  GenerateTextRequest,
  Level,
  SaveArticleHistoryRequest,
} from "@/lib/types";
import { DEFAULT_GENERATE_REQUEST } from "@/lib/types";

export default function Page() {
  const [level, setLevel] = useState<Level>("N2");
  const [text, setText] = useState("");
  const [generateRequest, setGenerateRequest] = useState<GenerateTextRequest>(
    DEFAULT_GENERATE_REQUEST,
  );
  const [historyOpen, setHistoryOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { targetLang, handleLanguageChange } = useTargetLang();

  const analyzeFeature = useAnalyzeFeature({
    level,
    targetLang,
  });

  const generateFeature = useGenerateTextFeature({ level });
  const explainFeature = useExplainFeature({
    level,
    targetLang,
  });
  const historyFeature = useHistoryFeature(targetLang);
  const exportFeature = useExportPdf({
    filename: "my-list.pdf",
  });

  async function handleAnalyzeRequest() {
    await analyzeFeature.handleAnalyzeRequest(text);
  }

  function handleGenerateRequestChange(patch: Partial<GenerateTextRequest>) {
    setGenerateRequest((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  async function handleGenerateRequest(): Promise<boolean> {
    const topic = generateRequest.topic.trim();
    if (!topic) return false;

    const request = {
      ...generateRequest,
      topic,
      level,
    };

    const generatedText = await generateFeature.handleGenerateRequest(request);
    if (!generatedText) return false;

    setText(generatedText);
    return true;
  }

  async function handleExplainRequest(payload: {
    selectedText: string;
    context: string;
  }) {
    await explainFeature.handleExplainRequest(payload);
  }

  async function handleOpenHistory() {
    setHistoryOpen(true);
    await historyFeature.refreshCurrentHistory();
  }

  async function handleLoadArticleHistory(resultId: string) {
    const articleHistory = await historyFeature.fetchArticleHistoryDetail(resultId);
    if (!articleHistory) return;

    applyArticleHistoryDetail(articleHistory);
    setHistoryOpen(false);
  }

  async function handleDeleteArticleHistory(resultId: string) {
    await historyFeature.removeArticleHistory(resultId);
  }

  async function handleSaveCurrentArticleHistory() {
    const currentText = analyzeFeature.lockedText?.trim() || text.trim();
    const hasResult = analyzeFeature.data.vocab.length > 0 || analyzeFeature.data.grammar.length > 0;

    if (!currentText || !hasResult) return;

    const payload: SaveArticleHistoryRequest = {
      text: currentText,
      level,
      vocab: analyzeFeature.data.vocab.map((item) => ({
        expression: item.expression,
        reading: item.reading,
        definition: item.definition,
        example: item.example,
        notes: item.notes,
      })),
      grammar: analyzeFeature.data.grammar.map((item) => ({
        expression: item.expression,
        definition: item.definition,
        example: item.example,
        notes: item.notes,
      })),
    };

    await historyFeature.saveCurrentArticleHistory(payload);
  }

  function applyArticleHistoryDetail(articleHistory: ArticleHistoryDetailResponse) {
    setText(articleHistory.text);
    analyzeFeature.loadHistoryResult(articleHistory.text, {
      vocab: articleHistory.vocab.map((item) => ({
        expression: item.expression,
        reading: item.reading ?? undefined,
        definition: item.definition,
        example: item.example,
        notes: item.notes ?? undefined,
      })),
      grammar: articleHistory.grammar.map((item) => ({
        expression: item.expression,
        definition: item.definition,
        example: item.example,
        notes: item.notes ?? undefined,
      })),
    });
  }

  function onClear() {
    setText("");
    setGenerateRequest(DEFAULT_GENERATE_REQUEST);
    analyzeFeature.resetAnalyze();
    explainFeature.resetExplain();
    exportFeature.resetExport();
  }

  function handleLanguageChangeWithReset(newLang: typeof targetLang) {
    if (newLang === targetLang) return;
    onClear();
    handleLanguageChange(newLang);
  }

  function handleAddFromModal(item: ExplainWordResponse) {
    analyzeFeature.setData((prev) => addItemFromExplain(prev, item));
  }

  function handleDeleteVocab(expression: string) {
    analyzeFeature.setData((prev) => deleteVocabByExpression(prev, expression));
  }

  function handleDeleteGrammar(expression: string) {
    analyzeFeature.setData((prev) => deleteGrammarByExpression(prev, expression));
  }

  async function handleExportPdf() {
    const currentText = analyzeFeature.lockedText?.trim() || text.trim();
    const hasResult =
      analyzeFeature.data.vocab.length > 0 || analyzeFeature.data.grammar.length > 0;

    if (!currentText || !hasResult) return;

    await exportFeature.handleExportPdf(
      {
        text: currentText,
        data: analyzeFeature.data,
      },
      targetLang,
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        <InputPanel
          level={level}
          setLevel={setLevel}
          text={text}
          setText={setText}
          lockedText={analyzeFeature.lockedText}
          analyzeLoading={analyzeFeature.analyzeLoading}
          onAnalyzeRequest={handleAnalyzeRequest}
          onClear={onClear}
          onExplainRequest={handleExplainRequest}
          explainLoading={explainFeature.explainLoading}
          explainOpen={explainFeature.explainOpen}
          explainError={explainFeature.explainError}
          explainData={explainFeature.explainData}
          onCloseExplain={explainFeature.closeExplain}
          onAddFromExplain={handleAddFromModal}
          theme={theme}
          onToggleTheme={toggleTheme}
          getMode={inferExplainMode}
          targetLang={targetLang}
          onLanguageChange={handleLanguageChangeWithReset}
          onOpenHistory={handleOpenHistory}
          generateRequest={generateRequest}
          onGenerateRequestChange={handleGenerateRequestChange}
          onGenerateRequest={handleGenerateRequest}
          generateLoading={generateFeature.generateLoading}
          generateError={generateFeature.generateError}
        />
        <ResultPanel
          data={analyzeFeature.data}
          error={analyzeFeature.error}
          analyzeLoading={analyzeFeature.analyzeLoading}
          onDeleteVocab={handleDeleteVocab}
          onDeleteGrammar={handleDeleteGrammar}
          onSaveArticleHistory={handleSaveCurrentArticleHistory}
          onExportPdf={handleExportPdf}
          saving={historyFeature.saveLoading}
          saveError={historyFeature.saveError}
          saveSuccess={historyFeature.saveSuccess}
          saveSuccessLeaving={historyFeature.saveSuccessLeaving}
          exporting={exportFeature.exporting}
          exportError={exportFeature.exportError}
          targetLang={targetLang}
        />
        <HistoryPanel
          open={historyOpen}
          targetLang={targetLang}
          historyView={historyFeature.historyView}
          historySortOrder={historyFeature.historySortOrder}
          articleHistory={historyFeature.articleHistoryList}
          vocabHistory={historyFeature.vocabHistoryList}
          grammarHistory={historyFeature.grammarHistoryList}
          loading={historyFeature.historyLoading}
          error={historyFeature.historyError}
          loadingResultId={historyFeature.historyLoadingResultId}
          deletingResultId={historyFeature.historyDeletingResultId}
          onClose={() => setHistoryOpen(false)}
          onLoad={handleLoadArticleHistory}
          onDelete={handleDeleteArticleHistory}
          onRefresh={historyFeature.refreshCurrentHistory}
          onViewChange={historyFeature.changeHistoryView}
          onSortOrderChange={historyFeature.setHistorySortOrder}
        />
      </div>
    </main>
  );
}
