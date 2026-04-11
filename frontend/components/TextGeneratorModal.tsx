"use client";

import React from "react";
import styles from "./InputPanel.module.css";
import type { GenerateTextRequest, TargetLang } from "@/lib/types";
import { UI_STRINGS } from "@/lib/i18n";

type Props = {
  open: boolean;
  targetLang: TargetLang;
  generateRequest: GenerateTextRequest;
  analyzeLoading?: boolean;
  generateLoading?: boolean;
  generateError?: string | null;
  onClose: () => void;
  onGenerateRequestChange: (patch: Partial<GenerateTextRequest>) => void;
  onGenerate: () => Promise<void> | void;
};

export function TextGeneratorModal({
  open,
  targetLang,
  generateRequest,
  analyzeLoading,
  generateLoading,
  generateError,
  onClose,
  onGenerateRequestChange,
  onGenerate,
}: Props) {
  if (!open) return null;

  const tUI = UI_STRINGS[targetLang];

  return (
    <div style={modalOverlay} onMouseDown={onClose}>
      <div
        style={modalContainer}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={modalTitle}>{tUI.generator.title}</div>

        <div className={styles.generateForm}>
          <label className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>{tUI.generator.topic}</span>
            <input
              value={generateRequest.topic}
              onChange={(e) =>
                onGenerateRequestChange({ topic: e.target.value })
              }
              placeholder={tUI.generator.topicPlaceholder}
              className={styles.input}
            />
          </label>

          <label className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>{tUI.generator.length}</span>
            <select
              value={generateRequest.length}
              onChange={(e) =>
                onGenerateRequestChange({
                  length: e.target.value as GenerateTextRequest["length"],
                })
              }
              className={`${styles.select} btn-interactive`}
            >
              <option value="short">{tUI.generator.lengthShort}</option>
              <option value="medium">{tUI.generator.lengthMedium}</option>
              <option value="long">{tUI.generator.lengthLong}</option>
            </select>
          </label>

          <label className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>{tUI.generator.style}</span>
            <select
              value={generateRequest.style}
              onChange={(e) =>
                onGenerateRequestChange({
                  style: e.target.value as GenerateTextRequest["style"],
                })
              }
              className={`${styles.select} btn-interactive`}
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
            onClick={onClose}
            disabled={generateLoading}
          >
            {tUI.generator.cancel}
          </button>
          {generateError && (
            <div style={errorText}>
              {generateError}
            </div>
          )}
          <button
            style={confirmBtn}
            className="btn-interactive"
            onClick={onGenerate}
            disabled={!generateRequest.topic.trim() || analyzeLoading || generateLoading}
          >
            {generateLoading ? tUI.generator.generating : tUI.generator.generateBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999, 
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(0, 0, 0, 0.15)", 
};

const modalContainer: React.CSSProperties = {
  width: "min(400px, 100%)", 
  borderRadius: 16,
  background: "var(--panel)",
  border: "1px solid var(--border)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
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

const errorText: React.CSSProperties = {
  color: "crimson",
  fontSize: 14,
  lineHeight: 1.4,
};
