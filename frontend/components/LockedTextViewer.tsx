"use client";

import React, { useEffect, useRef, useState } from "react";

type ExplainRequestPayload = {
  selectedText: string;
  // 先最省事：把整段 lockedText 当 context
  // 以后你要升级成“选中附近一句”，也只改这里或上层
  context: string;
};

type Props = {
  text: string;
  style?: React.CSSProperties;

  // 点击 Explain 时，把 selectedText/context 抛给上层
  onExplainRequest: (payload: ExplainRequestPayload) => void;

  // 上层 loading 时可以禁用
  disabled?: boolean;
};

export function LockedTextViewer({ text, style, onExplainRequest, disabled }: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [selectedText, setSelectedText] = useState<string>("");
  const [btnPos, setBtnPos] = useState<{ top: number; left: number } | null>(null);

  // 1) 根据 selection 更新按钮位置和选中文字
  function updateSelection() {
    if (disabled) return;

    const el = boxRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) {
      setSelectedText("");
      setBtnPos(null);
      return;
    }

    const raw = sel.toString();
    const t = raw.trim();

    // 没有有效选中：隐藏按钮
    if (!t || t.length < 2) {
      setSelectedText("");
      setBtnPos(null);
      return;
    }

    // 确保选中发生在 lockedText 容器内部
    const anchorNode = sel.anchorNode;
    if (!anchorNode || !el.contains(anchorNode)) {
      setSelectedText("");
      setBtnPos(null);
      return;
    }

    // 滚动边界检测 
    
    // 1. 获取容器（lockedBox）相对于视口的矩形
    const containerRect = el.getBoundingClientRect();
    // 2. 获取选区相对于视口的矩形
    const selRect = sel.getRangeAt(0).getBoundingClientRect();

    const isVisible = 
      selRect.bottom > containerRect.top && 
      selRect.top < containerRect.bottom;

    if (!isVisible) { // 如果文字不可见，直接隐藏按钮和文字高亮
      setBtnPos(null); 
      setSelectedText("");
      window.getSelection()?.removeAllRanges();
      return;
    }

    // 计算按钮位置：在选区右下角稍微偏移一点
    const margin = 8;
    let top = selRect.bottom + margin;
    let left = selRect.right + margin;

    // 防止按钮跑出屏幕右侧
    const BTN_W = 90;
    left = Math.min(left, window.innerWidth - BTN_W - 8);

    // 防止按钮跑出屏幕底部（简单处理：如果太靠下，就放到上面）
    const BTN_H = 32;
    if (top > window.innerHeight - BTN_H - 8) {
      top = selRect.top - BTN_H - margin;
    }

    setSelectedText(t);
    setBtnPos({ top, left });
  }

  // 监听 mouseup / keyup（最小实现）
  useEffect(() => {
    function onMouseUp() {
      updateSelection();
    }
    function onKeyUp() {
      updateSelection();
    }
    function onScroll() {
      // 滚动时 selection 的 rect 会变化，重新算一次
      if (btnPos) updateSelection();
    }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, btnPos]);

  // 点击 Explain：把 payload 抛给 page.tsx
  function handleExplainClick() {
    if (disabled) return;
    if (!selectedText) return;

    onExplainRequest({
      selectedText,
      context: text, // MVP：先整段上下文
    });

    // 点击后可以隐藏按钮（避免重复触发）
    setBtnPos(null);
  }

  return (
    <>
      {/* lockedText 展示区 */}
      <div ref={boxRef} style={style}>
        {text}
      </div>

      {/* 浮动 Explain 按钮 */}
      {btnPos && (
        <button
          onClick={handleExplainClick}
          disabled={disabled}
          className="btn-interactive"
          style={{
            position: "fixed",
            top: btnPos.top,
            left: btnPos.left,
            zIndex: 9999,
            fontWeight: 600,

            padding: "6px 10px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "rgba(var(--accent-rgb), 0.1)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",

            color: "var(--text)",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          Explain
        </button>
      )}
    </>
  );
}
