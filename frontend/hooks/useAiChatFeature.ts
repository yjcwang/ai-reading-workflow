"use client";

import { useState } from "react";
import { askAi } from "@/lib/api";
import type {
  AiChatMessage,
  AnalyzeResponse,
  AskAIContextType,
  Level,
  TargetLang,
} from "@/lib/types";

type SendQuestionInput = {
  question: string;
  articleText: string;
  analysis: AnalyzeResponse;
  level: Level;
  targetLang: TargetLang;
  contextType?: AskAIContextType;
  contextPayload?: Record<string, unknown> | null;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useAiChatFeature() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendQuestion(input: SendQuestionInput) {
    const question = input.question.trim();
    if (!question || loading) return;

    const userMessage: AiChatMessage = {
      id: createMessageId(),
      role: "user",
      content: question,
    };
    const history = messages;

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await askAi({
        question,
        messages: history.map(({ role, content }) => ({ role, content })),
        context_type: input.contextType ?? "article",
        context_payload: input.contextPayload ?? null,
        article_text: input.articleText,
        analysis: input.analysis,
        level: input.level,
        target_lang: input.targetLang,
      });

      const assistantMessage: AiChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setOpen(false);
    setMessages([]);
    setLoading(false);
    setError(null);
  }

  return {
    open,
    setOpen,
    messages,
    loading,
    error,
    sendQuestion,
    resetChat,
  };
}
