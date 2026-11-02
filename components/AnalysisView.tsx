import { ROLE_LABELS } from "@/lib/labels";
import type { Analysis, ResultMeta } from "@/lib/types";
import { ROLE_CHIP_CLASS } from "./roleStyles";
import { SourceBadge } from "./SourceBadge";

export function AnalysisView({ analysis, meta }: { analysis: Analysis; meta: ResultMeta }) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">爆款结构拆解</h2>
        <SourceBadge meta={meta} />
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{analysis.summary}</p>

      <div className="rounded-xl bg-rose-50 p-3">
        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-medium text-white">{analysis.hookType}</span>
        <p className="mt-2 text-sm text-slate-800">「{analysis.hookText}」</p>
      </div>

      <ol className="space-y-3 border-l-2 border-slate-100 pl-3">
        {analysis.segments.map((segment, i) => {
          const start = Math.min(segment.startSec, segment.endSec);
          const end = Math.max(segment.startSec, segment.endSec);
          return (
            <li key={i} className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${ROLE_CHIP_CLASS[segment.role]}`}>
                  {ROLE_LABELS[segment.role]}
                </span>
                <span className="text-sm font-medium">{segment.label}</span>
                <span className="text-xs text-slate-400">
                  约 {start}–{end} 秒（估算）
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">原文：{segment.originalText}</p>
              <p className="text-xs leading-relaxed text-slate-700">作用：{segment.purpose}</p>
              <p className="text-xs leading-relaxed text-slate-700">镜头：{segment.shotType}</p>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <h3 className="text-sm font-semibold text-emerald-700">可复用的套路</h3>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-700">
            {analysis.reusablePatterns.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <h3 className="text-sm font-semibold text-slate-600">不可照搬的内容</h3>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-700">
            {analysis.nonCopyable.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
