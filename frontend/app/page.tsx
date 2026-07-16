"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { AiChatDrawer } from "@/components/AiChatDrawer";
import { useTheme } from "@/hooks/useTheme";
import { useTargetLang } from "@/hooks/useTargetLang";
import { useExplainFeature, inferExplainMode } from "@/hooks/useExplainFeature";
import { useAnalyzeFeature } from "@/hooks/useAnalyzeFeature";
import { useExportPdf } from "@/hooks/useExportPdf";
import { useGenerateTextFeature } from "@/hooks/useGenerateTextFeature";
import { useHistoryFeature } from "@/hooks/useHistoryFeature";
import { useAiChatFeature } from "@/hooks/useAiChatFeature";
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
  TextHighlight,
} from "@/lib/types";
import { DEFAULT_GENERATE_REQUEST } from "@/lib/types";

export default function Page() {
  const [level, setLevel] = useState<Level>("N2");
  const [text, setText] = useState("");
  const [generateRequest, setGenerateRequest] = useState<GenerateTextRequest>(
    DEFAULT_GENERATE_REQUEST,
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTextHighlight, setActiveTextHighlight] = useState<TextHighlight | null>(null);

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
  const aiChatFeature = useAiChatFeature();
  const exportFeature = useExportPdf({
    filename: "my-list.pdf",
  });

  async function handleAnalyzeRequest() {
    aiChatFeature.resetChat();
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
    aiChatFeature.resetChat();
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
      translation: analyzeFeature.translation?.translation ?? null,
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
    analyzeFeature.loadHistoryResult(
      articleHistory.text,
      {
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
      },
      articleHistory.translation
        ? { translation: articleHistory.translation }
        : null,
    );
  }

  function onClear() {
    setText("");
    setActiveTextHighlight(null);
    setGenerateRequest(DEFAULT_GENERATE_REQUEST);
    analyzeFeature.resetAnalyze();
    explainFeature.resetExplain();
    exportFeature.resetExport();
    aiChatFeature.resetChat();
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
        translation: analyzeFeature.translation?.translation ?? null,
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
          activeTextHighlight={activeTextHighlight}
          generateRequest={generateRequest}
          onGenerateRequestChange={handleGenerateRequestChange}
          onGenerateRequest={handleGenerateRequest}
          generateLoading={generateFeature.generateLoading}
          generateError={generateFeature.generateError}
        />
        <ResultPanel
          data={analyzeFeature.data}
          translation={analyzeFeature.translation}
          error={analyzeFeature.error}
          analyzeLoading={analyzeFeature.analyzeLoading}
          onDeleteVocab={handleDeleteVocab}
          onDeleteGrammar={handleDeleteGrammar}
          onSaveArticleHistory={handleSaveCurrentArticleHistory}
          onExportPdf={handleExportPdf}
          onOpenAiChat={() => aiChatFeature.setOpen(true)}
          aiChatDisabled={!(analyzeFeature.lockedText?.trim() || text.trim())}
          saving={historyFeature.saveLoading}
          saveError={historyFeature.saveError}
          saveSuccess={historyFeature.saveSuccess}
          saveSuccessLeaving={historyFeature.saveSuccessLeaving}
          exporting={exportFeature.exporting}
          exportError={exportFeature.exportError}
          targetLang={targetLang}
          onActiveTextHighlightChange={setActiveTextHighlight}
        />
        <HistoryPanel
          open={historyOpen}
          targetLang={targetLang}
          historyView={historyFeature.historyView}
          historySortOrder={historyFeature.historySortOrder}
          historySearchQuery={historyFeature.historySearchQuery}
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
          onSearchQueryChange={historyFeature.setHistorySearchQuery}
          onSearch={historyFeature.searchCurrentHistory}
          onClearSearch={historyFeature.clearHistorySearch}
        />
        <AiChatDrawer
          open={aiChatFeature.open}
          messages={aiChatFeature.messages}
          loading={aiChatFeature.loading}
          error={aiChatFeature.error}
          targetLang={targetLang}
          disabled={analyzeFeature.analyzeLoading}
          onClose={() => aiChatFeature.setOpen(false)}
          onSend={(question) =>
            aiChatFeature.sendQuestion({
              question,
              articleText: analyzeFeature.lockedText?.trim() || text.trim(),
              analysis: analyzeFeature.data,
              level,
              targetLang,
              contextType: "article",
              contextPayload: null,
            })
          }
        />
      </div>
    </main>
  );
}
