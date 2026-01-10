import type { AnalyzeResponse, Level, ExplainResponse } from "./types";

// service layer, handle operations

export async function analyze(text: string, level: Level): Promise<AnalyzeResponse> {

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BASE_URL) {
     throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const resp = await fetch(BASE_URL + "/api/analyze", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ text, level }),
   });
   if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
   return (await resp.json()) as AnalyzeResponse;
}

export async function explain(selected_text: string, context: string): Promise<ExplainResponse> {

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BASE_URL) {
   throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const resp = await fetch(BASE_URL + "/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selected_text, context, mode: "auto" }),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as ExplainResponse;
}

export async function exportPdf(data: AnalyzeResponse): Promise<Blob> {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }

  const resp = await fetch(BASE_URL + "/api/export_pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  return await resp.blob();
}
