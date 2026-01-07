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
  onConfirm: () => void;
  onClear: () => void;

  onExplainRequest?: (payload: { selectedText: string; context: string }) => void;
};

export function InputPanel({
  level,
  setLevel,
  draftText,
  setDraftText,
  lockedText,
  loading,
  onConfirm,
  onClear,
  onExplainRequest
}: Props) {
  const canConfirm = !loading && draftText.trim().length > 0; // control if can use confirm buttom

  return (
    <div style={card}>
      <div style={rowBetween}>
        <div style={{ fontWeight: 700 }}>Input</div>
        <select // level selcetion
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          disabled={loading}
          style={select}
        >
          {LEVELS.map((lv) => (
            <option key={lv} value={lv}>
              {lv}
            </option>
          ))}
        </select>
      </div>

      {!lockedText ? ( // two branch
        <>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Input text…"
            style={textarea}
            disabled={loading}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button style={primaryBtn} onClick={onConfirm} disabled={!canConfirm}>
              Confirm
            </button>
            <button style={ghostBtn} onClick={onClear} disabled={loading && draftText.length === 0}>
              Clear
            </button>
          </div>
        </>
      ) : (
        <>
          <LockedTextViewer
            text={lockedText}
            style={lockedBox}
            disabled={loading}
            onExplainRequest={(payload) => onExplainRequest?.(payload)}
          />

          <div style={{ marginTop: 10 }}>
            {loading ? (
              <button style={ghostBtn} disabled>
                Loading…
              </button>
            ) : (
              <button style={ghostBtn} onClick={onClear}>
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
  background: "#11131c",
  border: "1px solid #23263a",
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
  background: "#141622",
  color: "#e8e8ea",
  border: "1px solid #23263a",
  borderRadius: 10,
  padding: "8px 10px",
};

const textarea: React.CSSProperties = {
  width: "100%",
  height: 320,
  resize: "vertical",
  borderRadius: 14,
  padding: 12,
  border: "1px solid #2a2d41",
  background: "#0d0f17",
  color: "#e8e8ea",
  outline: "none",
  lineHeight: 1.5,
};

const lockedBox: React.CSSProperties = {
  width: "100%",
  height: 320,
  overflow: "auto",
  borderRadius: 14,
  padding: 12,
  border: "1px solid #2a2d41",
  background: "#0d0f17",
  whiteSpace: "pre-wrap",
  lineHeight: 1.5,
};

const primaryBtn: React.CSSProperties = {
  border: "1px solid #2a2d41",
  background: "#e8e8ea",
  color: "#0b0c10",
  borderRadius: 12,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const ghostBtn: React.CSSProperties = {
  border: "1px solid #2a2d41",
  background: "transparent",
  color: "#e8e8ea",
  borderRadius: 12,
  padding: "10px 12px",
  cursor: "pointer",
};
