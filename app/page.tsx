"use client";

import { useState } from "react";
import { AnalysisView } from "@/components/AnalysisView";
import { ProductForm } from "@/components/ProductForm";
import { ReferenceStep, validateReference } from "@/components/ReferenceStep";
import { ScriptView } from "@/components/ScriptView";
import { StepBar, type Step } from "@/components/StepBar";
import * as api from "@/lib/api";
import { productInputSchema } from "@/lib/schemas";
import type { Analysis, ProductInput, ResultMeta, Script, Source } from "@/lib/types";

type Loading = null | "analyze" | "generate" | { rewrite: number };

const EMPTY_PRODUCT: ProductInput = {
  name: "",
  sellingPoints: [""],
  audience: "",
  style: "真实亲切",
  solo: true,
  onCamera: false,
  location: "",
  targetDurationSec: 30,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "服务异常，请重试";
}

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [referenceText, setReferenceText] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisMeta, setAnalysisMeta] = useState<ResultMeta | null>(null);
  const [product, setProduct] = useState<ProductInput>(EMPTY_PRODUCT);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [script, setScript] = useState<Script | null>(null);
  const [scriptMeta, setScriptMeta] = useState<ResultMeta | null>(null);
  const [scriptProduct, setScriptProduct] = useState<ProductInput | null>(null);
  const [scriptVersion, setScriptVersion] = useState(0);
  const [scriptDirty, setScriptDirty] = useState(false);
  const [shotRewriteSource, setShotRewriteSource] = useState<Record<number, Source>>({});
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = loading !== null;
  const step2Enabled = analysis !== null && referenceText.trim() === analyzedText;
  const step3Enabled = step2Enabled && script !== null;

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  async function handleAnalyze() {
    setError(null);
    const invalid = validateReference(referenceText);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (script && scriptDirty && !window.confirm("重新拆解会清空当前脚本和你的修改，确定继续吗？")) return;

    const text = referenceText.trim();
    setLoading("analyze");
    try {
      const res = await api.analyze(text);
      setAnalysis(res.data);
      setAnalysisMeta({ source: res.source, fallbackReason: res.fallbackReason });
      setAnalyzedText(text);
      setScript(null);
      setScriptMeta(null);
      setScriptProduct(null);
      setShotRewriteSource({});
      setScriptDirty(false);
      setStep(2);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerate() {
    if (!analysis) return;
    setError(null);
    const parsed = productInputSchema.safeParse(product);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        errors[key] ??= issue.message;
      }
      setProductErrors(errors);
      return;
    }
    setProductErrors({});
    if (script && scriptDirty && !window.confirm("重新生成会覆盖你对脚本的手动修改，确定继续吗？")) return;

    const trimmedProduct = parsed.data;
    setProduct(trimmedProduct);
    setLoading("generate");
    try {
      const res = await api.generate(analyzedText, analysis, trimmedProduct);
      setScript(res.data);
      setScriptMeta({ source: res.source, fallbackReason: res.fallbackReason });
      setScriptProduct(trimmedProduct);
      setScriptVersion((v) => v + 1);
      setScriptDirty(false);
      setShotRewriteSource({});
      setStep(3);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(null);
    }
  }

  async function handleRewrite(shotIndex: number, instruction: string): Promise<boolean> {
    if (!analysis || !script || !scriptProduct) return false;
    setError(null);
    setLoading({ rewrite: shotIndex });
    try {
      const res = await api.rewriteShot({
        referenceText: analyzedText,
        analysis,
        product: scriptProduct,
        script,
        shotIndex,
        instruction: instruction.trim() || undefined,
      });
      setScript((current) =>
        current && {
          ...current,
          shots: current.shots.map((s) => (s.index === shotIndex ? res.data : s)),
        },
      );
      setScriptDirty(true);
      setShotRewriteSource((prev) => ({ ...prev, [shotIndex]: res.source }));
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setLoading(null);
    }
  }

  function handleScriptChange(next: Script) {
    setScript(next);
    setScriptDirty(true);
  }

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          爆款复刻助手 <span className="align-middle text-xs font-normal text-slate-400">小影 · 创作工具</span>
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          看到同行的爆款不知道怎么学？粘贴它的文案，AI 帮你拆出结构，再迁移到你自己的产品上，生成可以照着拍的分镜脚本。只学结构，不抄内容。
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="rounded bg-white px-2 py-1">粘贴爆款</span>
          <span>→</span>
          <span className="rounded bg-white px-2 py-1">拆解结构</span>
          <span>→</span>
          <span className="rounded bg-white px-2 py-1">生成我的脚本</span>
        </div>
      </header>

      <StepBar
        current={step}
        enabled={{ 1: true, 2: step2Enabled, 3: step3Enabled }}
        disabled={busy}
        onChange={goTo}
      />

      {step === 1 && (
        <ReferenceStep
          value={referenceText}
          onChange={setReferenceText}
          onAnalyze={handleAnalyze}
          loading={loading === "analyze"}
          disabled={busy}
        />
      )}

      {step === 2 && analysis && analysisMeta && (
        <>
          <AnalysisView analysis={analysis} meta={analysisMeta} />
          <ProductForm
            product={product}
            errors={productErrors}
            onChange={setProduct}
            onSubmit={handleGenerate}
            loading={loading === "generate"}
            disabled={busy}
          />
        </>
      )}

      {step === 3 && analysis && script && scriptMeta && scriptProduct && (
        <ScriptView
          key={scriptVersion}
          referenceText={analyzedText}
          analysis={analysis}
          product={scriptProduct}
          script={script}
          meta={scriptMeta}
          rewriteSource={shotRewriteSource}
          rewritingIndex={typeof loading === "object" && loading !== null ? loading.rewrite : null}
          disabled={busy}
          onChange={handleScriptChange}
          onRewrite={handleRewrite}
          onBack={() => goTo(2)}
          onError={setError}
        />
      )}

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
    </main>
  );
}
