"use client";

import React from "react";
import type { TargetLang } from "@/lib/types";
import { UI_STRINGS } from "@/lib/i18n";

type Props = {
  open: boolean;
  targetLang: TargetLang;
  onClose: () => void;
  onConfirm: () => void;
};

export function LanguageConfirmModal({
  open,
  targetLang,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  const tUI = UI_STRINGS[targetLang];

  return (
    <div style={modalOverlay} onMouseDown={onClose}>
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
            onClick={onClose}
          >
            {tUI.inputPanel.cancel}
          </button>
          <button
            style={confirmBtn}
            className="btn-interactive"
            onClick={onConfirm}
          >
            {tUI.inputPanel.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999, // 纭繚鍦ㄦ墍鏈夊唴瀹逛箣涓?
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(0, 0, 0, 0.15)", // 缁熶竴閬僵閫忔槑搴?
};

const modalContainer: React.CSSProperties = {
  width: "min(400px, 100%)", // 纭妗嗗彲浠ユ瘮璇︽儏妗嗙◢绐?
  borderRadius: 16,
  background: "rgba(var(--panel-rgb), 0.5)", // 缁熶竴鐜荤拑鎷熸€佽儗鏅?
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
