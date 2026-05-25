"use client";

import React, { useState } from "react";
import historyIcon from "@/icons/history.svg";
import deleteIcon from "@/icons/delete.svg";
import closeIcon from "@/icons/close.svg";
import clearIcon from "@/icons/clear.svg";
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
  historySearchQuery: string;
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
  onSearchQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
};

export function HistoryPanel({
  open,
  targetLang,
  historyView,
  historySortOrder,
  historySearchQuery,
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
  onSearchQueryChange,
  onSearch,
  onClearSearch,
}: Props) {
  const tUI = UI_STRINGS[targetLang];
  const visibleCount = getVisibleCount(historyView, articleHistory, vocabHistory, grammarHistory);
  const hasSearchQuery = historySearchQuery.trim().length > 0;

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
          <form
            style={searchRow}
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(historySearchQuery);
            }}
          >
            <input
              style={searchInput}
              value={historySearchQuery}
              onChange={(e) => {
                const nextQuery = e.target.value;
                onSearchQueryChange(nextQuery);
                if (!nextQuery.trim()) {
                  onClearSearch();
                }
              }}
              placeholder={tUI.historyPanel.searchPlaceholder}
              aria-label={tUI.historyPanel.searchPlaceholder}
            />
            {hasSearchQuery ? (
              <button
                className="btn-interactive"
                style={clearSearchBtn}
                onClick={onClearSearch}
                type="button"
                title={tUI.historyPanel.clearSearch}
                aria-label={tUI.historyPanel.clearSearch}
              >
                <span style={maskedIconStyle(clearIcon.src)} aria-hidden="true" />
              </button>
            ) : null}
            <button
              className="btn-interactive"
              style={searchBtn}
              type="submit"
              disabled={loading || !hasSearchQuery}
            >
              {tUI.historyPanel.search}
            </button>
          </form>
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
  const [activeLoadKey, setActiveLoadKey] = useState<string | null>(null);

  if (vocabHistory.length === 0) {
    return (
      <div style={emptyState}>
        <div style={stateTitle}>{tUI.historyPanel.emptyVocabTitle}</div>
        <div style={stateText}>{tUI.historyPanel.emptyVocabText}</div>
      </div>
    );
  }

  return (
    <ul style={compactList}>
      {vocabHistory.map((item) => (
        <li
          key={item.id}
          style={compactItem}
          onMouseEnter={() => setActiveLoadKey(item.id)}
          onMouseLeave={() => setActiveLoadKey((current) => (current === item.id ? null : current))}
        >
          <div style={compactTitle}>
            {item.expression} {item.reading ? <span style={compactMuted}>({item.reading})</span> : null}
          </div>
          <div style={compactDefinition}>{item.definition}</div>
          {item.example ? (
            <div style={compactExample}>{item.example}</div>
          ) : null}
          <CompactSourceLine item={item} targetLang={targetLang} />
          <button
            className="btn-interactive"
            style={{
              ...compactLoadBtn,
              ...(activeLoadKey === item.id ? compactLoadBtnVisible : compactLoadBtnHidden),
            }}
            onClick={() => onLoad(item.result_id)}
            disabled={loadingResultId === item.result_id}
            title={tUI.historyPanel.loadArticle}
            aria-label={tUI.historyPanel.loadArticle}
            onFocus={() => setActiveLoadKey(item.id)}
            onBlur={() => setActiveLoadKey((current) => (current === item.id ? null : current))}
          >
            <span style={maskedIconStyle(loadResultIcon.src, 15)} aria-hidden="true" />
          </button>
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
  const [activeLoadKey, setActiveLoadKey] = useState<string | null>(null);

  if (grammarHistory.length === 0) {
    return (
      <div style={emptyState}>
        <div style={stateTitle}>{tUI.historyPanel.emptyGrammarTitle}</div>
        <div style={stateText}>{tUI.historyPanel.emptyGrammarText}</div>
      </div>
    );
  }

  return (
    <ul style={compactList}>
      {grammarHistory.map((item) => (
        <li
          key={item.id}
          style={compactItem}
          onMouseEnter={() => setActiveLoadKey(item.id)}
          onMouseLeave={() => setActiveLoadKey((current) => (current === item.id ? null : current))}
        >
          <div style={compactTitle}>{item.expression}</div>
          <div style={compactDefinition}>{item.definition}</div>
          {item.example ? (
            <div style={compactExample}>{item.example}</div>
          ) : null}
          <CompactSourceLine item={item} targetLang={targetLang} />
          <button
            className="btn-interactive"
            style={{
              ...compactLoadBtn,
              ...(activeLoadKey === item.id ? compactLoadBtnVisible : compactLoadBtnHidden),
            }}
            onClick={() => onLoad(item.result_id)}
            disabled={loadingResultId === item.result_id}
            title={tUI.historyPanel.loadArticle}
            aria-label={tUI.historyPanel.loadArticle}
            onFocus={() => setActiveLoadKey(item.id)}
            onBlur={() => setActiveLoadKey((current) => (current === item.id ? null : current))}
          >
            <span style={maskedIconStyle(loadResultIcon.src, 15)} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function CompactSourceLine({
  item,
  targetLang,
}: {
  item: VocabHistoryItemResponse | GrammarHistoryItemResponse;
  targetLang: TargetLang;
}) {
  const tUI = UI_STRINGS[targetLang];

  return (
    <div style={compactSource}>
      {tUI.historyPanel.sourceLabel}: {item.source_title?.trim() || item.source_text_preview} ·{" "}
      {item.source_level} · {formatShortDate(item.source_created_at)}
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

function formatShortDate(value: string): string {
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
  maxWidth: 180,
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const headerActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const headerIcon: React.CSSProperties = {
  width: 18,
  height: 18,
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
  fontSize: 18,
  lineHeight: 1.2,
};

const subtitle: React.CSSProperties = {
  opacity: 0.7,
  marginTop: 2,
  fontSize: 12,
  lineHeight: 1.25,
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

const searchRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flex: "1 1 280px",
  maxWidth: 420,
  minWidth: 240,
};

const searchInput: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: 38,
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--surface)",
  color: "var(--text)",
  padding: "0 12px",
  font: "inherit",
};

const tab: React.CSSProperties = {
  ...buttonSm,
  ...buttonSecondary,
};

const activeTab: React.CSSProperties = {
  ...buttonSm,
  ...buttonPrimary,
};

const searchBtn: React.CSSProperties = {
  ...buttonSm,
  ...buttonPrimary,
};

const clearSearchBtn: React.CSSProperties = {
  ...iconButtonSm,
  ...buttonSecondary,
  flexShrink: 0,
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

const compactList: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
  gap: 10,
};

const compactItem: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--surface)",
  borderRadius: 14,
  padding: 10,
  paddingRight: 48,
  position: "relative",
  minHeight: 112,
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const compactTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 15,
  lineHeight: 1.4,
};

const compactMuted: React.CSSProperties = { opacity: 0.8, fontSize: 13 };

const compactDefinition: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  opacity: 0.8,
};

const compactLine: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  opacity: 0.65,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const compactExample: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  opacity: 0.85,
  fontStyle: "italic",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const compactSource: React.CSSProperties = {
  ...compactLine,
  marginTop: "auto",
  paddingTop: 5,
  borderTop: "1px solid var(--border)",
};

const compactLoadBtn: React.CSSProperties = {
  ...iconButtonSm,
  ...buttonGhost,
  position: "absolute",
  top: 10,
  right: 10,
  transition: "opacity 160ms ease",
};

const compactLoadBtnHidden: React.CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
};

const compactLoadBtnVisible: React.CSSProperties = {
  opacity: 1,
  pointerEvents: "auto",
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
