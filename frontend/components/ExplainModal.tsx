"use client";

import React, { useEffect } from "react";
import type { ExplainResponse } from "@/lib/types";

type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: ExplainResponse | null;
  onClose: () => void;
};

export function ExplainModal({ open, loading, error, data, onClose }: Props) {
  // ESC 关闭
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div onMouseDown={onClose} style={overlay}>
      <div onMouseDown={(e) => e.stopPropagation()} style={modalCard}>
        <div style={headerRow}>
          <div style={title}>Explain</div>
          <button onClick={onClose} style={closeBtn} className="btn-interactive">
            Close
          </button>
        </div>

        <div style={body}>
          {loading && <div style={empty}>Loading...</div>}
          {!loading && error && <div style={errorText}>{error}</div>}

          {!loading && !error && data && (
            // 直接使用类似 ResultPanel item 内部的布局
            <div>
              {/* Surface + Reading (在括号内) */}
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {data.surface} {data.reading ? <span style={mutedNormal}>({data.reading})</span> : null}
              </div>

              {/* Meaning */}
              <div style={muted}>{data.meaning_en}</div>

              {/* Example */}
              {data.example ? <div style={example}>{data.example}</div> : null}

              {/* Notes */}
              {data.notes ? <div style={mutedSmall}>{data.notes}</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Styles - 尽可能复用 ResultPanel 的样式定义 */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(0, 0, 0, 0.15)",
};

const modalCard: React.CSSProperties = {
  width: "min(500px, 100%)", // 稍微调窄一点，更像卡片
  borderRadius: 16, // 对应 ResultPanel 的 borderRadius
  background: "rgba(var(--panel-rgb), 0.5)", // 保持与 ResultPanel 一致的底色逻辑，或者用之前的半透明
  // 如果想保留毛玻璃效果可以保留下面几行，如果想完全一致则去掉
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
  padding: 20, // 稍微加大内边距
  color: "var(--text)",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16, // 拉开标题和内容的距离
};

const title: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
};

const closeBtn: React.CSSProperties = {
  borderRadius: 12,
  padding: "6px 10px",
  background: "rgba(var(--accent-rgb), 0.2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
};

const body: React.CSSProperties = {
  // 移除之前的 grid，让内容自然堆叠
};

const errorText: React.CSSProperties = {
  color: "crimson",
  padding: 10,
};

const empty: React.CSSProperties = { opacity: 0.6, padding: 10 };

// --- 以下样式直接复刻自 ResultPanel ---

// 为了复用，稍作调整 (比如字号)，mutedNormal 用于括号内的读音
const mutedNormal: React.CSSProperties = { opacity: 0.8, fontWeight: 400, fontSize: "0.9em" };

const muted: React.CSSProperties = { 
  opacity: 0.8, 
  marginTop: 8, 
  fontSize: 15, // 弹窗里字稍微大一点点更易读
  lineHeight: 1.5 
};

const mutedSmall: React.CSSProperties = { 
  opacity: 0.65, 
  marginTop: 8, 
  fontSize: 13 
};

const example: React.CSSProperties = { 
  opacity: 0.85, 
  marginTop: 8, 
  fontStyle: "italic", 
  fontSize: 14,
  lineHeight: 1.5
};