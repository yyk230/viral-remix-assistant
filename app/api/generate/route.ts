import { handleRoute, parseRequest } from "@/lib/http";
import { callLLM, withFallback } from "@/lib/llm";
import { mockGenerate } from "@/lib/mock/generate";
import { normalizeScript } from "@/lib/postprocess";
import { buildGenerateMessages } from "@/lib/prompts";
import { generateRequestSchema, scriptSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const parsed = await parseRequest(request, generateRequestSchema);
    if (!parsed.ok) return parsed.response;
    const { referenceText, analysis, product } = parsed.data;

    const result = await withFallback(
      () => callLLM(buildGenerateMessages(referenceText, analysis, product), scriptSchema),
      () => mockGenerate(referenceText, analysis, product),
    );
    return Response.json({ ...result, data: normalizeScript(result.data, product.targetDurationSec) });
  });
}
