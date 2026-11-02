import type { z } from "zod";

export function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

/** 解析并校验请求体；失败时返回 400 响应 */
export async function parseRequest<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: errorResponse("请求体不是合法的 JSON", 400) };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { ok: false, response: errorResponse(issue?.message ?? "请求参数不合法", 400) };
  }
  return { ok: true, data: result.data };
}

export async function handleRoute(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error("[api] 未预期的异常：", error);
    return errorResponse("服务异常，请重试", 500);
  }
}
