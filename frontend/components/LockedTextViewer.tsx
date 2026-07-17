"use client";

import React, { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import loadingIcon from "@/icons/loading.svg";
import aiIcon from "@/icons/ai.svg";
import styles from "./InputPanel.module.css";
import { buttonAi, buttonSm, buttonMd, maskedIconStyle} from "@/components/buttonStyles";
import { findHighlightQuery as findTextHighlightQuery } from "@/lib/text-highlight-helpers";
import { UI_STRINGS } from "@/lib/i18n";
import { TargetLang, TextHighlight } from "@/lib/types";

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
  activeHighlight?: TextHighlight | null;
};

export function LockedTextViewer({
  text,
  style,
  onExplainRequest,
  disabled,
  explainLoading,
  targetLang,
  activeHighlight,
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
  const explainBtnLabel = tUI.aiChat.askAi;

  explainBusyRef.current = explainBusy;
  btnPosRef.current = btnPos;

  const highlightQuery = useMemo(
    () => findTextHighlightQuery(text, activeHighlight),
    [text, activeHighlight],
  );
  const hasActiveHighlight = highlightQuery || activeHighlight?.type === "translation";

  useEffect(() => {
    if (!hasActiveHighlight) return;

    const highlighted = boxRef.current?.querySelector<HTMLElement>(
      "[data-active-text-highlight='true']",
    );
    highlighted?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [hasActiveHighlight, activeHighlight]);

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
        {renderHighlightedText(text, highlightQuery, activeHighlight)}
      </div>

      {btnPos && (
        <button
          onClick={handleExplainClick}
          disabled={explainBusy}
          className="btn-interactive ai-button"
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

function renderHighlightedText(
  text: string,
  query: string,
  highlight?: TextHighlight | null,
): React.ReactNode {
  if (highlight?.type === "translation") {
    const start = Math.max(0, Math.min(highlight.start, text.length));
    const end = Math.max(start, Math.min(highlight.end, text.length));
    if (start === end) return text;

    return (
      <>
        {text.slice(0, start)}
        <mark data-active-text-highlight="true" style={highlightMark}>
          {text.slice(start, end)}
        </mark>
        {text.slice(end)}
      </>
    );
  }

  if (!query) return text;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let matchIndex = text.indexOf(query);
  let key = 0;

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      nodes.push(text.slice(cursor, matchIndex));
    }

    nodes.push(
      <mark
        key={`highlight-${key}`}
        data-active-text-highlight={key === 0 ? "true" : undefined}
        style={highlightMark}
      >
        {text.slice(matchIndex, matchIndex + query.length)}
      </mark>,
    );

    cursor = matchIndex + query.length;
    matchIndex = text.indexOf(query, cursor);
    key += 1;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

const floatingAiGlass: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(var(--accent-rgb), 0.3), rgba(var(--accent-rgb), 0.16)), rgba(var(--panel-rgb), 0.72)",
  WebkitBackdropFilter: "blur(14px) saturate(140%)",
  backdropFilter: "blur(14px) saturate(140%)",
  border: "1px solid rgba(var(--accent-rgb), 0.35)",
  boxShadow: "0 8px 28px rgba(20, 35, 70, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
};

const explainBtn: React.CSSProperties = {
  ...buttonSm,
  ...buttonAi,
  ...floatingAiGlass,
  position: "fixed",
  zIndex: 9999,
  fontWeight: 600,
  opacity: 1,
};

const mobileExplainBtn: React.CSSProperties = {
  ...buttonMd,
  ...buttonAi,
  ...floatingAiGlass,
  position: "fixed",
  left: "50%",
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 30px)",
  transform: "translateX(-50%)",
  zIndex: 9999,
  minWidth: 168,
  fontWeight: 600,
};

const explainBtnBusy: React.CSSProperties = {
  minWidth: 44,
  minHeight: 36,
  padding: "8px 12px",
  opacity: 1,
  cursor: "default",
};

const explainLoadingIcon: React.CSSProperties = {
  filter: "brightness(0) saturate(100%)",
};

const highlightMark: React.CSSProperties = {
  background: "rgba(var(--accent-rgb), 0.53)",
  borderRadius: 4,
  boxShadow: "0 0 0 1px rgba(var(--accent-rgb), 0.4) inset",
  color: "inherit",
};
