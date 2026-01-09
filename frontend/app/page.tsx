"use client";

import React, { useState, useEffect } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { analyze } from "@/lib/api";
import type { AnalyzeResponse, Level } from "@/lib/types";
import { explain } from "@/lib/api";
import type { ExplainResponse } from "@/lib/types";
import { ExplainModal } from "@/components/ExplainModal";

type Theme = "light" | "dark";
const THEME_KEY = "theme";

export default function Page() {
  // create data, setter, and keep state
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

  const [theme, setTheme] = useState<Theme>("light");

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
  async function handleExplainRequest(payload: { selectedText: string; context: string }) {
    // first loading
    setExplainOpen(true);
    setExplainLoading(true);
    setExplainError(null);
    setExplainData(null);

    try {
      const res = await explain(payload.selectedText, payload.context);
      setExplainData(res);
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
  }
  
  /* ---------- Add from Modal ---------- */
  function handleAddFromModal(item: ExplainResponse) {
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
        />
        <ResultPanel 
          data={data} 
          error={error} 
          loading={loading} 
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

