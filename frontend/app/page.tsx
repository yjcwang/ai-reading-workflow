"use client";

import React, { useState } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { ExplainModal } from "@/components/ExplainModal";
import { SavedResultsPanel } from "@/components/SavedResultsPanel";
import { useTheme } from "@/hooks/useTheme";
import { useTargetLang } from "@/hooks/useTargetLang";
import { useExplainFeature, inferExplainMode } from "@/hooks/useExplainFeature";
import { useAnalyzeFeature } from "@/hooks/useAnalyzeFeature";
import { useExportPdf } from "@/hooks/useExportPdf";
import { useGenerateTextFeature } from "@/hooks/useGenerateTextFeature";
import { useSavedResultsFeature } from "@/hooks/useSavedResultsFeature";
import {
  addItemFromExplain,
  deleteGrammarByExpression,
  deleteVocabByExpression,
} from "@/lib/item-helpers";
import type {
  ExplainWordResponse,
  GenerateTextRequest,
  Level,
  SaveResultRequest,
  SavedResultResponse,
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
  const savedResultsFeature = useSavedResultsFeature();
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
    await savedResultsFeature.refreshHistory();
  }

  async function handleLoadSavedResult(resultId: string) {
    const saved = await savedResultsFeature.fetchSavedResultDetail(resultId);
    if (!saved) return;

    applySavedResult(saved);
    setHistoryOpen(false);
  }

  async function handleSaveCurrentResult() {
    const currentText = analyzeFeature.lockedText?.trim() || text.trim();
    const hasResult = analyzeFeature.data.vocab.length > 0 || analyzeFeature.data.grammar.length > 0;

    if (!currentText || !hasResult) return;

    const payload: SaveResultRequest = {
      text: currentText,
      level,
      title: null,
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

    await savedResultsFeature.saveCurrentResult(payload);
  }

  function applySavedResult(saved: SavedResultResponse) {
    setText(saved.text);
    analyzeFeature.loadSavedResult(saved.text, {
      vocab: saved.vocab.map((item) => ({
        expression: item.expression,
        reading: item.reading ?? undefined,
        definition: item.definition,
        example: item.example,
        notes: item.notes ?? undefined,
      })),
      grammar: saved.grammar.map((item) => ({
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
    await exportFeature.handleExportPdf(analyzeFeature.data, targetLang);
  }

  return (
    <main style={page}>
      <div style={grid}>
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
          onSaveResult={handleSaveCurrentResult}
          onExportPdf={handleExportPdf}
          saving={savedResultsFeature.saveLoading}
          saveError={savedResultsFeature.saveError}
          saveSuccess={savedResultsFeature.saveSuccess}
          saveSuccessLeaving={savedResultsFeature.saveSuccessLeaving}
          exporting={exportFeature.exporting}
          exportError={exportFeature.exportError}
          targetLang={targetLang}
        />
        <ExplainModal
          open={explainFeature.explainOpen}
          explainLoading={explainFeature.explainLoading}
          error={explainFeature.explainError}
          data={explainFeature.explainData}
          onClose={explainFeature.closeExplain}
          onAdd={handleAddFromModal}
          targetLang={targetLang}
        />
        <SavedResultsPanel
          open={historyOpen}
          targetLang={targetLang}
          results={savedResultsFeature.historyList}
          loading={savedResultsFeature.historyLoading}
          error={savedResultsFeature.historyError}
          loadingResultId={savedResultsFeature.historyLoadingResultId}
          onClose={() => setHistoryOpen(false)}
          onLoad={handleLoadSavedResult}
          onRefresh={savedResultsFeature.refreshHistory}
        />
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  height: "100vh",
  overflow: "hidden",
  padding: 16,
};

const grid: React.CSSProperties = {
  height: "100%",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  minHeight: 0,
};
