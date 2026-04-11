"use client";

import React from "react";
import type { ResultSummaryResponse, TargetLang } from "@/lib/types";

type Props = {
  open: boolean;
  targetLang: TargetLang;
  results: ResultSummaryResponse[];
  loading: boolean;
  error: string | null;
  loadingResultId: string | null;
  onClose: () => void;
  onLoad: (resultId: string) => void;
  onRefresh: () => void;
};

export function SavedResultsPanel({
  open,
  results,
  loading,
  error,
  loadingResultId,
  onClose,
  onLoad,
  onRefresh,
}: Props) {
  return (
    <div
      style={{
        ...overlay,
        ...(open ? overlayVisible : overlayHidden),
      }}
      onMouseDown={open ? onClose : undefined}
      aria-hidden={!open}
    >
      <aside
        style={{
          ...panel,
          ...(open ? panelVisible : panelHidden),
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={header}>
          <div>
            <div style={title}>History</div>
            <div style={subtitle}>{results.length} saved result{results.length === 1 ? "" : "s"}</div>
          </div>
          <div style={headerActions}>
            <button className="btn-interactive" style={secondaryButton} onClick={onRefresh} disabled={loading}>
              Refresh
            </button>
            <button className="btn-interactive" style={secondaryButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {error ? <div style={errorBox}>History error: {error}</div> : null}

        <div style={content}>
          {loading ? (
            <div style={emptyState}>Loading history...</div>
          ) : results.length === 0 ? (
            <div style={emptyState}>No saved results yet.</div>
          ) : (
            <ul style={list}>
              {results.map((item) => (
                <li key={item.id} style={card}>
                  <div style={cardTop}>
                    <div style={cardTitle}>{item.title?.trim() || buildPreview(item.text, 28)}</div>
                    <div style={meta}>{item.level} · {formatDate(item.created_at)}</div>
                  </div>
                  <div style={preview}>{buildPreview(item.text, 120)}</div>
                  <div style={cardActions}>
                    <button
                      className="btn-interactive"
                      style={primaryButton}
                      onClick={() => onLoad(item.id)}
                      disabled={loadingResultId === item.id}
                    >
                      {loadingResultId === item.id ? "Loading..." : "Load"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function buildPreview(text: string, maxLength: number): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return compact.slice(0, maxLength).trimEnd() + "...";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  background: "rgba(15, 18, 28, 0.18)",
  transition: "opacity 320ms ease",
};

const overlayVisible: React.CSSProperties = {
  opacity: 1,
  pointerEvents: "auto",
};

const overlayHidden: React.CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
};

const panel: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "min(66vw, 960px)",
  minWidth: 360,
  background: "var(--panel)",
  borderRight: "1px solid var(--border)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.16)",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease",
  willChange: "transform, opacity",
};

const panelVisible: React.CSSProperties = {
  opacity: 1,
  transform: "translateX(0)",
};

const panelHidden: React.CSSProperties = {
  opacity: 0,
  transform: "translateX(-72px)",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const headerActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const title: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 24,
};

const subtitle: React.CSSProperties = {
  opacity: 0.7,
  marginTop: 4,
};

const content: React.CSSProperties = {
  minHeight: 0,
  overflowY: "auto",
};

const list: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--surface)",
  borderRadius: 16,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minHeight: 180,
};

const cardTop: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const cardTitle: React.CSSProperties = {
  fontWeight: 700,
  lineHeight: 1.35,
};

const meta: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.7,
};

const preview: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  opacity: 0.85,
  flex: 1,
};

const cardActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
};

const primaryButton: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "rgba(var(--accent-rgb), 0.2)",
  color: "var(--text)",
  borderRadius: 14,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "transparent",
  color: "var(--text)",
  borderRadius: 14,
  padding: "8px 12px",
  cursor: "pointer",
};

const emptyState: React.CSSProperties = {
  opacity: 0.7,
  padding: 20,
  border: "1px dashed var(--border)",
  borderRadius: 16,
  background: "var(--surface)",
};

const errorBox: React.CSSProperties = {
  border: "1px solid #5a2a2a",
  background: "#1a0f12",
  color: "#ffb5b5",
  borderRadius: 14,
  padding: 10,
};
