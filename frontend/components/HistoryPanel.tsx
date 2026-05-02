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
import type {
  ArticleHistoryItemResponse,
  GrammarHistoryItemResponse,
  HistorySortOrder,
  HistoryView,
  TargetLang,
  VocabHistoryItemResponse,
} from "@/lib/types";
import { UI_STRINGS } from "@/lib/i18n";

type Props = {
  open: boolean;
  targetLang: TargetLang;
  historyView: HistoryView;
  historySortOrder: HistorySortOrder;
  articleHistory: ArticleHistoryItemResponse[];
  vocabHistory: VocabHistoryItemResponse[];
  grammarHistory: GrammarHistoryItemResponse[];
  loading: boolean;
  error: string | null;
  loadingResultId: string | null;
  deletingResultId: string | null;
  onClose: () => void;
  onLoad: (resultId: string) => void;
  onDelete: (resultId: string) => void;
  onRefresh: () => void;
  onViewChange: (view: HistoryView) => void;
  onSortOrderChange: (order: HistorySortOrder) => void;
};

export function HistoryPanel({
  open,
  targetLang,
  historyView,
  historySortOrder,
  articleHistory,
  vocabHistory,
  grammarHistory,
  loading,
  error,
  loadingResultId,
  deletingResultId,
  onClose,
  onLoad,
  onDelete,
  onRefresh,
  onViewChange,
  onSortOrderChange,
}: Props) {
  const tUI = UI_STRINGS[targetLang];
  const visibleCount = getVisibleCount(historyView, articleHistory, vocabHistory, grammarHistory);

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
            <div style={subtitle}>{visibleCount} {tUI.historyPanel.historyItems}</div>
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
              <span style={maskedIconStyle(refreshIcon.src, 18)} aria-hidden="true" />
              {tUI.historyPanel.refresh}
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

        <div style={controlsRow}>
          <div style={tabs} role="tablist" aria-label={tUI.historyPanel.title}>
            <HistoryTab
              active={historyView === "articles"}
              label={tUI.historyPanel.articlesTab}
              onClick={() => onViewChange("articles")}
            />
            <HistoryTab
              active={historyView === "vocab"}
              label={tUI.historyPanel.vocabTab}
              onClick={() => onViewChange("vocab")}
            />
            <HistoryTab
              active={historyView === "grammar"}
              label={tUI.historyPanel.grammarTab}
              onClick={() => onViewChange("grammar")}
            />
          </div>
          <div style={sortControls}>
            <span style={toolbarLabel}>{tUI.historyPanel.sortByTime}</span>
            <button
              className="btn-interactive"
              style={historySortOrder === "desc" ? activeTab : tab}
              onClick={() => onSortOrderChange("desc")}
              type="button"
              aria-pressed={historySortOrder === "desc"}
            >
              {tUI.historyPanel.newestFirst}
            </button>
            <button
              className="btn-interactive"
              style={historySortOrder === "asc" ? activeTab : tab}
              onClick={() => onSortOrderChange("asc")}
              type="button"
              aria-pressed={historySortOrder === "asc"}
            >
              {tUI.historyPanel.oldestFirst}
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
          ) : historyView === "articles" ? (
            <ArticleList
              targetLang={targetLang}
              articleHistory={articleHistory}
              loadingResultId={loadingResultId}
              deletingResultId={deletingResultId}
              onLoad={onLoad}
              onDelete={onDelete}
            />
          ) : historyView === "vocab" ? (
            <VocabList
              targetLang={targetLang}
              vocabHistory={vocabHistory}
              loadingResultId={loadingResultId}
              onLoad={onLoad}
            />
          ) : (
            <GrammarList
              targetLang={targetLang}
              grammarHistory={grammarHistory}
              loadingResultId={loadingResultId}
              onLoad={onLoad}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function HistoryTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="btn-interactive"
      style={active ? activeTab : tab}
      onClick={onClick}
      type="button"
      role="tab"
      aria-selected={active}
    >
      {label}
    </button>
  );
}

