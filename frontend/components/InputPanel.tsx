"use client";

import React , { useState } from "react";
import type {
  Level,
  GenerateTextRequest,
  TargetLang,
} from "@/lib/types";
import { LockedTextViewer } from "@/components/LockedTextViewer";
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

  onExplainRequest?: (payload: { selectedText: string; context: string }) => void;

  theme: "light" | "dark";
  onToggleTheme: () => void;
  getMode?: (selectedText: string) => "word" | "sentence";

  targetLang: TargetLang;
  onLanguageChange: (lang: TargetLang) => void;
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
  theme,
  onToggleTheme,
  getMode,
  targetLang, 
  onLanguageChange,
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

  // select language will open a confirmation window
  const handleLanguageChange = (newLang: TargetLang) => {
    if (newLang === targetLang) return;

    // 架构逻辑：如果没有锁定文本，说明没结果，直接切；如果有，则弹窗确认
    if (!lockedText) {
      onLanguageChange(newLang);
    } else {
      setPendingLang(newLang);
    }
  };

  // 弹窗确认按钮
  const confirmLangChange = () => {
    if (pendingLang) {
      onLanguageChange(pendingLang);
      setPendingLang(null);
    }
  };


  return (
    <div style={card}>
      <div style={rowBetween}>
        <div style={leftTools}>
          <div style={{ fontWeight: 700 }}>{tUI.inputPanel.inputTitle}</div>
          {!lockedText && (
            <button
              style={ghostBtnSmall}
              onClick={() => setGenerateModalOpen(true)}
              disabled={analyzeLoading}
              className="btn-interactive"
            >
              {tUI.generator.title}
            </button>
          )}
        </div>
        <div style={rightTools}>
          {/* Toggle Theme Light/Dark*/}
          <button
            style={ghostBtnSmall}
            onClick={onToggleTheme}
            disabled={analyzeLoading}
            className="btn-interactive"
          >
            {theme === "light" ? tUI.inputPanel.lightMode : tUI.inputPanel.darkMode}
          </button>
          {/* Language Switch EN/ZH */}
          <select
            value={targetLang}
            onChange={(e) => handleLanguageChange(e.target.value as TargetLang)}
            disabled={analyzeLoading}
            style={select} 
            className="btn-interactive"
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
            style={select}
            className="btn-interactive"
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          {/* confirm modal for language switch */}
          {pendingLang && (
            <div style={modalOverlay} onMouseDown={() => setPendingLang(null)}>
              <div 
                style={modalContainer} 
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div style={modalTitle}>
                  {tUI.inputPanel.langConfirmTitle}
                </div>

                {/* Body */}
                <div style={modalMessage}>
                  {tUI.inputPanel.langConfirmMessage}
                </div>

                {/* Footer and Button */}
                <div style={modalFooter}>
                  <button 
                    style={closeBtn} 
                    className="btn-interactive"
                    onClick={() => setPendingLang(null)}
                  >
                    {tUI.inputPanel.cancel}
                  </button>
                  <button 
                    style={confirmBtn} 
                    className="btn-interactive"
                    onClick={confirmLangChange}
                  >
                    {tUI.inputPanel.confirm}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Text generator modal TODO: this is too big here in this file? */}
          {generateModalOpen && (
            <div style={modalOverlay} onMouseDown={() => setGenerateModalOpen(false)}>
              <div
                style={modalContainer}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div style={modalTitle}>{tUI.generator.title}</div>

                <div style={generateForm}>
                
                  <label style={fieldBlock}>
                    <span style={fieldLabel}>{tUI.generator.topic}</span>
                    <input
                      value={generateRequest.topic}
                      onChange={(e) =>
                        onGenerateRequestChange({ topic: e.target.value })
                      }
                      placeholder={tUI.generator.topicPlaceholder}
                      style={input}
                    />
                  </label>

                  <label style={fieldBlock}>
                    <span style={fieldLabel}>{tUI.generator.length}</span>
                    <select
                      value={generateRequest.length}
                      onChange={(e) =>
                        onGenerateRequestChange({
                          length: e.target.value as GenerateTextRequest["length"],
                        })
                      }
                      style={select}
                      className="btn-interactive"
                    >
                      <option value="short">{tUI.generator.lengthShort}</option>
                      <option value="medium">{tUI.generator.lengthMedium}</option>
                      <option value="long">{tUI.generator.lengthLong}</option>
                    </select>
                  </label>

                  <label style={fieldBlock}>
                    <span style={fieldLabel}>{tUI.generator.style}</span>
                    <select
                      value={generateRequest.style}
                      onChange={(e) =>
                        onGenerateRequestChange({
                          style: e.target.value as GenerateTextRequest["style"],
                        })
                      }
                      style={select}
                      className="btn-interactive"
                    >
                      <option value="daily">{tUI.generator.styleDaily}</option>
                      <option value="news">{tUI.generator.styleNews}</option>
                      <option value="blog">{tUI.generator.styleBlog}</option>
                      <option value="conversation">{tUI.generator.styleConversation}</option>
                      <option value="science">{tUI.generator.styleScience}</option>
                    </select>
                  </label>
                </div>

                <div style={modalFooter}>
                  <button
                    style={closeBtn}
                    className="btn-interactive"
                    onClick={() => setGenerateModalOpen(false)}
                  >
                    Cancel
                  </button>
                  {generateError && (
                    <div style={errorText}>
                      {generateError}
                    </div>
                  )}
                  <button
                    style={confirmBtn}
                    className="btn-interactive"
                    onClick={async () => {
                      const success = await onGenerateRequest();
                      if (success) {
                        setGenerateModalOpen(false);
                      }
                    }}
                    disabled={!generateRequest.topic.trim() || analyzeLoading || generateLoading}
                  >
                    {generateLoading ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {!lockedText ? ( 
        <>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder={tUI.inputPanel.placeholder}
            style={textarea}
            disabled={analyzeLoading}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button style={primaryBtn} onClick={onConfirm} disabled={!canConfirm} className="btn-interactive">
              {tUI.inputPanel.analyzeBtn}
            </button>
            <button style={ghostBtn} onClick={onClear} disabled={analyzeLoading && draftText.length === 0} className="btn-interactive">
              {tUI.common.clear}
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
            getMode={getMode}
            targetLang={targetLang}
          />

          <div style={{ marginTop: 10 }}>
            {analyzeLoading ? (
              <button style={ghostBtn} disabled className="btn-interactive" >
                {tUI.common.loading}
              </button>
            ) : (
              <button style={ghostBtn} onClick={onClear} className="btn-interactive">
                {tUI.common.clear}
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

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999, // 确保在所有内容之上
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(0, 0, 0, 0.15)", // 统一遮罩透明度
};

const modalContainer: React.CSSProperties = {
  width: "min(400px, 100%)", // 确认框可以比详情框稍窄
  borderRadius: 16,
  background: "rgba(var(--panel-rgb), 0.5)", // 统一玻璃拟态背景
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
  padding: 20,
  color: "var(--text)",
  transform: "translateY(-20px)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const modalTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
};

const modalMessage: React.CSSProperties = {
  opacity: 0.8,
  fontSize: 15,
  lineHeight: 1.5,
};

const modalFooter: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 4,
};

const closeBtn: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  borderRadius: 14,
  padding: "6px 10px",
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--text)",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
};
const confirmBtn: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  borderRadius: 14,
  padding: "6px 10px",
  background: "rgba(var(--accent-rgb), 0.2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
};

// text generator 
const leftTools: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const input: React.CSSProperties = {
  width: "100%",
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "8px 10px",
  outline: "none",
};

const generateForm: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const fieldBlock: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const fieldLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
};

const errorText: React.CSSProperties = {
  color: "crimson",
  fontSize: 14,
  lineHeight: 1.4,
};

