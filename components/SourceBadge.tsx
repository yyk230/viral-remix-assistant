import type { ResultMeta } from "@/lib/types";

const base = "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium";

export function SourceBadge({ meta }: { meta: ResultMeta }) {
  if (meta.source === "llm") {
    return <span className={`${base} bg-emerald-100 text-emerald-700`}>AI 生成</span>;
  }
  if (meta.fallbackReason === "llm_error") {
    return <span className={`${base} bg-orange-100 text-orange-700`}>演示数据 · 模型调用失败</span>;
  }
  return <span className={`${base} bg-slate-200 text-slate-600`}>演示数据 · 未配置模型</span>;
}
