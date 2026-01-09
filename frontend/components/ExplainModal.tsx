"use client";

import React, { useEffect } from "react";
import type { ExplainResponse } from "@/lib/types";

type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: ExplainResponse | null;
  onClose: () => void;
  onAdd: (item: ExplainResponse) => void;
};

export function ExplainModal({ 
  open, 
  loading, 
  error, 
  data, 
  onClose, 
  onAdd}: Props) {
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
          <div style={buttonGroup}>
            <button 
              disabled={!data || loading || !!error} 
              onClick={() => {
                if (!data) return;
                onAdd(data);     
                onClose();      
              }} 
              style={closeBtn}
              className="btn-interactive"
            > 
              Add to list
            </button>
            
            <button onClick={onClose} style={closeBtn} className="btn-interactive">
              Close
            </button>
          </div>
        </div>

        <div style={body}>
          {loading && <div style={empty}>Loading...</div>}
          {!loading && error && <div style={errorText}>{error}</div>}

          {!loading && !error && data && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {data.surface} {data.reading ? <span style={mutedNormal}>({data.reading})</span> : null}
              </div>
             
              <div style={muted}>{data.meaning_en}</div>
            
              {data.example ? <div style={example}>{data.example}</div> : null}

              {data.notes ? <div style={mutedSmall}>{data.notes}</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



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
  width: "min(500px, 100%)", 
  borderRadius: 16, 
  background: "rgba(var(--panel-rgb), 0.5)", 
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
  padding: 20,
  color: "var(--text)",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16, 
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

const buttonGroup: React.CSSProperties = {
  display: "flex",
  gap: "8px",
};

const body: React.CSSProperties = {

};

const errorText: React.CSSProperties = {
  color: "crimson",
  padding: 10,
};

const empty: React.CSSProperties = { opacity: 0.6, padding: 10 };


// 为了复用，稍作调整 (比如字号)，mutedNormal 用于括号内的读音
const mutedNormal: React.CSSProperties = { opacity: 0.8, fontWeight: 400, fontSize: "0.9em" };

const muted: React.CSSProperties = { 
  opacity: 0.8, 
  marginTop: 8, 
  fontSize: 15, 
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