"use client";

import React, { useEffect } from "react";
import type { ExplainResponse } from "@/lib/types";

type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: ExplainResponse | null;
  onClose: () => void;
};

export function ExplainModal({ open, loading, error, data, onClose }: Props) {
  // ESC 关闭
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div onMouseDown={onClose} style={overlay}>
      <div onMouseDown={(e) => e.stopPropagation()} style={modalCard}>
        <div style={headerRow}>
          <div style={title}>Explain</div>
          <button onClick={onClose} style={closeBtn} className="btn-interactive">
            Close
          </button>
        </div>

        <div style={body}>
          {loading && <div>Loading…</div>}
          {!loading && error && <div style={errorText}>{error}</div>}

          {!loading && !error && data && (
            <div style={contentGrid}>
              <div>
                <b>Type:</b> {data.type}
              </div>
              <div>
                <b>Surface:</b> {data.surface}
              </div>
              {data.reading ? (
                <div>
                  <b>Reading:</b> {data.reading}
                </div>
              ) : null}
              <div>
                <b>Meaning:</b> {data.meaning_en}
              </div>
              <div>
                <b>Example:</b>
                <div style={exampleBox}>{data.example}</div>
              </div>
              {data.notes ? (
                <div>
                  <b>Notes:</b> {data.notes}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** styles */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,

  // 遮罩层放一点透明度
  background: "rgba(0, 0, 0, 0.15)",
};

const modalCard: React.CSSProperties = {
  width: "min(720px, 100%)",
  borderRadius: 14,

  // 卡片本体用深色半透明 + 毛玻璃
  background: "rgba(var(--panel-rgb), 0.5)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",

  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
  padding: 16,

  color: "var(--text)",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const title: React.CSSProperties = {
  fontWeight: 800,
};

const closeBtn: React.CSSProperties = {
  borderRadius: 12,
  padding: "6px 10px",
  background: "rgba(var(--accent-rgb), 0.2)", 
  border: "1px solid var(--border)",
  color: "var(--text)",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  outline: "none",
};

const body: React.CSSProperties = {
  marginTop: 12,
};

const errorText: React.CSSProperties = {
  color: "crimson",
};

const contentGrid: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const exampleBox: React.CSSProperties = {
  marginTop: 4,
  padding: 10,
  border: "1px solid var(--border)",
  borderRadius: 10,
  background: "transparent",
};
