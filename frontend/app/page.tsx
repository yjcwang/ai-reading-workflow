"use client";

import React, { useState} from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { ExplainModal } from "@/components/ExplainModal";
import { useTheme } from "@/hooks/useTheme";
import { useTargetLang } from "@/hooks/useTargetLang";
import { useExplainFeature, inferExplainMode } from "@/hooks/useExplainFeature";
import { useAnalyzeFeature } from "@/hooks/useAnalyzeFeature";
import { useExportPdf } from "@/hooks/useExportPdf";
import { useGenerateTextFeature } from "@/hooks/useGenerateTextFeature";
import {
  addItemFromExplain,
  deleteGrammarByExpression,
  deleteVocabByExpression,
} from "@/lib/item-helpers";
import type {
  ExplainWordResponse,
  Level,
  GenerateTextRequest,
} from "@/lib/types";
import { DEFAULT_GENERATE_REQUEST } from "@/lib/types";

export default function Page() {
  const [level, setLevel] = useState<Level>("N2");
  const [text, setText] = useState("");
  const [generateRequest, setGenerateRequest] = useState<GenerateTextRequest>(
    DEFAULT_GENERATE_REQUEST 
  );

  /* ---------- Toggle theme ---------- */
  const { theme, toggleTheme } = useTheme();

  /* ---------- Controll Language ---------- */
  const { targetLang, handleLanguageChange } = useTargetLang();

  /* ---------- Analyzer actions ---------- */
  const analyzeFeature = useAnalyzeFeature({
    level,
    targetLang,
  });

  async function handleAnalyzeRequest() {
    await analyzeFeature.handleAnalyzeRequest(text);
  }

  /* ---------- Generate text ---------- */
  const generateFeature = useGenerateTextFeature({ level });
  function handleGenerateRequestChange(patch: Partial<GenerateTextRequest>) { // patch is update of only a part, e.g. { topic: "校园生活" }
    setGenerateRequest((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  async function handleGenerateRequest(): Promise<boolean> {
    const topic = generateRequest.topic.trim();

    if (!topic) {
      return false;
    }
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

  /* ---------- Explainer actions ---------- */
  const explainFeature = useExplainFeature({
    level,
    targetLang,
  });

  async function handleExplainRequest(payload: {
    selectedText: string;
    context: string;
  }) {
    await explainFeature.handleExplainRequest(payload);
  }

  /* ---------- Clear all ---------- */
  function onClear() {
    setText("");
    setGenerateRequest(DEFAULT_GENERATE_REQUEST);
    analyzeFeature.resetAnalyze();
    explainFeature.resetExplain();
    exportFeature.resetExport();
  }

  /* ---------- Change Language ---------- */
  function handleLanguageChangeWithReset(newLang: typeof targetLang) {
    if (newLang === targetLang) return;
    onClear();
    handleLanguageChange(newLang);
  }
  
  /* ---------- Add from Modal ---------- */
  function handleAddFromModal(item: ExplainWordResponse) {
    analyzeFeature.setData((prev) => addItemFromExplain(prev, item));
  }

  /* ---------- Delete from list on ResultPanel ---------- */
  function handleDeleteVocab(expression: string) {
    analyzeFeature.setData((prev) => deleteVocabByExpression(prev, expression));
  }

  function handleDeleteGrammar(expression: string) {
    analyzeFeature.setData((prev) => deleteGrammarByExpression(prev, expression));
  }

  /* ---------- Export and Download PDF ---------- */
  const exportFeature = useExportPdf({
    filename: "my-list.pdf",
  });

  async function handleExportPdf() {
    await exportFeature.handleExportPdf(analyzeFeature.data, targetLang);
  }

  /* ---------- Render ---------- */
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
          onExportPdf={handleExportPdf}
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
