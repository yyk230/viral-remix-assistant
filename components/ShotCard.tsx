"use client";

import { useState } from "react";
import { ORIGINALITY_FIELD_LABELS, ROLE_LABELS } from "@/lib/labels";
import type { OriginalityHit } from "@/lib/originality";
import { INPUT_LIMITS, type Shot, type Source } from "@/lib/types";
import { ROLE_CHIP_CLASS } from "./roleStyles";

interface Props {
  shot: Shot;
  hits: OriginalityHit[];
  rewriteSource?: Source;
  showMockHint: boolean;
  loading: boolean;
  disabled: boolean;
  onChange: (shot: Shot) => void;
  /** 成功时返回 true */
  onRewrite: (instruction: string) => Promise<boolean>;
}

const FIELDS: { key: "visual" | "shooting" | "line" | "onScreenText"; label: string }[] = [
  { key: "visual", label: "画面" },
  { key: "shooting", label: "拍法" },
  { key: "line", label: "台词 / 旁白" },
  { key: "onScreenText", label: "花字" },
];

export function ShotCard({ shot, hits, rewriteSource, showMockHint, loading, disabled, onChange, onRewrite }: Props) {
  const [instruction, setInstruction] = useState("");
  const flagged = hits.length > 0;

  async function handleRewrite() {
    if (await onRewrite(instruction)) setInstruction("");
  }

  return (
    <article className={`space-y-2 rounded-xl border-2 p-3 ${flagged ? "border-amber-400 bg-amber-50/40" : "border-slate-100"}`}>
      <header className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">镜 {shot.index}</span>
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${ROLE_CHIP_CLASS[shot.segmentRole]}`}>
          {ROLE_LABELS[shot.segmentRole]}
        </span>
        <span className="text-xs text-slate-500">{shot.durationSec} 秒</span>
        {rewriteSource && (
          <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
            已重写 · {rewriteSource === "llm" ? "AI" : "演示数据"}
          </span>
        )}
      </header>

      {FIELDS.map(({ key, label }) => (
        <label key={key} className="block">
          <span className="text-xs text-slate-500">{label}</span>
          <textarea
            value={shot[key]}
            rows={2}
            disabled={disabled}
            onChange={(e) => onChange({ ...shot, [key]: e.target.value })}
            className="mt-0.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm leading-relaxed outline-none focus:border-rose-400 disabled:bg-slate-50"
          />
        </label>
      ))}

      {flagged && (
        <ul className="space-y-0.5 text-xs text-amber-700">
          {hits.map((hit, i) => (
            <li key={i}>
              {ORIGINALITY_FIELD_LABELS[hit.field]}与参考原句重复：『{hit.fragment}』
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-1">
        <input
          value={instruction}
          maxLength={INPUT_LIMITS.instruction}
          disabled={disabled}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="修改要求，如：更口语化（选填，最多 50 字）"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-rose-400 disabled:bg-slate-50"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={handleRewrite}
          className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "正在重写…" : "重写这一镜"}
        </button>
      </div>
      {showMockHint && <p className="text-xs text-slate-400">未配置模型，修改要求不生效，仅更换写法</p>}
    </article>
  );
}
