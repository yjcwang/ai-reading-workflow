import type { AnalyzeResponse, Level } from "./types";

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

