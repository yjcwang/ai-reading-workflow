"use client";

import React, { useState } from "react";
import { InputPanel } from "@/components/InputPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { analyze } from "@/lib/api";
import type { AnalyzeResponse, Level } from "@/lib/types";
import { explain } from "@/lib/api";
import type { ExplainResponse } from "@/lib/types";
import { ExplainModal } from "@/components/ExplainModal";

export default function Page() {
  // create data and keep state
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

  async function onConfirm() {
    const text = draftText.trim();
    if (!text) return; // check no empty text

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

  async function handleExplainRequest(payload: { selectedText: string; context: string }) {
    // 打开 modal，先展示 loading
    setExplainOpen(true);
    setExplainLoading(true);
    setExplainError(null);
    setExplainData(null);

    try {
      const res = await explain(payload.selectedText, payload.context);
      setExplainData(res);

      // ✅ 如果你未来要把结果也写进 ResultPanel：
      // setData(prev => ({...prev, ...})) 或者维护 explainHistory
    } catch (e: any) {
      setExplainError(e?.message ?? "Unknown error");
    } finally {
      setExplainLoading(false);
    }
  }

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
          onConfirm={onConfirm}
          onClear={onClear}
          onExplainRequest={handleExplainRequest}
        />
        <ResultPanel data={data} error={error} loading={loading} />
        <ExplainModal
          open={explainOpen}
          loading={explainLoading}
          error={explainError}
          data={explainData}
          onClose={() => setExplainOpen(false)}
        />
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  padding: 20,
  background: "#0b0c10",
  color: "#e8e8ea",
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};
