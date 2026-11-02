import { errorResponse, handleRoute, parseRequest } from "@/lib/http";
import { callLLM, withFallback } from "@/lib/llm";
import { mockRewriteShot } from "@/lib/mock/generate";
import { normalizeRewrittenShot } from "@/lib/postprocess";
import { buildRewriteMessages } from "@/lib/prompts";
import { rewriteRequestSchema, shotSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const parsed = await parseRequest(request, rewriteRequestSchema);
    if (!parsed.ok) return parsed.response;
    const { referenceText, analysis, product, script, shotIndex } = parsed.data;
    const instruction = parsed.data.instruction || undefined;

    const original = script.shots.find((s) => s.index === shotIndex);
    if (!original) return errorResponse(`镜号 ${shotIndex} 不存在`, 400);

    const result = await withFallback(
      () =>
        callLLM(
          buildRewriteMessages(referenceText, analysis, product, script, shotIndex, instruction),
          shotSchema,
        ),
      () => mockRewriteShot(product, script, shotIndex),
    );
    return Response.json({ ...result, data: normalizeRewrittenShot(result.data, original) });
  });
}
