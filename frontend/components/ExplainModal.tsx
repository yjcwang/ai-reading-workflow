"use client";

import React, { useEffect } from "react";
import addIcon from "@/icons/add.svg";
import closeIcon from "@/icons/close.svg";
import {
  buttonGhost,
  buttonSm,
  iconButtonMd,
  maskedIconStyle,
  buttonPrimary,
} from "@/components/buttonStyles";
import type { ExplainResponse, ExplainWordResponse } from "@/lib/types";
import { UI_STRINGS } from "@/lib/i18n";
import { TargetLang } from "@/lib/types";

type Props = {
  open: boolean;
  explainLoading: boolean;
  error: string | null;
  data: ExplainResponse | null;
  onClose: () => void;
  onAdd: (item: ExplainWordResponse) => void;
  targetLang: TargetLang;
};

export function ExplainModal({ 
  open, 
  explainLoading: loading, 
  error, 
  data, 
  onClose, 
  onAdd,
  targetLang}: Props) {
  const tUI = UI_STRINGS[targetLang];
  
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isWord = data && "kind" in data && data.kind === "word";
  const isSentence = data && "kind" in data && data.kind === "sentence";

   return (
    <div onMouseDown={onClose} style={overlay}>
      <div onMouseDown={(e) => e.stopPropagation()} style={modalCard}>
        <div style={headerRow}>
          <div style={title}>{tUI.explainModal.explainTitle}</div>     
            <button
              onClick={onClose}
              style={closeBtn}
              className="btn-interactive"
              title={tUI.explainModal.close}
              aria-label={tUI.explainModal.close}
            >
              <span
                style={maskedIconStyle(closeIcon.src)}
                aria-hidden="true"
              />
            </button> 
        </div>

          {data?.kind === "sentence" && (
            <div style={jpBlock} title={data.sentence_jp}>
              {data.sentence_jp}
            </div>
          )}

        <div style={body}>
          {loading && <div style={empty}>Loading...</div>}
          {!loading && error && <div style={errorText}>{error}</div>}

          {!loading && !error && data && isWord && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={title}>
                {data.type === 'vocab' ? tUI.common.word : tUI.common.grammar}
              </div>
              <div>
                <div style={item}>
                  <button
                    className="btn-interactive"
                    style={addBtn}
                    onClick={() => onAdd(data)}
                    title={tUI.explainModal.addToList}
                    aria-label={tUI.explainModal.addToList}
                  >
                    <>
                      <span
                        style={maskedIconStyle(addIcon.src, 16)}
                        aria-hidden="true"
                      />
                      {tUI.explainModal.addToList}
                    </>
                  </button>
    
                  <div style={itemSurface}>
                    {data.expression}{" "}
                    {data.reading ? <span style={mutedNormal}>({data.reading})</span> : null}
                  </div>              
                  <div style={muted}>{data.definition}</div>

                  {data.example ? <div style={example}>{data.example}</div> : null}

                  {data.notes ? <div style={mutedSmall}>{data.notes}</div> : null}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && data && isSentence && (
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={title}>Translation</div>
                <div style={item}>{data.translation.translation}</div>
              </div>

              <div>
                <div style={title}>
                  {tUI.common.word} <span style={mutedSmall}>({data.vocab.length})</span>
                </div>

                {data.vocab.length === 0 ? (
                  <div style={muted}>No vocab extracted.</div>
                ) : (
                  <ul style={list}>
                    {data.vocab.map((v, idx) => (
                      <li key={`${v.expression}-${idx}`} style={item}>
                        <button
                          className="btn-interactive"
                          style={addBtn}
                          onClick={() =>
                            onAdd({
                              kind: "word",
                              type: "vocab",
                              expression: v.expression,
                              reading: v.reading,
                              definition: v.definition,
                              example: v.example,
                              notes: v.notes ?? null,
                            })
                          }
                          title={tUI.explainModal.addToList}
                          aria-label={tUI.explainModal.addToList}
                        >
                          <>
                            <span
                              style={maskedIconStyle(addIcon.src, 16)}
                              aria-hidden="true"
                            />
                            {tUI.explainModal.addToList}
                          </>
                        </button>
                        <div style={itemSurface}>
                          {v.expression} {v.reading ? <span style={mutedNormal}>({v.reading})</span> : null}
                        </div>
                        {v.definition ? <div style={muted}>{v.definition}</div> : null}
                        {v.example ? <div style={example}>{v.example}</div> : null}
                        {v.notes ? <div style={mutedSmall}>{v.notes}</div> : null}
                      </li>
                    ))}
                  </ul>

                )}
              </div>

              <div>
                <div style={title}>
                  {tUI.common.grammar} <span style={mutedSmall}>({data.grammar.length})</span>
                </div>

                {data.grammar.length === 0 ? (
                  <div style={muted}>No grammar extracted.</div>
                ) : (
                  <ul style={list}>
                    {data.grammar.map((g, idx) => (
                      <li key={`${g.expression}-${idx}`} style={item}>
                        <button
                          className="btn-interactive"
                          style={addBtn}
                          onClick={() =>
                            onAdd({
                              kind: "word",
                              type: "grammar",
                              expression: g.expression,
                              reading: null,
                              definition: g.definition,
                              example: g.example,
                              notes: g.notes ?? null,
                            })
                          }
                          title={tUI.explainModal.addToList}
                          aria-label={tUI.explainModal.addToList}
                        >
                          <>
                            <span
                              style={maskedIconStyle(addIcon.src, 16)}
                              aria-hidden="true"
                            />
                            {tUI.explainModal.addToList}
                          </>
                        </button>
                        <div style={itemSurface}>{g.expression}</div>
                        {g.definition ? <div style={muted}>{g.definition}</div> : null}
                        {g.example ? <div style={example}>{g.example}</div> : null}
                        {g.notes ? <div style={mutedSmall}>{g.notes}</div> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {!loading && !error && data && !isWord && !isSentence && (
            <div style={errorText}>
              Unknown response shape. Please check ExplainResponse types.
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
  background: "var(--panel)",
  border: "1px solid var(--border)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
  padding: 20,
  color: "var(--text)",
  transform: "translateY(-20px)",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
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

const itemSurface: React.CSSProperties = {
  fontWeight: 700, 
  fontSize: 16,
}

const closeBtn: React.CSSProperties = {
  ...iconButtonMd,
  ...buttonGhost,
};

const addBtn: React.CSSProperties = {
  ...buttonSm,
  ...buttonPrimary,
  position: "absolute", 
  top: 10,
  right: 10,
};


const body: React.CSSProperties = {
  overflowY: "auto",
  overscrollBehavior: "contain",
  paddingRight: 6, 
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

const item: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "rgba(0,0,0,0.03)",
  borderRadius: 14,
  padding: 10,
  paddingRight: 92,
  position: "relative",
};

const list: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const jpBlock: React.CSSProperties = {
  ...item,
  padding: 12,
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.6,
  opacity: 0.9,
};

