import type { z } from "zod";
import type { ApiResult } from "./types";

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

const TIMEOUT_MS = 45_000;

export function isLLMConfigured(): boolean {
  return Boolean(
    process.env.LLM_BASE_URL?.trim() && process.env.LLM_API_KEY?.trim() && process.env.LLM_MODEL?.trim(),
  );
}

export function parseModelJson(text: string): unknown {
  let body = text.trim();
  const fenced = body.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) body = fenced[1];
  return JSON.parse(body);
}

export async function callLLM<T>(messages: ChatMessage[], schema: z.ZodType<T>): Promise<T> {
  const baseUrl = (process.env.LLM_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(process.env.LLM_API_KEY ?? "").trim()}`,
      },
      body: JSON.stringify({
        model: (process.env.LLM_MODEL ?? "").trim(),
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      throw new Error(`模型接口返回 HTTP ${res.status}：${detail}`);
    }

    const payload = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("模型返回内容为空");
    }

    return schema.parse(parseModelJson(content));
  } finally {
    clearTimeout(timer);
  }
}

export async function withFallback<T>(
  llmFn: () => Promise<T>,
  mockFn: () => T,
): Promise<ApiResult<T>> {
  if (!isLLMConfigured()) {
    return { data: mockFn(), source: "mock", fallbackReason: "not_configured" };
  }
  try {
    return { data: await llmFn(), source: "llm" };
  } catch (error) {
    console.error("[llm] 调用失败，退回演示数据：", error);
    return { data: mockFn(), source: "mock", fallbackReason: "llm_error" };
  }
}
