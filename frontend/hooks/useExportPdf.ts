"use client";

import { useState } from "react";
import { exportPdf } from "@/lib/api";
import { downloadBlob } from "@/lib/utils";
import type { AnalyzeResponse, TargetLang } from "@/lib/types";

type UseExportPdfOptions = {
  filename?: string;
};

export function useExportPdf(options?: UseExportPdfOptions) {
  const filename = options?.filename ?? "my-list.pdf";

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExportPdf(data: AnalyzeResponse, targetLang: TargetLang) {
    try {
      setExporting(true);
      setExportError(null);

      const blob = await exportPdf(data, targetLang);
      downloadBlob(blob, filename);
    } catch (e: any) {
      setExportError(e?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  }

  function resetExport() {
    setExporting(false);
    setExportError(null);
  }

  return {
    exporting,
    exportError,
    handleExportPdf,
    resetExport,
  };
}