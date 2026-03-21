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
import {
  addItemFromExplain,
  deleteGrammarByPattern,
  deleteVocabBySurface,
} from "@/lib/item-helpers";
import type {
  ExplainWordResponse,
  Level,
} from "@/lib/types";

export default function Page() {
  const [level, setLevel] = useState<Level>("N2");
  const [draftText, setDraftText] = useState("");

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
    await analyzeFeature.handleAnalyzeRequest(draftText);
  }

  /* ---------- Explainer actions ---------- */
  const explainFeature = useExplainFeature({
    level,
    targetLang,
  });

  /* ---------- Clear all ---------- */
  function onClear() {
    setDraftText("");
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
  function handleDeleteVocab(surface: string) {
    analyzeFeature.setData((prev) => deleteVocabBySurface(prev, surface));
  }

  function handleDeleteGrammar(pattern: string) {
    analyzeFeature.setData((prev) => deleteGrammarByPattern(prev, pattern));
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
          draftText={draftText}
          setDraftText={setDraftText}
          lockedText={analyzeFeature.lockedText}
          loading={analyzeFeature.loading}
          onAnalyzeRequest={handleAnalyzeRequest}
          onClear={onClear}
          onExplainRequest={explainFeature.handleExplainRequest}
          theme={theme}
          onToggleTheme={toggleTheme}
          getMode={inferExplainMode}
          targetLang={targetLang}
          onLanguageChange={handleLanguageChangeWithReset}
        />
        <ResultPanel 
          data={analyzeFeature.data} 
          error={analyzeFeature.error} 
          loading={analyzeFeature.loading} 
          onDeleteVocab={handleDeleteVocab}
          onDeleteGrammar={handleDeleteGrammar}
          onExportPdf={handleExportPdf}
          exporting={exportFeature.exporting}
          exportError={exportFeature.exportError}
          targetLang={targetLang}
        />
        <ExplainModal
          open={explainFeature.explainOpen}
          loading={explainFeature.explainLoading}
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

