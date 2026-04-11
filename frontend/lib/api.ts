import type { 
  AnalyzeResponse, 
  Level,
  ExplainResponse, 
  GenerateTextRequest,
  GenerateTextResponse, 
  ResultSummaryResponse,
  SaveResultRequest,
  SavedResultResponse,
  TargetLang} from "./types";


// service layer, handle operations

function getBackendBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }
  return baseUrl;
}

export async function analyze(text: string, level: Level, target_lang: TargetLang): Promise<AnalyzeResponse> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/analyze", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ text, level, target_lang }),
   });
   if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
   return (await resp.json()) as AnalyzeResponse;
}

export async function explain(mode: "word" | "sentence", selected_text: string, context: string, level: Level, target_lang: TargetLang): Promise<ExplainResponse> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, selected_text, context, level, target_lang}), 
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as ExplainResponse;
}

export async function exportPdf(data: AnalyzeResponse, targetLang: TargetLang): Promise<Blob> {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }
 
  const resp = await fetch(BASE_URL + "/api/export_pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({data, target_lang: targetLang}),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  return await resp.blob();
}

export async function generateText(
  request: GenerateTextRequest,
  level: Level,
): Promise<GenerateTextResponse> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/generate-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...request,
      level,
    }),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as GenerateTextResponse;
}

export async function saveResult(
  payload: SaveResultRequest,
): Promise<SavedResultResponse> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as SavedResultResponse;
}

export async function getSavedResults(): Promise<ResultSummaryResponse[]> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/results");

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as ResultSummaryResponse[];
}

export async function getSavedResultDetail(
  resultId: string,
): Promise<SavedResultResponse> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + `/api/results/${resultId}`);

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as SavedResultResponse;
}

export async function deleteSavedResult(resultId: string): Promise<{ status: string }> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + `/api/results/${resultId}`, {
    method: "DELETE",
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as { status: string };
}
