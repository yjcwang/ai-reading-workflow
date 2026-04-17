"use client";

import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import loadingIcon from "@/icons/loading.svg";
import aiIcon from "@/icons/ai.svg";
import styles from "./InputPanel.module.css";
import { buttonSm, buttonMd, maskedIconStyle} from "@/components/buttonStyles";
import { UI_STRINGS } from "@/lib/i18n";
import { TargetLang } from "@/lib/types";

type ExplainRequestPayload = {
  selectedText: string;
  context: string;
};

type Props = {
  text: string;
  style?: React.CSSProperties;
  onExplainRequest: (payload: ExplainRequestPayload) => Promise<void> | void;
  disabled?: boolean;
  explainLoading?: boolean;
  getMode?: (selectedText: string) => "word" | "sentence";
  targetLang: TargetLang;
};

export function LockedTextViewer({
  text,
  style,
  onExplainRequest,
  disabled,
  explainLoading,
  getMode,
  targetLang,
}: Props) {
  const tUI = UI_STRINGS[targetLang];
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [selectedText, setSelectedText] = useState("");
  const [btnPos, setBtnPos] = useState<{ top: number; left: number } | null>(null);
  const [explainSubmitting, setExplainSubmitting] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const busyAnchorRef = useRef<{
    top: number;
    left: number;
    scrollTop: number;
    scrollLeft: number;
  } | null>(null);
  const btnPosRef = useRef<{ top: number; left: number } | null>(null);
  const explainBusyRef = useRef(false);

  const explainBusy = !!disabled || !!explainLoading || explainSubmitting;
  const mode = getMode ? getMode(selectedText) : "word";
  const explainBtnLabel =
    mode === "sentence"
      ? tUI.lockedTextViewer.explainBtnScentence
      : tUI.lockedTextViewer.explainBtnWord;

  explainBusyRef.current = explainBusy;
  btnPosRef.current = btnPos;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(pointer: coarse)");
    const updatePointerMode = () => setIsCoarsePointer(media.matches);

    updatePointerMode();
    media.addEventListener("change", updatePointerMode);

    return () => {
      media.removeEventListener("change", updatePointerMode);
    };
  }, []);

  const updateSelection = useEffectEvent(() => {
    if (explainBusy) return;

    const el = boxRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) {
      setSelectedText("");
      setBtnPos(null);
      return;
    }

    const t = sel.toString().trim();
    if (!t || t.length < 2) {
      setSelectedText("");
      setBtnPos(null);
      return;
    }

    const anchorNode = sel.anchorNode;
    if (!anchorNode || !el.contains(anchorNode)) {
      setSelectedText("");
      setBtnPos(null);
      return;
    }

    const containerRect = el.getBoundingClientRect();
    const selRect = sel.getRangeAt(0).getBoundingClientRect();
    const isVisible =
      selRect.bottom > containerRect.top && selRect.top < containerRect.bottom;

    if (!isVisible) {
      setBtnPos(null);
      setSelectedText("");
      window.getSelection()?.removeAllRanges();
      return;
    }

    if (isCoarsePointer) {
      setSelectedText(t);
      setBtnPos({ top: 0, left: 0 });
      return;
    }

    const margin = 8;
    let top = selRect.bottom + margin;
    let left = selRect.right + margin;

    const BTN_W = 90;
    left = Math.min(left, window.innerWidth - BTN_W - 8);

    const BTN_H = 32;
    if (top > window.innerHeight - BTN_H - 8) {
      top = selRect.top - BTN_H - margin;
    }

    setSelectedText(t);
    setBtnPos({ top, left });
  });

  useEffect(() => {
    function onMouseUp() {
      updateSelection();
    }

    function onTouchEnd() {
      // Let the browser finish updating native text selection handles first.
      window.setTimeout(() => updateSelection(), 0);
    }

    function onSelectionChange() {
      updateSelection();
    }

    function onKeyUp() {
      updateSelection();
    }

    function onScroll() {
      const el = boxRef.current;
      const currentBtnPos = btnPosRef.current;
      if (!currentBtnPos) return;

      if (explainBusyRef.current && el && busyAnchorRef.current) {
        const { top, left, scrollTop, scrollLeft } = busyAnchorRef.current;
        const nextTop = top - (el.scrollTop - scrollTop);
        const nextLeft = left - (el.scrollLeft - scrollLeft);
        setBtnPos({ top: nextTop, left: nextLeft });
        return;
      }

      updateSelection();
    }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [isCoarsePointer]);

  useEffect(() => {
    if (explainLoading) return;
    setExplainSubmitting(false);
  }, [explainLoading]);

  async function handleExplainClick() {
    if (explainBusy || !selectedText) return;

    const el = boxRef.current;
    if (btnPos && el) {
      busyAnchorRef.current = {
        top: btnPos.top,
        left: btnPos.left,
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft,
      };
    }

    setExplainSubmitting(true);
    window.getSelection()?.removeAllRanges();

    try {
      await onExplainRequest({
        selectedText,
        context: text,
      });
    } finally {
      busyAnchorRef.current = null;
      setBtnPos(null);
      setSelectedText("");
      setExplainSubmitting(false);
    }
  }

  return (
    <>
      <div
        ref={boxRef}
        style={{
          ...style,
          userSelect: explainBusy ? "none" : style?.userSelect,
        }}
      >
        {text}
      </div>

      {btnPos && (
        <button
          onClick={handleExplainClick}
          disabled={explainBusy}
          className="btn-interactive"
          style={{
            ...(isCoarsePointer ? mobileExplainBtn : explainBtn),
            ...(!isCoarsePointer ? { top: btnPos.top, left: btnPos.left } : null),
            ...(explainBusy ? explainBtnBusy : null),
          }}
        >
          {explainBusy ? (
            <Image
              src={loadingIcon}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
              className={styles.loadingSpin}
              style={explainLoadingIcon}
            />
          ) : (
            <>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  ...maskedIconStyle(aiIcon.src, 16),
                }}
              />
              {explainBtnLabel}
            </>
          )}
        </button>
      )}
    </>
  );
}

const explainBtn: React.CSSProperties = {
  ...buttonSm,
  position: "fixed",
  zIndex: 9999,
  fontWeight: 600,
  background: "var(--accent-soft)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  opacity: 1,
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
};

const mobileExplainBtn: React.CSSProperties = {
  ...buttonMd,
  position: "fixed",
  left: "50%",
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 30px)",
  transform: "translateX(-50%)",
  zIndex: 9999,
  minWidth: 168,
  fontWeight: 600,
  background: "var(--accent-soft)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
};

const explainBtnBusy: React.CSSProperties = {
  minWidth: 44,
  minHeight: 36,
  padding: "8px 12px",
  background: "var(--accent-soft)",
  border: "1px solid var(--border)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  opacity: 1,
  cursor: "default",
};

const explainLoadingIcon: React.CSSProperties = {
  filter: "brightness(0) saturate(100%)",
};
