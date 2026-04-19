"use client";

import React from "react";
import historyIcon from "@/icons/history.svg";
import deleteIcon from "@/icons/delete.svg";
import closeIcon from "@/icons/close.svg";
import refreshIcon from "@/icons/refresh.svg";
import loadResultIcon from "@/icons/load_result.svg";
import {
  buttonSm,
  buttonGhost,
  buttonSecondary,
  buttonPrimary,
  iconButtonMd,
  iconButtonSm,
  maskedIconStyle,
} from "@/components/buttonStyles";
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
            <button
              className="btn-interactive"
              style={refreshBtn}
              onClick={onRefresh}
              disabled={loading}
              title={tUI.historyPanel.refresh}
              aria-label={tUI.historyPanel.refresh}
            >
              <>
                <span style={maskedIconStyle(refreshIcon.src, 18)} aria-hidden="true" />
                {tUI.historyPanel.refresh}
              </>
            </button>
            <button
              className="btn-interactive"
              style={closeBtn}
              onClick={onClose}
              title={tUI.historyPanel.close}
              aria-label={tUI.historyPanel.close}
            >
              <span style={maskedIconStyle(closeIcon.src)} aria-hidden="true" />
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
                      style={deleteResultBtn}
                      onClick={() => onDelete(item.id)}
                      disabled={deletingResultId === item.id || loadingResultId === item.id}
                      title={tUI.historyPanel.delete}
                      aria-label={tUI.historyPanel.delete}
                    >
                      {deletingResultId === item.id ? (
                        tUI.historyPanel.deleting
                      ) : (
                        <span style={maskedIconStyle(deleteIcon.src)} aria-hidden="true" />
                      )}
                    </button>
                    <button
                      className="btn-interactive"
                      style={loadResultBtn}
                      onClick={() => onLoad(item.id)}
                      disabled={loadingResultId === item.id || deletingResultId === item.id}
                    >
                      <>
                        <span style={maskedIconStyle(loadResultIcon.src, 18)} aria-hidden="true" />
                        {loadingResultId === item.id ? tUI.historyPanel.loadLoading : tUI.historyPanel.load}
                      </>
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
  return date.toLocaleString();
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
  width: "min(100vw, 960px)",
  maxWidth: "100%",
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

const loadResultBtn: React.CSSProperties = {
  ...buttonSm,
  ...buttonPrimary,
};

const refreshBtn: React.CSSProperties = {
  ...buttonSm,
  ...buttonSecondary,
};

const closeBtn: React.CSSProperties = {
  ...iconButtonMd,
  ...buttonSecondary,
};

const deleteResultBtn: React.CSSProperties = {
  ...iconButtonSm,
  ...buttonGhost,
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
