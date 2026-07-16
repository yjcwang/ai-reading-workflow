"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import closeIcon from "@/icons/close.svg";
import loadingIcon from "@/icons/loading.svg";
import aiIcon from "@/icons/ai.svg";
import chatContextIcon from "@/icons/chat_context.svg";
import sendIcon from "@/icons/send.svg";
import styles from "./InputPanel.module.css";
import {
  buttonGhost,
  buttonPrimary,
  buttonSm,
  iconButtonMd,
  maskedIconStyle,
} from "@/components/buttonStyles";
import { UI_STRINGS } from "@/lib/i18n";
import type { AiChatMessage, AskAIContextType, TargetLang } from "@/lib/types";
import { usePresenceTransition } from "@/hooks/usePresenceTransition";

type Props = {
  open: boolean;
  messages: AiChatMessage[];
  loading: boolean;
  error: string | null;
  disabled?: boolean;
  targetLang: TargetLang;
  contextText: string;
  contextType: AskAIContextType;
  explainLoading?: boolean;
  onClose: () => void;
  onSend: (question: string) => Promise<void> | void;
  onGenerateExplainCards?: () => Promise<void> | void;
};

export function AiChatDrawer({
  open,
  messages,
  loading,
  error,
  disabled,
  targetLang,
  contextText,
  contextType,
  explainLoading,
  onClose,
  onSend,
  onGenerateExplainCards,
}: Props) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { shouldRender, visible } = usePresenceTransition({
    open,
    exitMs: PANEL_TRANSITION_MS,
  });
  const tUI = UI_STRINGS[targetLang].aiChat;
  const showGenerateCards = contextType === "selected_text" && !!onGenerateExplainCards;

  // Grow with wrapped input until the composer reaches its maximum comfortable height.
  function resizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || loading || disabled) return;

    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
      textareaRef.current.style.overflowY = "hidden";
    }
    await onSend(question);
  }

  if (!shouldRender) return null;

  return (
    <aside
      style={{
        ...panel,
        ...(visible ? panelVisible : panelHidden),
      }}
      aria-label={tUI.title}
    >
      <div style={header}>
        <div style={titleBlock}>
          <div style={titleRow}>
            <span style={maskedIconStyle(aiIcon.src, 18)} aria-hidden="true" />
            <div style={titleText}>{tUI.title}</div>
          </div>
        </div>
        <button
          className="btn-interactive"
          style={closeBtn}
          onClick={onClose}
          aria-label={tUI.close}
          title={tUI.close}
        >
          <span style={maskedIconStyle(closeIcon.src, 18)} aria-hidden="true" />
        </button>
      </div>

      <div style={messageList}>
        {messages.length === 0 ? (
          <div style={emptyState}>{tUI.emptyText}</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...messageBubble,
                ...(message.role === "user" ? userBubble : assistantBubble),
              }}
            >
              {message.role === "user" && message.contextText ? (
                <div style={messageContext} title={message.contextText}>
                  <span
                    style={maskedIconStyle(chatContextIcon.src, 15)}
                    aria-hidden="true"
                  />
                  <strong style={contextValueText}>{message.contextText}</strong>
                </div>
              ) : null}
              <div>{message.content}</div>
            </div>
          ))
        )}
        {loading ? (
          <div style={{ ...messageBubble, ...assistantBubble }}>
            <Image
              src={loadingIcon}
              alt=""
              width={16}
              height={16}
              className={styles.loadingSpin}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>

      {error ? <div style={errorBox}>{error}</div> : null}

      <form style={composer} onSubmit={handleSubmit}>
        {contextText ? (
          <div style={contextRow} title={contextText}>
            <span
              style={maskedIconStyle(chatContextIcon.src, 16)}
              aria-hidden="true"
            />
            <strong style={contextValueText}>{contextText}</strong>
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            resizeTextarea(event.currentTarget);
          }}
          placeholder={tUI.placeholder}
          disabled={loading || disabled}
          style={textarea}
          rows={1}
        />
        <div style={composerActions}>
          {showGenerateCards ? (
            <button
              className="btn-interactive"
              style={generateCardsBtn}
              disabled={disabled || explainLoading}
              type="button"
              onClick={() => onGenerateExplainCards?.()}
            >
              {explainLoading ? (
                <Image
                  src={loadingIcon}
                  alt=""
                  width={16}
                  height={16}
                  className={styles.loadingSpin}
                  aria-hidden="true"
                />
              ) : (
                tUI.generateCards
              )}
            </button>
          ) : null}
          <button
            className="btn-interactive"
            style={sendBtn}
            disabled={loading || disabled || draft.trim().length === 0}
            type="submit"
            aria-label={tUI.send}
            title={tUI.send}
          >
            <span style={maskedIconStyle(sendIcon.src, 18)} aria-hidden="true" />
          </button>
        </div>
      </form>
    </aside>
  );
}

