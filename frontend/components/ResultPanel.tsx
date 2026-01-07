"use client";

import React from "react";
import type { AnalyzeResponse } from "@/lib/types";

type Props = {
  data: AnalyzeResponse;
  error: string | null;
  loading: boolean;
};

export function ResultPanel({ data, error, loading}: Props) {
  return ( 
    // informatiion display top margin
    <div style={card}> 
      <div style={rowBetween}>
        <div style={{ fontWeight: 700 }}>Result</div>
        <div style={{ opacity: 0.7, fontSize: 13 }}> 
          {data.vocab.length} vocab · {data.grammar.length} grammar  
        </div>
      </div>
      
      {/*Error message*/}
      {error ? <div style={errorBox}>Error: {error}</div> : null} 

      {/*Content*/}
      <div style={twoCols}>
        <div>
          <div style={sectionTitle}>Vocabulary</div>
          <ul style={list}> 
            {loading ? (
              <li style={empty}>Loading...</li>
            ) :
            data.vocab.length === 0 ? ( 
              <li style={empty}>None</li>
            ) : (
              data.vocab.map((v, i) => (
                <li key={i} style={item}>
                  <div style={{ fontWeight: 700 }}>{v.surface} {v.reading ? <span style={muted}>({v.reading})</span> : null}</div>
                  {v.meaning_en ? <div style={muted}>{v.meaning_en}</div> : null}
                  {v.why ? <div style={mutedSmall}>{v.why}</div> : null}
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <div style={sectionTitle}>Grammar</div>
          <ul style={list}>
            {loading ? (
              <li style={empty}>Loading...</li>
            ) :
            data.grammar.length === 0 ? (
              <li style={empty}>None</li>
            ) : (
              data.grammar.map((g, i) => (
                <li key={i} style={item}>
                  <div style={{ fontWeight: 700 }}>{g.pattern}</div>
                  {g.explanation_en ? <div style={muted}>{g.explanation_en}</div> : null}
                  {g.example_from_text ? <div style={example}>{g.example_from_text}</div> : null}
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
};

const empty: React.CSSProperties = { opacity: 0.6, padding: 10 };

const muted: React.CSSProperties = { opacity: 0.8, marginTop: 6, fontSize: 13 };
const mutedSmall: React.CSSProperties = { opacity: 0.65, marginTop: 6, fontSize: 12 };
const example: React.CSSProperties = { opacity: 0.85, marginTop: 6, fontStyle: "italic", fontSize: 13 };

const errorBox: React.CSSProperties = {
  border: "1px solid #5a2a2a",
  background: "#1a0f12",
  color: "#ffb5b5",
  borderRadius: 12,
  padding: 10,
  marginBottom: 10,
};
