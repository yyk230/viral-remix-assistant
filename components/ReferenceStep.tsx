import { SAMPLES } from "@/lib/samples";
import { INPUT_LIMITS } from "@/lib/types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  disabled: boolean;
}

export function validateReference(text: string): string | null {
  const trimmed = text.trim();
  if (/https?:\/\//.test(trimmed) && trimmed.replace(/https?:\/\/\S+/g, "").trim().length < INPUT_LIMITS.referenceMin) {
    return "Demo 暂不支持解析视频链接，请粘贴口播文案或字幕";
  }
  if (trimmed.length < INPUT_LIMITS.referenceMin) return `参考文案至少 ${INPUT_LIMITS.referenceMin} 字`;
  if (trimmed.length > INPUT_LIMITS.referenceMax) return `参考文案最多 ${INPUT_LIMITS.referenceMax} 字`;
  return null;
}

export function ReferenceStep({ value, onChange, onAnalyze, loading, disabled }: Props) {
  const length = value.trim().length;
  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-base font-semibold">粘贴一条你想学的爆款</h2>
        <p className="mt-1 text-xs text-slate-500">粘贴视频的口播文案或字幕，也可以先用示例体验</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(sample.text)}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            示例：{sample.title}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={9}
          placeholder="例如：千万别在下午四点以后来买……"
          className="w-full resize-none rounded-xl border border-slate-200 p-3 pb-7 text-sm leading-relaxed outline-none focus:border-rose-400 disabled:bg-slate-50"
        />
        <span
          className={`absolute right-3 bottom-3 text-xs ${
            length > INPUT_LIMITS.referenceMax ? "text-red-500" : "text-slate-400"
          }`}
        >
          {length} / {INPUT_LIMITS.referenceMax}
        </span>
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={disabled}
        className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
      >
        {loading ? "正在拆解爆款结构…" : "开始拆解"}
      </button>
    </section>
  );
}