const PANEL_TRANSITION_MS = 420;
const TEXTAREA_MIN_HEIGHT = 44;
const TEXTAREA_MAX_HEIGHT = 160;

const panel: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  right: -200,
  zIndex: 80,
  width: "min(480px, calc(100vw - 48px))",
  height: "min(720px, calc(100dvh - 130px))",
  minHeight: 420,
  display: "flex",
  flexDirection: "column",
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.18)",
  color: "var(--text)",
  overflow: "hidden",
  transition: `transform ${PANEL_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease`,
  willChange: "transform, opacity",
};

const panelVisible: React.CSSProperties = {
  opacity: 1,
  transform: "translateY(0)",
  pointerEvents: "auto",
};

const panelHidden: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(-18px)",
  pointerEvents: "none",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: 16,
  
};

const titleBlock: React.CSSProperties = {
  display: "grid",
  gap: 4,
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const titleText: React.CSSProperties = {
  fontWeight: 700,
};

const contextRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  lineHeight: 1.45,
  color: "var(--text)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const messageContext: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  minWidth: 0,
  marginBottom: 5,
  fontSize: 12,
  opacity: 0.78,
  whiteSpace: "nowrap",
  overflow: "hidden",
};

const contextValueText: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const closeBtn: React.CSSProperties = {
  ...iconButtonMd,
  ...buttonGhost,
};

const messageList: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const emptyState: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "stretch",
  maxWidth: 320,
  margin: "0 auto",
  color: "var(--text)",
  fontSize: 24,
  fontWeight: 500,
  lineHeight: 1.35,
  textAlign: "center",
};

const messageBubble: React.CSSProperties = {
  maxWidth: "88%",
  borderRadius: 14,
  padding: "10px 12px",
  fontSize: 14,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
};

const userBubble: React.CSSProperties = {
  alignSelf: "flex-end",
  background: "var(--text)",
  color: "var(--text-invert)",
};

const assistantBubble: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border)",
};

const errorBox: React.CSSProperties = {
  margin: "0 16px 12px",
  border: "1px solid #5a2a2a",
  background: "#1a0f12",
  color: "#ffb5b5",
  borderRadius: 12,
  padding: 10,
  fontSize: 13,
};

const composer: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 16,
  borderTop: "1px solid var(--border)",
};

const textarea: React.CSSProperties = {
  width: "100%",
  height: TEXTAREA_MIN_HEIGHT,
  minHeight: TEXTAREA_MIN_HEIGHT,
  maxHeight: TEXTAREA_MAX_HEIGHT,
  resize: "none",
  overflowY: "hidden",
  borderRadius: 12,
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
  outline: "none",
  padding: 10,
  font: "inherit",
  lineHeight: 1.5,
};

const composerActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
};

const generateCardsBtn: React.CSSProperties = {
  ...buttonSm,
  ...buttonPrimary,
};

const sendBtn: React.CSSProperties = {
  ...iconButtonMd,
  ...buttonPrimary,
};
