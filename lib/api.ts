import type { Analysis, ApiResult, ProductInput, Script, Shot } from "./types";

async function post<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("网络异常，请重试");
  }

  const payload = (await res.json().catch(() => null)) as (ApiResult<T> & { error?: string }) | null;
  if (!res.ok || !payload) {
    throw new Error(payload?.error || "服务异常，请重试");
  }
  return payload;
}

export function analyze(referenceText: string) {
  return post<Analysis>("/api/analyze", { referenceText });
}

export function generate(referenceText: string, analysis: Analysis, product: ProductInput) {
  return post<Script>("/api/generate", { referenceText, analysis, product });
}

export function rewriteShot(params: {
  referenceText: string;
  analysis: Analysis;
  product: ProductInput;
  script: Script;
  shotIndex: number;
  instruction?: string;
}) {
  return post<Shot>("/api/rewrite-shot", params);
}