function ArticleList({
  targetLang,
  articleHistory,
  loadingResultId,
  deletingResultId,
  onLoad,
  onDelete,
}: {
  targetLang: TargetLang;
  articleHistory: ArticleHistoryItemResponse[];
  loadingResultId: string | null;
  deletingResultId: string | null;
  onLoad: (resultId: string) => void;
  onDelete: (resultId: string) => void;
}) {
  const tUI = UI_STRINGS[targetLang];

  if (articleHistory.length === 0) {
    return (
      <div style={emptyState}>
        <div style={stateTitle}>{tUI.historyPanel.emptyTitle}</div>
        <div style={stateText}>{tUI.historyPanel.emptyText}</div>
      </div>
    );
  }

  return (
    <ul style={list}>
      {articleHistory.map((item) => (
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
              <span style={maskedIconStyle(loadResultIcon.src, 18)} aria-hidden="true" />
              {loadingResultId === item.id ? tUI.historyPanel.loadLoading : tUI.historyPanel.load}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function VocabList({
  targetLang,
  vocabHistory,
  loadingResultId,
  onLoad,
}: {
  targetLang: TargetLang;
  vocabHistory: VocabHistoryItemResponse[];
  loadingResultId: string | null;
  onLoad: (resultId: string) => void;
}) {
  const tUI = UI_STRINGS[targetLang];

  if (vocabHistory.length === 0) {
    return (
      <div style={emptyState}>
        <div style={stateTitle}>{tUI.historyPanel.emptyVocabTitle}</div>
        <div style={stateText}>{tUI.historyPanel.emptyVocabText}</div>
      </div>
    );
  }

  return (
    <ul style={list}>
      {vocabHistory.map((item) => (
        <li key={item.id} style={card}>
          <div style={cardTop}>
            <div style={cardTitle}>{item.expression}</div>
            {item.reading ? <div style={reading}>{item.reading}</div> : null}
            <div style={preview}>{item.definition}</div>
          </div>
          {item.example ? (
            <div style={example}>{tUI.historyPanel.exampleLabel}: {item.example}</div>
          ) : null}
          <SourceBlock item={item} targetLang={targetLang} />
          <div style={cardActions}>
            <button
              className="btn-interactive"
              style={loadResultBtn}
              onClick={() => onLoad(item.result_id)}
              disabled={loadingResultId === item.result_id}
            >
              <span style={maskedIconStyle(loadResultIcon.src, 18)} aria-hidden="true" />
              {loadingResultId === item.result_id
                ? tUI.historyPanel.loadLoading
                : tUI.historyPanel.loadArticle}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function GrammarList({
  targetLang,
  grammarHistory,
  loadingResultId,
  onLoad,
}: {
  targetLang: TargetLang;
  grammarHistory: GrammarHistoryItemResponse[];
  loadingResultId: string | null;
  onLoad: (resultId: string) => void;
}) {
  const tUI = UI_STRINGS[targetLang];

  if (grammarHistory.length === 0) {
    return (
      <div style={emptyState}>
        <div style={stateTitle}>{tUI.historyPanel.emptyGrammarTitle}</div>
        <div style={stateText}>{tUI.historyPanel.emptyGrammarText}</div>
      </div>
    );
  }

  return (
    <ul style={list}>
      {grammarHistory.map((item) => (
        <li key={item.id} style={card}>
          <div style={cardTop}>
            <div style={cardTitle}>{item.expression}</div>
            <div style={preview}>{item.definition}</div>
          </div>
          {item.example ? (
            <div style={example}>{tUI.historyPanel.exampleLabel}: {item.example}</div>
          ) : null}
          <SourceBlock item={item} targetLang={targetLang} />
          <div style={cardActions}>
            <button
              className="btn-interactive"
              style={loadResultBtn}
              onClick={() => onLoad(item.result_id)}
              disabled={loadingResultId === item.result_id}
            >
              <span style={maskedIconStyle(loadResultIcon.src, 18)} aria-hidden="true" />
              {loadingResultId === item.result_id
                ? tUI.historyPanel.loadLoading
                : tUI.historyPanel.loadArticle}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SourceBlock({
  item,
  targetLang,
}: {
  item: VocabHistoryItemResponse | GrammarHistoryItemResponse;
  targetLang: TargetLang;
}) {
  const tUI = UI_STRINGS[targetLang];

  return (
    <div style={source}>
      <div style={sourceTitle}>
        {tUI.historyPanel.sourceLabel}: {item.source_title?.trim() || item.source_text_preview}
      </div>
      <div style={meta}>{item.source_level} · {formatDate(item.source_created_at)}</div>
    </div>
  );
}

function getVisibleCount(
  historyView: HistoryView,
  articleHistory: ArticleHistoryItemResponse[],
  vocabHistory: VocabHistoryItemResponse[],
  grammarHistory: GrammarHistoryItemResponse[],
): number {
  if (historyView === "vocab") return vocabHistory.length;
  if (historyView === "grammar") return grammarHistory.length;
  return articleHistory.length;
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

const controlsRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 10,
};

const tabs: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const toolbarLabel: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.72,
  whiteSpace: "nowrap",
};

const sortControls: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
};

const tab: React.CSSProperties = {
  ...buttonSm,
  ...buttonSecondary,
};

const activeTab: React.CSSProperties = {
  ...buttonSm,
  ...buttonPrimary,
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

const reading: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.68,
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

const example: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.45,
  opacity: 0.78,
};

const source: React.CSSProperties = {
  borderTop: "1px solid var(--border)",
  paddingTop: 10,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const sourceTitle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.4,
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
