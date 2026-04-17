"use client";

import React , { useState } from "react";
import Image from "next/image";
import styles from "./InputPanel.module.css";
import loadingIcon from "@/icons/loading.svg";
import clearIcon from "@/icons/clear.svg";
import lightIcon from "@/icons/light.svg";
import darkIcon from "@/icons/dark.svg";
import historyIcon from "@/icons/history.svg";
import aiIcon from "@/icons/ai.svg";
import {
  buttonMd,
  buttonPrimary,
  buttonSecondary,
  buttonTinted,
  buttonSm,
  iconButtonMd,
  maskedIconStyle,
} from "@/components/buttonStyles";
import type {
  Level,
  GenerateTextRequest,
  TargetLang,
} from "@/lib/types";
import { LockedTextViewer } from "@/components/LockedTextViewer";
import { LanguageConfirmModal } from "@/components/LanguageConfirmModal";
import { TextGeneratorModal } from "@/components/TextGeneratorModal";
import { UI_STRINGS } from "@/lib/i18n";

const LEVELS: Level[] = ["N5", "N4", "N3", "N2", "N1"];
const LANGUAGES = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
] as const;

type Props = {
  level: Level;
  setLevel: (lv: Level) => void;

  text: string;
  setText: (t: string) => void;

  generateRequest: GenerateTextRequest;
  onGenerateRequestChange: (patch: Partial<GenerateTextRequest>) => void;
  onGenerateRequest: () => Promise<boolean> | boolean;
  generateLoading?: boolean;
  generateError?: string | null;

  lockedText: string | null;

  analyzeLoading: boolean;
  onAnalyzeRequest: () => void;
  onClear: () => void;

  onExplainRequest?: (payload: { selectedText: string; context: string }) => Promise<void> | void;
  explainLoading?: boolean;

  theme: "light" | "dark";
  onToggleTheme: () => void;
  getMode?: (selectedText: string) => "word" | "sentence";

  targetLang: TargetLang;
  onLanguageChange: (lang: TargetLang) => void;
  onOpenHistory: () => void;
};

