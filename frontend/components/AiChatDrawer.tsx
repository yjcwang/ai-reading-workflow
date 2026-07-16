"use client";

import React, { useState } from "react";
import Image from "next/image";
import closeIcon from "@/icons/close.svg";
import loadingIcon from "@/icons/loading.svg";
import aiIcon from "@/icons/ai.svg";
import styles from "./InputPanel.module.css";
import {
  buttonGhost,
  buttonPrimary,
  buttonSm,
  iconButtonMd,
  maskedIconStyle,
} from "@/components/buttonStyles";
import type { AiChatMessage, TargetLang } from "@/lib/types";

type Props = {
  open: boolean;
  messages: AiChatMessage[];
  loading: boolean;
  error: string | null;
  disabled?: boolean;
  targetLang: TargetLang;
  onClose: () => void;
  onSend: (question: string) => Promise<void> | void;
};

export function AiChatDrawer({
  open,
  messages,
  loading,
  error,
  disabled,
  targetLang,
  onClose,
  onSend,
}: Props) {
  const [draft, setDraft] = useState("");
  const title = targetLang === "zh" ? "Ask AI" : "Ask AI";
  const contextLabel = targetLang === "zh" ? "Current article" : "Current article";
  const placeholder = targetLang === "zh" ? "Ask about this reading..." : "Ask about this reading...";
  const emptyText = targetLang === "zh" ? "Ask a short question about the current article." : "Ask a short question about the current article.";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || loading || disabled) return;

    setDraft("");
    await onSend(question);
  }

  if (!open) return null;

  return (
    <aside style={drawer} aria-label={title}>
      <div style={header}>
        <div style={titleBlock}>
          <div style={titleRow}>
            <span style={maskedIconStyle(aiIcon.src, 18)} aria-hidden="true" />
            <div style={titleText}>{title}</div>
          </div>
          <div style={contextText}>{contextLabel}</div>
        </div>
        <button
          className="btn-interactive"
          style={closeBtn}
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <span style={maskedIconStyle(closeIcon.src, 18)} aria-hidden="true" />
        </button>
      </div>

      <div style={messageList}>
        {messages.length === 0 ? (
          <div style={emptyState}>{emptyText}</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...messageBubble,
                ...(message.role === "user" ? userBubble : assistantBubble),
              }}
            >
              {message.content}
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
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          disabled={loading || disabled}
          style={textarea}
          rows={3}
        />
        <button
          className="btn-interactive"
          style={sendBtn}
          disabled={loading || disabled || draft.trim().length === 0}
          type="submit"
        >
          Send
        </button>
      </form>
    </aside>
  );
}

const drawer: React.CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  zIndex: 80,
  width: "min(420px, 100vw)",
  height: "100dvh",
  display: "flex",
  flexDirection: "column",
  background: "var(--panel)",
  borderLeft: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
  color: "var(--text)",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  padding: 16,
  borderBottom: "1px solid var(--border)",
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

const contextText: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.7,
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
  opacity: 0.65,
  fontSize: 14,
  lineHeight: 1.5,
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
  resize: "vertical",
  minHeight: 76,
  maxHeight: 160,
  borderRadius: 12,
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
  padding: 10,
  font: "inherit",
  lineHeight: 1.5,
};

const sendBtn: React.CSSProperties = {
  ...buttonSm,
  ...buttonPrimary,
  justifySelf: "end",
};
