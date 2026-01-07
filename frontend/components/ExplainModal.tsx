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
  // ESC 关闭（可选但很好用）
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onMouseDown={onClose} // 点背景关闭
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        // 遮罩层颜色
        background: "rgba(0, 0, 0, 0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()} // 防止点卡片内部也关闭
        style={{
          width: "min(720px, 100%)",
          borderRadius: 14,
          // 悬浮窗背景
          background: "rgba(0,0,0,0.35)",
          // 毛玻璃模糊效果
          backdropFilter: "blur(8px)", 
          // 兼容性：为了适配 Safari 浏览器
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid #ddd",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 800 }}>Explain</div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "4px 10px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading && <div>Loading…</div>}
          {!loading && error && <div style={{ color: "crimson" }}>{error}</div>}

          {!loading && !error && data && (
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <b>Type:</b> {data.type}
              </div>
              <div>
                <b>Surface:</b> {data.surface}
              </div>
              {data.reading ? (
                <div>
                  <b>Reading:</b> {data.reading}
                </div>
              ) : null}
              <div>
                <b>Meaning:</b> {data.meaning_en}
              </div>
              <div>
                <b>Example:</b>
                <div style={{ marginTop: 4, padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                  {data.example}
                </div>
              </div>
              {data.notes ? (
                <div>
                  <b>Notes:</b> {data.notes}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