export function InputPanel({
  level,
  setLevel,
  text: draftText,
  setText: setDraftText,
  lockedText,
  analyzeLoading: analyzeLoading,
  onAnalyzeRequest: onConfirm,
  onClear,
  onExplainRequest,
  explainLoading,
  theme,
  onToggleTheme,
  getMode,
  targetLang, 
  onLanguageChange,
  onOpenHistory,
  generateRequest: generateRequest,
  onGenerateRequestChange: onGenerateRequestChange,
  onGenerateRequest,
  generateLoading,
  generateError
}: Props) {
  // control if can use confirm buttom
  const canConfirm = !analyzeLoading && draftText.trim().length > 0; 
  // record the language to switch, but not switched yet
  const [pendingLang, setPendingLang] = useState<TargetLang | null>(null);
  // generate text modal switch
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const tUI = UI_STRINGS[targetLang];
  const themeIcon = theme === "light" ? lightIcon : darkIcon;
  const themeLabel = theme === "light" ? tUI.inputPanel.lightMode : tUI.inputPanel.darkMode;

  // select language will open a confirmation window
  const handleLanguageChange = (newLang: TargetLang) => {
    if (newLang === targetLang) return;

    if (!lockedText) {
      onLanguageChange(newLang);
    } else {
      setPendingLang(newLang);
    }
  };

  const confirmLangChange = () => {
    if (pendingLang) {
      onLanguageChange(pendingLang);
      setPendingLang(null);
    }
  };


  return (
    <div className={styles.card}>
      <div className={styles.rowBetween}>
        <div className={styles.leftTools}>
          <div style={{ fontWeight: 700 }}>{tUI.inputPanel.inputTitle}</div>
          <button
            className="btn-interactive"
            style={historyBtn}
            onClick={onOpenHistory}
            disabled={analyzeLoading}
          >
            <span
              aria-hidden="true"
              style={maskedIconStyle(historyIcon.src, 16)}
            />
            {tUI.inputPanel.history}
          </button>
          {!lockedText && (
            <div className={styles.generatorMenu}>
              {/* AI generator popover is anchored below this trigger button. */}
              <button
                className="btn-interactive"
                style={generatorBtn}
                onClick={() => setGenerateModalOpen((prev) => !prev)}
                disabled={analyzeLoading || generateLoading}
              >
                {generateLoading ? (
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
                    <span
                      aria-hidden="true"
                      style={maskedIconStyle(aiIcon.src, 16)}
                    />
                    {tUI.generator.title}
                  </>
                )}
              </button>
              <TextGeneratorModal
                open={generateModalOpen}
                targetLang={targetLang}
                generateRequest={generateRequest}
                analyzeLoading={analyzeLoading}
                generateLoading={generateLoading}
                generateError={generateError}
                onClose={() => setGenerateModalOpen(false)}
                onGenerateRequestChange={onGenerateRequestChange}
                onGenerate={async () => {
                  setGenerateModalOpen(false);
                  await onGenerateRequest();
                }}
              />
            </div>
          )}
        </div>
        <div className={styles.rightTools}>
          {/* Toggle Theme Light/Dark*/}
          <button
            className="btn-interactive"
            style={themeBtn}
            onClick={onToggleTheme}
            disabled={analyzeLoading}
            aria-label={themeLabel}
            title={themeLabel}
          >
            <span
              aria-hidden="true"
              style={maskedIconStyle(themeIcon.src, 18)}
            />
          </button>
          {/* Language Switch EN/ZH */}
          <select
            value={targetLang}
            onChange={(e) => handleLanguageChange(e.target.value as TargetLang)}
            disabled={analyzeLoading}
            className={`${styles.select} btn-interactive`}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>  
          {/* Level Selection N1-N5*/}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            disabled={analyzeLoading}
            className={`${styles.select} btn-interactive`}
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          {/* confirm modal for language switch */}
          <LanguageConfirmModal
            open={!!pendingLang}
            targetLang={targetLang}
            onClose={() => setPendingLang(null)}
            onConfirm={confirmLangChange}
          />
        </div>
      </div>

      {!lockedText ? ( 
        <>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder={tUI.inputPanel.placeholder}
            className={styles.textarea}
            disabled={analyzeLoading}
          />
          <div className={styles.actionRow}>
            <button className="btn-interactive" style={analyzeBtn} onClick={onConfirm} disabled={!canConfirm}>
              {analyzeLoading ? (
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
                  <span
                    aria-hidden="true"
                    style={maskedIconStyle(aiIcon.src, 18)}
                  />
                  {tUI.inputPanel.analyzeBtn}
                </>
              )}
            </button>
            <button
              className="btn-interactive"
              style={clearBtn}
              onClick={onClear}
              disabled={analyzeLoading && draftText.length === 0}
              aria-label={tUI.common.clear}
              title={tUI.common.clear}
            >
              <span
                aria-hidden="true"
                style={maskedIconStyle(clearIcon.src, 18)}
              />
            </button>
          </div>
        </>
      ) : (
        <>
          <LockedTextViewer  // if text locked, then throw it to LockedTextViewer 
            text={lockedText}
            style={lockedBox}
            disabled={analyzeLoading}
            onExplainRequest={(payload) => onExplainRequest?.(payload)}
            explainLoading={explainLoading}
            getMode={getMode}
            targetLang={targetLang}
          />

          <div className={styles.lockedActions}>
            {analyzeLoading ? (
              <button className="btn-interactive" style={loadingBtn} disabled >
                <Image
                  src={loadingIcon}
                  alt=""
                  width={16}
                  height={16}
                  className={styles.loadingSpin}
                  aria-hidden="true"
                />
              </button>
            ) : (
              <button
                className="btn-interactive"
                style={clearBtn}
                onClick={onClear}
                aria-label={tUI.common.clear}
                title={tUI.common.clear}
              >
                <span
                  aria-hidden="true"
                  style={maskedIconStyle(clearIcon.src, 18)}
                />
              </button>
            )}
            <span className={styles.lockedHint}>
              {tUI.inputPanel.lockedTextHint}
            </span>
          </div>
        </>
      )}
    </div>
  );
}


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


const historyBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonSecondary,
};

const generatorBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonTinted,
};

const themeBtn: React.CSSProperties = {
  ...iconButtonMd,
  ...buttonSecondary,
};

const clearBtn: React.CSSProperties = {
  ...iconButtonMd,
  ...buttonSecondary,
};

const analyzeBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonPrimary,
};

const loadingBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonSecondary,
};
