import type { 
  AnalyzeResponse, 
  ArticleHistoryDetailResponse,
  ArticleHistoryItemResponse,
  ExportPdfRequest,
  Level,
  ExplainResponse, 
  GrammarHistoryItemResponse,
  GenerateTextRequest,
  GenerateTextResponse, 
  SaveArticleHistoryRequest,
  TargetLang,
  VocabHistoryItemResponse} from "./types";


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

export async function exportPdf(payload: ExportPdfRequest, targetLang: TargetLang): Promise<Blob> {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  }
 
  const resp = await fetch(BASE_URL + "/api/export_pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, target_lang: targetLang }),
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

export async function saveArticleHistory(
  payload: SaveArticleHistoryRequest,
): Promise<ArticleHistoryDetailResponse> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/history/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as ArticleHistoryDetailResponse;
}

export async function getArticleHistory(): Promise<ArticleHistoryItemResponse[]> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/history/articles");

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as ArticleHistoryItemResponse[];
}

export async function getVocabHistoryItems(): Promise<VocabHistoryItemResponse[]> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/history/vocab");

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as VocabHistoryItemResponse[];
}

export async function getGrammarHistoryItems(): Promise<GrammarHistoryItemResponse[]> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + "/api/history/grammar");

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as GrammarHistoryItemResponse[];
}

export async function getArticleHistoryDetail(
  articleId: string,
): Promise<ArticleHistoryDetailResponse> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + `/api/history/articles/${articleId}`);

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as ArticleHistoryDetailResponse;
}

export async function deleteArticleHistory(articleId: string): Promise<{ status: string }> {
  const BASE_URL = getBackendBaseUrl();

  const resp = await fetch(BASE_URL + `/api/history/articles/${articleId}`, {
    method: "DELETE",
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as { status: string };
}
