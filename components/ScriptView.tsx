"use client";

import { useMemo, useState } from "react";
import { exportMarkdown } from "@/lib/exportMarkdown";
import { checkOriginality, originalitySummary } from "@/lib/originality";
import type { Analysis, ProductInput, ResultMeta, Script, Shot, Source } from "@/lib/types";
import { ShotCard } from "./ShotCard";
import { SourceBadge } from "./SourceBadge";

interface Props {
  referenceText: string;
  analysis: Analysis;
  product: ProductInput;
  script: Script;
  meta: ResultMeta;
  rewriteSource: Record<number, Source>;
  rewritingIndex: number | null;
  disabled: boolean;
  onChange: (script: Script) => void;
  onRewrite: (shotIndex: number, instruction: string) => Promise<boolean>;
  onBack: () => void;
  onError: (message: string) => void;
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

export function ScriptView({
  referenceText,
  analysis,
  product,
  script,
  meta,
  rewriteSource,
  rewritingIndex,
  disabled,
  onChange,
  onRewrite,
  onBack,
  onError,
}: Props) {
  const [copied, setCopied] = useState(false);
  const originality = useMemo(() => checkOriginality(referenceText, script), [referenceText, script]);
  const total = script.shots.reduce((sum, s) => sum + s.durationSec, 0);

  const markdown = () => exportMarkdown(product, analysis, script, originality, meta.source);

  const updateShot = (shot: Shot) =>
    onChange({ ...script, shots: script.shots.map((s) => (s.index === shot.index ? shot : s)) });

  const updateTitle = (index: number, value: string) =>
    onChange({ ...script, titleOptions: script.titleOptions.map((t, i) => (i === index ? value : t)) });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onError("复制失败，请使用下载");
    }
  }

  function handleDownload() {
    const blob = new Blob([markdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `爆款复刻脚本-${safeFileName(product.name)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold">
          {product.name} · 分镜脚本 <span className="text-sm font-normal text-slate-500">共 {total} 秒</span>
        </h2>
        <SourceBadge meta={meta} />
      </div>

      <div
        className={`rounded-xl px-3 py-2 text-sm ${
          originality.hitShotCount === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        原创性检查：{originalitySummary(originality)}
      </div>

      <div>
        <h3 className="text-sm font-semibold">标题备选</h3>
        <div className="mt-1 space-y-2">
          {script.titleOptions.map((title, i) => (
            <input
              key={i}
              value={title}
              disabled={disabled}
              onChange={(e) => updateTitle(i, e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 disabled:bg-slate-50"
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {script.shots.map((shot) => (
          <ShotCard
            key={shot.index}
            shot={shot}
            hits={originality.hits.filter((h) => h.shotIndex === shot.index)}
            rewriteSource={rewriteSource[shot.index]}
            showMockHint={meta.fallbackReason === "not_configured"}
            loading={rewritingIndex === shot.index}
            disabled={disabled}
            onChange={updateShot}
            onRewrite={(instruction) => onRewrite(shot.index, instruction)}
          />
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold">拍摄清单</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {script.shootingChecklist.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onBack}
          className="rounded-xl border border-slate-200 py-2.5 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          修改产品或时长
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={handleCopy}
          className="rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {copied ? "已复制" : "复制脚本"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={handleDownload}
          className="rounded-xl bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          下载 .md
        </button>
      </div>
    </section>
  );
}
