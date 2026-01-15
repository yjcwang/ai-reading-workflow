"use client";

import React, { useState, useEffect } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { analyze, explain, exportPdf} from "@/lib/api";
import type { AnalyzeResponse, Level } from "@/lib/types";
import type { ExplainResponse, ExplainWordResponse, ExplainSentenceResponse } from "@/lib/types";
import { ExplainModal } from "@/components/ExplainModal";
import { downloadBlob } from "@/lib/utils";

type Theme = "light" | "dark";
const THEME_KEY = "theme";

export default function Page() {
  // create data, setter, and keep state
  const [theme, setTheme] = useState<Theme>("light");

  const [level, setLevel] = useState<Level>("N3");

  const [draftText, setDraftText] = useState("");
  const [lockedText, setLockedText] = useState<string | null>(null);

  const [data, setData] = useState<AnalyzeResponse>({ vocab: [], grammar: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /* ---------- Switch theme ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;

    const initial: Theme = saved === "dark" || saved === "light"
      ? saved
      : "light"; 

    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  }

  /* ---------- Analyzer actions ---------- */
  async function handleAnalyzeRequest() {
    const text = draftText.trim();
    if (!text) return; 

    setLockedText(text);
    setLoading(true); // loading until data extraction finished
    setError(null);

    try {
      const res = await analyze(text, level); // api engaged extract text
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setData({ vocab: [], grammar: [] });
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Explainer actions ---------- */
  function inferExplainMode(selectedText: string): "word" | "sentence" {
    if (selectedText.length >= 12) return "sentence";
    return "word";
  }

  async function handleExplainRequest(payload: { selectedText: string; context: string }) {
    // first loading
    setExplainOpen(true);
    setExplainLoading(true);
    setExplainError(null);
    setExplainData(null);

    // based on the textLength to explain to infer sentence/ word mode
    const mode = inferExplainMode(payload.selectedText) 
    try {
      const res = await explain(payload.selectedText, payload.context, mode);
      if (res.kind === "sentence") {
        setExplainData({
          ...res,
          sentence_jp: payload.selectedText,
        });
      } else {
        setExplainData(res);
      }
    } catch (e: any) {
      setExplainError(e?.message ?? "Unknown error");
    } finally {
      setExplainLoading(false);
    }
  }
  
  /* ---------- Clear all ---------- */
  function onClear() {
    // set all state back to initial
    setDraftText("");
    setLockedText(null);
    setData({ vocab: [], grammar: [] });
    setError(null);

    setExplainOpen(false);
    setExplainLoading(false);
    setExplainError(null);
    setExplainData(null);

    setExporting(false);
    setExportError(null);
  }
  
  /* ---------- Add from Modal ---------- */
  function handleAddFromModal(item: ExplainWordResponse) {
  setData((prev) => {
    if (item.type === "vocab") {
      const newItem = {
        surface: item.surface,
        reading: item.reading ?? undefined,
        meaning_en: item.meaning_en,
        example: item.example,
        notes: item.notes ?? undefined,  // TODO: add in notes that this is added by user or other way to distinguish AI/manual
      };
      if (prev.vocab.some((v) => v.surface === newItem.surface)) return prev;
      return {
        ...prev,
        vocab: [newItem, ...prev.vocab],
      };
    } else {
      const newItem = {
        pattern: item.surface,                 
        explanation_en: item.meaning_en,       
        example: item.example,
        notes: item.notes ?? undefined,
      };
      if (prev.grammar.some((g) => g.pattern === newItem.pattern)) return prev; 
      return {
        ...prev,
        grammar: [newItem, ...prev.grammar],
      };
    }
  });
}


/* ---------- Delete from list on ResultPanel ---------- */
function handleDeleteVocab(surface: string) {
  setData((prev) => ({
    ...prev,
    vocab: prev.vocab.filter((v) => v.surface !== surface),
  }));
}

function handleDeleteGrammar(pattern: string) {
  setData((prev) => ({
    ...prev,
    grammar: prev.grammar.filter((g) => g.pattern !== pattern),
  }));
}

/* ---------- Export and Download PDF ---------- */

async function handleExportPdf() {
  try {
    setExporting(true);
    setExportError(null);

    const blob = await exportPdf(data); // get pdf blob via api from backend
    downloadBlob(blob, "my-list.pdf"); // then download at frontend
  } catch (e: any) {
    setExportError(e?.message ?? "Export failed");
  } finally {
    setExporting(false);
  }
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
          lockedText={lockedText}
          loading={loading}
          onAnalyzeRequest={handleAnalyzeRequest}
          onClear={onClear}
          onExplainRequest={handleExplainRequest}
          theme={theme}
          onToggleTheme={toggleTheme}
          getMode={inferExplainMode}
        />
        <ResultPanel 
          data={data} 
          error={error} 
          loading={loading} 
          onDeleteVocab={handleDeleteVocab}
          onDeleteGrammar={handleDeleteGrammar}
          onExportPdf={handleExportPdf}
          exporting={exporting}
          exportError={explainError}
        />
        <ExplainModal
          open={explainOpen}
          loading={explainLoading}
          error={explainError}
          data={explainData}
          onClose={() => setExplainOpen(false)}
          onAdd={handleAddFromModal}
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

