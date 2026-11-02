import { handleRoute, parseRequest } from "@/lib/http";
import { callLLM, withFallback } from "@/lib/llm";
import { mockAnalyze } from "@/lib/mock/analyze";
import { normalizeAnalysis } from "@/lib/postprocess";
import { buildAnalyzeMessages } from "@/lib/prompts";
import { analysisSchema, analyzeRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const parsed = await parseRequest(request, analyzeRequestSchema);
    if (!parsed.ok) return parsed.response;
    const { referenceText } = parsed.data;

    const result = await withFallback(
      () => callLLM(buildAnalyzeMessages(referenceText), analysisSchema),
      () => mockAnalyze(referenceText),
    );
    return Response.json({ ...result, data: normalizeAnalysis(result.data) });
  });
}
