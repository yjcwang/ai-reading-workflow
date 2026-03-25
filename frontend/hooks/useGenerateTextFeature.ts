"use client";

import { useState } from "react";
import type { GenerateTextRequest, Level } from "@/lib/types";

type UseGenerateTextFeatureOptions = {
  level: Level;
};

export function useGenerateTextFeature({
  level,
}: UseGenerateTextFeatureOptions) {
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerateRequest(
    request: GenerateTextRequest
  ): Promise<string | null> {
    setGenerateLoading(true);
    setGenerateError(null);

    try {
      const topic = request.topic.trim() || "default_topic";
      const length = request.length.trim() || "default_length";
      const style = request.style.trim() || "default_style";

      const generatedText = `(Mock)これは${level}レベルの${topic}課題${length}長さ${style}風味に関するサンプル文章です。
        現代社会において、「効率化」という言葉はほとんど疑問視されることなく肯定的に受け取られている。
        時間を短縮し、労力を削減し、成果を最大化することは、個人にとっても組織にとっても理想的な在り方であるとされがちだ。
        しかし、その一方で、効率化を過度に追求する社会が、人間の思考様式そのものにどのような影響を及ぼしているのかについては、十分に議論されているとは言い難い。

        本来、思考とは試行錯誤を伴う過程であり、遠回りや失敗を通してこそ深まるものである。
        ところが、即時的な答えや最短経路が常に提示される環境に身を置くことで、人は「考える前に選択する」姿勢を身につけてしまう傾向がある。
        検索すれば答えが出る、テンプレートに当てはめれば結論に到達できるという状況は、一見すると合理的であるが、裏を返せば、思考の余地があらかじめ狭められているとも言える。`;

      return generatedText;
    } catch (e: any) {
      setGenerateError(e?.message ?? "Unknown error");
      return null;
    } finally {
      setGenerateLoading(false);
    }
  }

  function resetGenerate() {
    setGenerateLoading(false);
    setGenerateError(null);
  }

  return {
    generateLoading,
    generateError,
    handleGenerateRequest,
    resetGenerate,
  };
}