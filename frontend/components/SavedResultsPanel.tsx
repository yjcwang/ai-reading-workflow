"use client";

import React from "react";
import historyIcon from "@/icons/history.svg";
import deleteIcon from "@/icons/delete.svg";
import type { ResultSummaryResponse, TargetLang } from "@/lib/types";
import { UI_STRINGS } from "@/lib/i18n";

type Props = {
  open: boolean;
  targetLang: TargetLang;
  results: ResultSummaryResponse[];
  loading: boolean;
  error: string | null;
  loadingResultId: string | null;
  deletingResultId: string | null;
  onClose: () => void;
  onLoad: (resultId: string) => void;
  onDelete: (resultId: string) => void;
  onRefresh: () => void;
};

export function SavedResultsPanel({
  open,
  targetLang,
  results,
  loading,
  error,
  loadingResultId,
  deletingResultId,
  onClose,
  onLoad,
  onDelete,
  onRefresh,
}: Props) {
  const tUI = UI_STRINGS[targetLang];

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
          <div style={titleBlock}>
            <div style={titleRow}>
              <span
                style={{
                  ...headerIcon,
                  WebkitMaskImage: `url(${historyIcon.src})`,
                  maskImage: `url(${historyIcon.src})`,
                }}
                aria-hidden="true"
              />
              <div style={title}>{tUI.historyPanel.title}</div>
            </div>
            <div style={subtitle}>{results.length} {tUI.historyPanel.savedResults}</div>
          </div>
          <div style={headerActions}>
            <button className="btn-interactive" style={secondaryButton} onClick={onRefresh} disabled={loading}>
              {tUI.historyPanel.refresh}
            </button>
            <button className="btn-interactive" style={secondaryButton} onClick={onClose}>
              {tUI.historyPanel.close}
            </button>
          </div>
        </div>

        {error ? <div style={errorBox}>{tUI.historyPanel.errorPrefix}: {error}</div> : null}

        <div style={content}>
          {loading ? (
            <div style={emptyState}>
              <div style={stateTitle}>{tUI.historyPanel.loadingTitle}</div>
              <div style={stateText}>{tUI.historyPanel.loadingText}</div>
            </div>
          ) : results.length === 0 ? (
            <div style={emptyState}>
              <div style={stateTitle}>{tUI.historyPanel.emptyTitle}</div>
              <div style={stateText}>{tUI.historyPanel.emptyText}</div>
            </div>
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
                      style={dangerButton}
                      onClick={() => onDelete(item.id)}
                      disabled={deletingResultId === item.id || loadingResultId === item.id}
                      title={tUI.historyPanel.delete}
                      aria-label={tUI.historyPanel.delete}
                    >
                      {deletingResultId === item.id ? (
                        tUI.historyPanel.deleting
                      ) : (
                        <span
                          style={{
                            ...actionIcon,
                            WebkitMaskImage: `url(${deleteIcon.src})`,
                            maskImage: `url(${deleteIcon.src})`,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                    <button
                      className="btn-interactive"
                      style={primaryButton}
                      onClick={() => onLoad(item.id)}
                      disabled={loadingResultId === item.id || deletingResultId === item.id}
                    >
                      {loadingResultId === item.id ? tUI.historyPanel.loadLoading : tUI.historyPanel.load}
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

const titleBlock: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const headerActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const headerIcon: React.CSSProperties = {
  width: 24,
  height: 24,
  display: "inline-block",
  backgroundColor: "var(--text)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  flexShrink: 0,
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
  gap: 8,
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

const dangerButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--text)",
  borderRadius: 14,
  minWidth: 40,
  minHeight: 40,
  padding: 8,
  cursor: "pointer",
};

const actionIcon: React.CSSProperties = {
  width: 18,
  height: 18,
  display: "inline-block",
  backgroundColor: "currentColor",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
};

const emptyState: React.CSSProperties = {
  opacity: 0.7,
  padding: 20,
  border: "1px dashed var(--border)",
  borderRadius: 16,
  background: "var(--surface)",
};

const stateTitle: React.CSSProperties = {
  fontWeight: 700,
  marginBottom: 6,
};

const stateText: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
};

const errorBox: React.CSSProperties = {
  border: "1px solid #5a2a2a",
  background: "#1a0f12",
  color: "#ffb5b5",
  borderRadius: 14,
  padding: 10,
};
