"use client";

import React, { useEffect, useRef } from "react";
import styles from "./InputPanel.module.css";
import closeIcon from "@/icons/close.svg";
import aiIcon from "@/icons/ai.svg";
import {
  buttonMd,
  buttonGhost,
  buttonTinted,
  iconButtonMd,
  maskedIconStyle,
} from "@/components/buttonStyles";
import type { GenerateTextRequest, TargetLang } from "@/lib/types";
import { UI_STRINGS } from "@/lib/i18n";
import { usePresenceTransition } from "@/hooks/usePresenceTransition";

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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { shouldRender, visible } = usePresenceTransition({
    open,
    exitMs: POPOVER_TRANSITION_MS,
  });

  // Close the popover when clicking outside it or pressing Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`.${styles.generatorMenu}`)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!shouldRender) return null;

  const tUI = UI_STRINGS[targetLang];

  return (
    <div
      ref={panelRef}
      className={`${styles.generatorPopover} ${visible ? styles.generatorPopoverVisible : styles.generatorPopoverHidden}`}
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
          title={tUI.generator.cancel}
          aria-label={tUI.generator.cancel}
        >
          <span style={maskedIconStyle(closeIcon.src, 18)} aria-hidden="true" />
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
          title={generateLoading ? tUI.generator.generating : tUI.generator.generateBtn}
          aria-label={generateLoading ? tUI.generator.generating : tUI.generator.generateBtn}
        >
          <>
            <span style={maskedIconStyle(aiIcon.src, 18)} aria-hidden="true" />
            {generateLoading ? tUI.generator.generating : tUI.generator.generateBtn}
          </>
        </button>
      </div>
    </div>
  );
}

const POPOVER_TRANSITION_MS = 420;

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
  ...iconButtonMd,
  ...buttonGhost,
};

const confirmBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonTinted,
};

const errorText: React.CSSProperties = {
  color: "crimson",
  fontSize: 14,
  lineHeight: 1.4,
};
