"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { AiChatDrawer } from "@/components/AiChatDrawer";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { useTheme } from "@/hooks/useTheme";
import { useTargetLang } from "@/hooks/useTargetLang";
import { useExplainFeature, inferExplainMode } from "@/hooks/useExplainFeature";
import { useAnalyzeFeature } from "@/hooks/useAnalyzeFeature";
import { useExportPdf } from "@/hooks/useExportPdf";
import { useGenerateTextFeature } from "@/hooks/useGenerateTextFeature";
import { useHistoryFeature } from "@/hooks/useHistoryFeature";
import { useAiChatFeature } from "@/hooks/useAiChatFeature";
import { UI_STRINGS } from "@/lib/i18n";
import { getModelConfig } from "@/lib/api";
import {
  addItemFromExplain,
  deleteGrammarByExpression,
  deleteVocabByExpression,
} from "@/lib/item-helpers";
import type {
  ArticleHistoryDetailResponse,
  ExplainWordResponse,
  GenerateTextRequest,
  GrammarItem,
  Level,
  ModelConfigResponse,
  SaveArticleHistoryRequest,
  TextHighlight,
  VocabItem,
} from "@/lib/types";
import { DEFAULT_GENERATE_REQUEST } from "@/lib/types";

export default function Page() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [level, setLevel] = useState<Level>("N2");
  const [text, setText] = useState("");
  const [generateRequest, setGenerateRequest] = useState<GenerateTextRequest>(
    DEFAULT_GENERATE_REQUEST,
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTextHighlight, setActiveTextHighlight] = useState<TextHighlight | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfigResponse | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { targetLang, handleLanguageChange } = useTargetLang();
  const aiChatText = UI_STRINGS[targetLang].aiChat;

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

  useEffect(() => {
    getModelConfig()
      .then(setModelConfig)
      .catch(() => setModelConfig(null));
  }, []);

  useEffect(() => {
    const openTimer = window.setTimeout(() => {
      if (window.localStorage.getItem("ai-reading-onboarding:v1") !== "complete") {
        setGuideOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(openTimer);
  }, []);

  const handleCloseGuide = useCallback(() => {
    window.localStorage.setItem("ai-reading-onboarding:v1", "complete");
    setGuideOpen(false);
  }, []);

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
    explainFeature.resetExplain();
    aiChatFeature.openWithContext({
      type: "selected_text",
      text: payload.selectedText,
      payload: { selected_text: payload.selectedText },
    });
  }

  async function handleGenerateExplainCardsFromChat() {
    if (aiChatFeature.activeContext.type !== "selected_text") return;

    const selectedText = aiChatFeature.activeContext.payload?.selected_text;
    if (typeof selectedText !== "string" || !selectedText.trim()) return;

    await explainFeature.handleExplainRequest(
      {
        selectedText,
        context: analyzeFeature.lockedText?.trim() || text.trim(),
      },
      { openModal: true },
    );
  }

  function handleOpenArticleAiChat() {
    if (aiChatFeature.open) {
      aiChatFeature.setOpen(false);
      return;
    }

    explainFeature.resetExplain();
    aiChatFeature.openWithContext({
      type: "article",
      text: "",
      payload: null,
    });
  }

  function handleAskAiForVocab(item: VocabItem) {
    explainFeature.resetExplain();
    aiChatFeature.openWithContext({
      type: "vocab",
      text: item.expression,
      payload: item,
    });
  }

  function handleAskAiForGrammar(item: GrammarItem) {
    explainFeature.resetExplain();
    aiChatFeature.openWithContext({
      type: "grammar",
      text: item.expression,
      payload: item,
    });
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
      <OnboardingGuide
        open={guideOpen}
        targetLang={targetLang}
        onClose={handleCloseGuide}
      />
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
          onOpenGuide={() => setGuideOpen(true)}
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
          onOpenAiChat={handleOpenArticleAiChat}
          aiChatPanel={
            <AiChatDrawer
              open={aiChatFeature.open}
              messages={aiChatFeature.messages}
              loading={aiChatFeature.loading}
              error={aiChatFeature.error}
              targetLang={targetLang}
              contextText={aiChatFeature.activeContext.text}
              contextType={aiChatFeature.activeContext.type}
              modelName={modelConfig?.ai_chat}
              explainLoading={explainFeature.explainLoading}
              disabled={analyzeFeature.analyzeLoading}
              onClose={() => aiChatFeature.setOpen(false)}
              onGenerateExplainCards={handleGenerateExplainCardsFromChat}
              onSend={(question) =>
                aiChatFeature.sendQuestion({
                  question,
                  articleText: analyzeFeature.lockedText?.trim() || text.trim(),
                  analysis: analyzeFeature.data,
                  level,
                  targetLang,
                })
              }
            />
          }
          onAskAiForVocab={handleAskAiForVocab}
          onAskAiForGrammar={handleAskAiForGrammar}
          aiChatDisabled={!(analyzeFeature.lockedText?.trim() || text.trim())}
          saving={historyFeature.saveLoading}
          saveError={historyFeature.saveError}
          saveSuccess={historyFeature.saveSuccess}
          saveSuccessLeaving={historyFeature.saveSuccessLeaving}
          exporting={exportFeature.exporting}
          exportError={exportFeature.exportError}
          targetLang={targetLang}
          modelConfig={modelConfig}
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
      </div>
    </main>
  );
}
