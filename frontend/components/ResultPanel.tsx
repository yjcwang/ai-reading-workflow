"use client";

import React, { useState } from "react";
import Image from "next/image";
import loadingIcon from "@/icons/loading.svg";
import deleteIcon from "@/icons/delete.svg";
import downloadIcon from "@/icons/download.svg";
import saveResultIcon from "@/icons/save_result.svg";
import styles from "./InputPanel.module.css";
import {
  buttonSm,
  buttonMd,
  buttonPrimary,
  buttonTinted,
  iconButtonSm,
  iconButtonMd,
  buttonGhost,
  maskedIconStyle,
} from "@/components/buttonStyles";
import type { AnalyzeResponse, TargetLang } from "@/lib/types";
import { UI_STRINGS } from "@/lib/i18n";

type Props = {
  data: AnalyzeResponse;
  error: string | null;
  analyzeLoading: boolean;
  onDeleteVocab: (expression: string) => void;
  onDeleteGrammar: (expression: string) => void;
  onSaveResult: () => void;
  onExportPdf: () => void;
  saving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  saveSuccessLeaving: boolean;
  exporting: boolean;
  exportError: string | null;
  targetLang: TargetLang;
};

export function ResultPanel({
  data,
  error,
  analyzeLoading: loading,
  onDeleteVocab,
  onDeleteGrammar,
  onSaveResult,
  onExportPdf,
  saving,
  saveError,
  saveSuccess,
  saveSuccessLeaving,
  exporting,
  exportError,
  targetLang,
}: Props) {
  const tUI = UI_STRINGS[targetLang];
  const hasResult = data.vocab.length > 0 || data.grammar.length > 0;
  const [activeDeleteKey, setActiveDeleteKey] = useState<string | null>(null);

  return (
    <div style={card}>
      <div style={rowBetween}>
        <div style={{ fontWeight: 700 }}>{tUI.resultPanel.resultTitle}</div>
        <div style={{ opacity: 0.7, fontSize: 13 }}>
          {data.vocab.length} {tUI.common.word} · {data.grammar.length} {tUI.common.grammar}
        </div>
        <div style={headerActions}>
          <button
            className="btn-interactive"
            style={saveBtn}
            onClick={onSaveResult}
            disabled={loading || saving || !hasResult}
            title={tUI.resultPanel.saveResult}
          >
            {saving ? (
              <Image
                src={loadingIcon}
                alt=""
                width={16}
                height={16}
                className={styles.loadingSpin}
                aria-hidden="true"
              />
            ) : (
              <>
                <span style={maskedIconStyle(saveResultIcon.src, 18)} aria-hidden="true" />
                {tUI.resultPanel.saveResult}
              </>
            )}
          </button>
          <button
            className="btn-interactive"
            style={exportBtn}
            onClick={onExportPdf}
            disabled={loading || exporting || !hasResult}
            title="PDF"
          >
            {exporting ? (
              <Image
                src={loadingIcon}
                alt=""
                width={16}
                height={16}
                className={styles.loadingSpin}
                aria-hidden="true"
              />
            ) : (
              <>
                <span style={maskedIconStyle(downloadIcon.src, 18)} aria-hidden="true" />
                PDF
              </>
            )}
          </button>
        </div>
      </div>

      {error ? <div style={errorBox}>{tUI.common.error}: {error}</div> : null}
      {saveError ? <div style={errorBox}>{tUI.resultPanel.saveError}: {saveError}</div> : null}
      {saveSuccess ? <div style={{ ...successBox, ...(saveSuccessLeaving ? successBoxLeaving : null) }}>{saveSuccess}</div> : null}
      {exportError ? <div style={errorBox}>{tUI.resultPanel.exportPdf}{tUI.common.error}: {exportError}</div> : null}

      <div style={twoCols}>
        <div>
          <div style={sectionTitle}>{tUI.resultPanel.vocabTitle}</div>
          <ul style={list}>
            {loading ? (
              <li style={empty}>{tUI.common.loading}</li>
            ) : data.vocab.length === 0 ? (
              <li style={empty}>{tUI.resultPanel.noData}</li>
            ) : (
              data.vocab.map((v) => (
                <li
                  key={v.expression}
                  style={item}
                  onMouseEnter={() => setActiveDeleteKey(`vocab:${v.expression}`)}
                  onMouseLeave={() => setActiveDeleteKey((current) => (current === `vocab:${v.expression}` ? null : current))}
                >
                  <div style={itemTitle}>
                    {v.expression} {v.reading ? <span style={muted}>({v.reading})</span> : null}
                  </div>
                  <button
                    className="btn-interactive"
                    style={{
                      ...deleteItemBtn,
                      ...(activeDeleteKey === `vocab:${v.expression}` ? deleteItemBtnVisible : deleteItemBtnHidden),
                    }}
                    onClick={() => onDeleteVocab(v.expression)}
                    title={tUI.resultPanel.deleteItem}
                    aria-label={tUI.resultPanel.deleteItem}
                    onFocus={() => setActiveDeleteKey(`vocab:${v.expression}`)}
                    onBlur={() => setActiveDeleteKey((current) => (current === `vocab:${v.expression}` ? null : current))}
                  >
                    <span style={maskedIconStyle(deleteIcon.src, 14)} aria-hidden="true" />
                  </button>
                  {v.definition ? <div style={muted}>{v.definition}</div> : null}
                  {v.example ? <div style={example}>{v.example}</div> : null}
                  {v.notes ? <div style={mutedSmall}>{v.notes}</div> : null}
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <div style={sectionTitle}>{tUI.resultPanel.grammarTitle}</div>
          <ul style={list}>
            {loading ? (
              <li style={empty}>{tUI.common.loading}</li>
            ) : data.grammar.length === 0 ? (
              <li style={empty}>{tUI.resultPanel.noData}</li>
            ) : (
              data.grammar.map((g) => (
                <li
                  key={g.expression}
                  style={item}
                  onMouseEnter={() => setActiveDeleteKey(`grammar:${g.expression}`)}
                  onMouseLeave={() => setActiveDeleteKey((current) => (current === `grammar:${g.expression}` ? null : current))}
                >
                  <div style={itemTitle}>{g.expression}</div>
                  <button
                    className="btn-interactive"
                    style={{
                      ...deleteItemBtn,
                      ...(activeDeleteKey === `grammar:${g.expression}` ? deleteItemBtnVisible : deleteItemBtnHidden),
                    }}
                    onClick={() => onDeleteGrammar(g.expression)}
                    title={tUI.resultPanel.deleteItem}
                    aria-label={tUI.resultPanel.deleteItem}
                    onFocus={() => setActiveDeleteKey(`grammar:${g.expression}`)}
                    onBlur={() => setActiveDeleteKey((current) => (current === `grammar:${g.expression}` ? null : current))}
                  >
                    <span style={maskedIconStyle(deleteIcon.src, 14)} aria-hidden="true" />
                  </button>
                  {g.definition ? <div style={muted}>{g.definition}</div> : null}
                  {g.example ? <div style={example}>{g.example}</div> : null}
                  {g.notes ? <div style={mutedSmall}>{g.notes}</div> : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  height: "100%",
  overflowY: "auto",
  minHeight: 0,
};

const rowBetween: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const headerActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const twoCols: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const sectionTitle: React.CSSProperties = { fontWeight: 500, marginBottom: 8 };

const list: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const item: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--surface)",
  borderRadius: 14,
  padding: 10,
  position: "relative",
  paddingRight: 48,
};

const itemTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 15,
  lineHeight: 1.4,
};

const saveBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonTinted,
};

const exportBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonPrimary,
  gap: 6,
};

const deleteItemBtn: React.CSSProperties = {
  ...iconButtonSm,
  ...buttonGhost,
  position: "absolute",
  top: 10,
  right: 10,
  transition: "opacity 160ms ease",
};

const deleteItemBtnHidden: React.CSSProperties = {
  opacity: 0,
  pointerEvents: "none",
};

const deleteItemBtnVisible: React.CSSProperties = {
  opacity: 1,
  pointerEvents: "auto",
};

const empty: React.CSSProperties = { opacity: 0.6, padding: 10 };
const muted: React.CSSProperties = { opacity: 0.8, marginTop: 6, fontSize: 13, lineHeight: 1.5 };
const mutedSmall: React.CSSProperties = { opacity: 0.65, marginTop: 6, fontSize: 12, lineHeight: 1.5 };
const example: React.CSSProperties = { opacity: 0.85, marginTop: 6, fontStyle: "italic", fontSize: 13, lineHeight: 1.5 };

const errorBox: React.CSSProperties = {
  border: "1px solid #5a2a2a",
  background: "#1a0f12",
  color: "#ffb5b5",
  borderRadius: 14,
  padding: 10,
  marginBottom: 10,
};

const successBox: React.CSSProperties = {
  border: "1px solid #296246",
  background: "#0f1d16",
  color: "#bff2cf",
  borderRadius: 14,
  padding: 10,
  marginBottom: 10,
  opacity: 1,
  transform: "translateY(0)",
  transition: "opacity 240ms ease, transform 240ms ease",
};

const successBoxLeaving: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(-4px)",
};
