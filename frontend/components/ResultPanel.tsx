"use client";

import React from "react";
import type { AnalyzeResponse} from "@/lib/types";

type Props = {
  data: AnalyzeResponse;
  error: string | null;
  loading: boolean;
  onDeleteVocab: (surface: string) => void;   
  onDeleteGrammar: (pattern: string) => void;

  onExportPdf: () => void;          
  exporting: boolean;               
  exportError: string | null;
};

export function ResultPanel({ data, error, loading, onDeleteVocab, onDeleteGrammar, onExportPdf, exporting, exportError}: Props) {
  return ( 
    // information display top margin
    <div style={card}> 
      <div style={rowBetween}>
        <div style={{ fontWeight: 700 }}>Result</div>
        <div style={{ opacity: 0.7, fontSize: 13 }}> 
          {data.vocab.length} vocab · {data.grammar.length} grammar  
        </div>
        <button
          className="btn-interactive"
          style={exportBtn}
          onClick={onExportPdf}
          disabled={loading || exporting || (data.vocab.length === 0 && data.grammar.length === 0)}
          title="Export PDF"
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>
      
      {/*Error message*/}
      {error ? <div style={errorBox}>Error: {error}</div> : null} 
      {exportError ? <div style={errorBox}>Export: {exportError}</div> : null}

      {/*Content*/}
      <div style={twoCols}>
        <div> {/*Vocab item*/}
          <div style={sectionTitle}>Vocabulary</div>
          <ul style={list}> 
            {loading ? (
              <li style={empty}>Loading...</li>
            ) :
            data.vocab.length === 0 ? ( 
              <li style={empty}>None</li>
            ) : (
              data.vocab.map((v, i) => (
                <li key={v.surface} style={item}> 
                  <div style={{ fontWeight: 700 }}>{v.surface} {v.reading ? <span style={muted}>({v.reading})</span> : null}</div>
                  {/*delete button*/}
                  <button
                    className="btn-interactive"
                    style={deleteBtn}
                    onClick={() => onDeleteVocab(v.surface)}
                    title="Delete"
                  >
                    Delete
                  </button>
                  {v.meaning_en ? <div style={muted}>{v.meaning_en}</div> : null}
                  {v.example ? <div style={example}>{v.example}</div> : null}
                  {v.notes ? <div style={mutedSmall}>{v.notes}</div> : null}
                </li>
              ))
            )}
          </ul>
        </div>

        <div> {/*Grammar item*/}
          <div style={sectionTitle}>Grammar</div>
          <ul style={list}>
            {loading ? (
              <li style={empty}>Loading...</li>
            ) :
            data.grammar.length === 0 ? (
              <li style={empty}>None</li>
            ) : (
              data.grammar.map((g, i) => (
                <li key={g.pattern} style={item}>
                  <div style={{ fontWeight: 700 }}>{g.pattern}</div>
                  {/*delete button*/}
                  <button
                    className="btn-interactive"
                    style={deleteBtn}
                    onClick={() => onDeleteGrammar(g.pattern)}
                    title="Delete"
                  >
                    Delete
                  </button>
                  {g.explanation_en ? <div style={muted}>{g.explanation_en}</div> : null}
                  {g.example ? <div style={example}>{g.example}</div> : null}
                  {g.notes ? <div style={mutedSmall}>{g.notes}</div> : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  height: "100%",
  overflowY: "auto",
  minHeight: 0,
};

const rowBetween: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const twoCols: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const sectionTitle: React.CSSProperties = { fontWeight: 500, marginBottom: 8 };

const list: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const item: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--surface)",
  borderRadius: 14,
  padding: 10,
  position: "relative", 
  paddingRight: 56,
};

const exportBtn: React.CSSProperties = {
  border: "1px solid var(--border-strong)",
  background: "rgba(var(--accent-rgb), 0.2)",
  color: "var(--text)",
  borderRadius: 14,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const deleteBtn: React.CSSProperties = {
  borderRadius: 14,
  padding: "6px 10px",
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border)",
  position: "absolute", 
  top: 10,
  right: 10,
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
};

const empty: React.CSSProperties = { opacity: 0.6, padding: 10 };

const muted: React.CSSProperties = { opacity: 0.8, marginTop: 6, fontSize: 13 };
const mutedSmall: React.CSSProperties = { opacity: 0.65, marginTop: 6, fontSize: 12 };
const example: React.CSSProperties = { opacity: 0.85, marginTop: 6, fontStyle: "italic", fontSize: 13 };

const errorBox: React.CSSProperties = {
  border: "1px solid #5a2a2a",
  background: "#1a0f12",
  color: "#ffb5b5",
  borderRadius: 14,
  padding: 10,
  marginBottom: 10,
};
