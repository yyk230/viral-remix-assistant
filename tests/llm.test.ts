import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { callLLM, parseModelJson, withFallback } from "@/lib/llm";

const schema = z.object({ ok: z.boolean() });

function stubConfigured() {
  vi.stubEnv("LLM_BASE_URL", "https://example.com/v1/");
  vi.stubEnv("LLM_API_KEY", "test-key");
  vi.stubEnv("LLM_MODEL", "test-model");
}

function modelResponse(content: string, status = 200) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("parseModelJson", () => {
  it("解析纯 JSON", () => {
    expect(parseModelJson(' {"ok": true} ')).toEqual({ ok: true });
  });

  it("解析被 json 代码块包裹的 JSON", () => {
    expect(parseModelJson('```json\n{"ok": true}\n```')).toEqual({ ok: true });
    expect(parseModelJson('```\n{"ok": false}\n```')).toEqual({ ok: false });
  });

  it("非法 JSON 抛出异常", () => {
    expect(() => parseModelJson("不是 JSON")).toThrow();
  });
});

describe("callLLM", () => {
  it("请求地址去掉末尾斜杠，并返回校验后的对象", async () => {
    stubConfigured();
    const fetchMock = vi.fn().mockResolvedValue(modelResponse('{"ok": true}'));
    vi.stubGlobal("fetch", fetchMock);

    await expect(callLLM([{ role: "user", content: "JSON" }], schema)).resolves.toEqual({ ok: true });
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.com/v1/chat/completions");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("test-model");
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("HTTP 401 抛出异常", async () => {
    stubConfigured();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unauthorized", { status: 401 })));
    await expect(callLLM([], schema)).rejects.toThrow(/401/);
  });

  it("内容不符合 schema 抛出异常", async () => {
    stubConfigured();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(modelResponse('{"ok": "yes"}')));
    await expect(callLLM([], schema)).rejects.toThrow();
  });
});

describe("withFallback", () => {
  it("未配置模型时返回 not_configured，且不调用模型", async () => {
    vi.stubEnv("LLM_BASE_URL", "");
    vi.stubEnv("LLM_API_KEY", "key");
    vi.stubEnv("LLM_MODEL", "model");
    const llmFn = vi.fn();
    const result = await withFallback(llmFn, () => "mock");
    expect(result).toEqual({ data: "mock", source: "mock", fallbackReason: "not_configured" });
    expect(llmFn).not.toHaveBeenCalled();
  });

  it("模型调用失败时返回 llm_error", async () => {
    stubConfigured();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await withFallback(() => Promise.reject(new Error("boom")), () => "mock");
    expect(result).toEqual({ data: "mock", source: "mock", fallbackReason: "llm_error" });
  });

  it("模型调用成功时返回 llm", async () => {
    stubConfigured();
    const result = await withFallback(() => Promise.resolve("real"), () => "mock");
    expect(result).toEqual({ data: "real", source: "llm" });
  });
});
