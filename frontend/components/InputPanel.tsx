"use client";

import React from "react";
import type { Level } from "@/lib/types";
import { LockedTextViewer } from "@/components/LockedTextViewer";

const LEVELS: Level[] = ["N5", "N4", "N3", "N2", "N1"];

type Props = {
  level: Level;
  setLevel: (lv: Level) => void;

  draftText: string;
  setDraftText: (t: string) => void;

  lockedText: string | null;

  loading: boolean;
  onAnalyzeRequest: () => void;
  onClear: () => void;

  onExplainRequest?: (payload: { selectedText: string; context: string }) => void;

  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function InputPanel({
  level,
  setLevel,
  draftText,
  setDraftText,
  lockedText,
  loading,
  onAnalyzeRequest: onConfirm,
  onClear,
  onExplainRequest,
  theme,
  onToggleTheme
}: Props) {
  const canConfirm = !loading && draftText.trim().length > 0; // control if can use confirm buttom

  return (
    <div style={card}>
      <div style={rowBetween}>
        <div style={{ fontWeight: 700 }}>Input</div>
        <div style={rightTools}>
          <button // toggle theme
            style={ghostBtnSmall}
            onClick={onToggleTheme}
            disabled={loading}
            className="btn-interactive"
          >
            {theme === "light" ? "Light" : "Dark"}
          </button>
          <select // level selection
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            disabled={loading}
            style={select}
            className="btn-interactive"
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!lockedText ? ( 
        <>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Input text…"
            style={textarea}
            disabled={loading}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button style={primaryBtn} onClick={onConfirm} disabled={!canConfirm} className="btn-interactive">
              Confirm
            </button>
            <button style={ghostBtn} onClick={onClear} disabled={loading && draftText.length === 0} className="btn-interactive">
              Clear
            </button>
          </div>
        </>
      ) : (
        <>
          <LockedTextViewer  // if text locked, then throw it to LockedTextViewer 
            text={lockedText}
            style={lockedBox}
            disabled={loading}
            onExplainRequest={(payload) => onExplainRequest?.(payload)}
          />

          <div style={{ marginTop: 10 }}>
            {loading ? (
              <button style={ghostBtn} disabled className="btn-interactive" >
                Loading…
              </button>
            ) : (
              <button style={ghostBtn} onClick={onClear} className="btn-interactive">
                Clear All
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}



const card: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
};

const rowBetween: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const select: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "8px 10px",
};

const textarea: React.CSSProperties = {
  width: "100%",
  height: 320,
  resize: "vertical",
  borderRadius: 14,
  padding: 12,
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
  outline: "none",
  lineHeight: 1.5,
};

const lockedBox: React.CSSProperties = {
  width: "100%",
  height: "70vh",
  overflow: "auto",
  borderRadius: 14,
  padding: 12,
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  whiteSpace: "pre-wrap",
  lineHeight: 1.5,
};

const primaryBtn: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "var(--text)",
  color: "var(--text-invert)",
  borderRadius: 14,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const ghostBtn: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "transparent",
  color: "var(--text)",
  borderRadius: 14,
  padding: "10px 12px",
  cursor: "pointer",
};

const rightTools: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const ghostBtnSmall: React.CSSProperties = {
  ...ghostBtn,
  padding: "8px 10px",
  borderRadius: 14,
};