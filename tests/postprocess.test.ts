import { describe, expect, it } from "vitest";
import { normalizeAnalysis, normalizeRewrittenShot, normalizeScript } from "@/lib/postprocess";
import type { Analysis, Script, Shot } from "@/lib/types";

function shot(index: number, durationSec: number): Shot {
  return {
    index,
    segmentRole: "show",
    durationSec,
    visual: "画面",
    shooting: "拍法",
    line: "台词",
    onScreenText: "",
  };
}

describe("normalizeAnalysis", () => {
  it("按 startSec 排序并截断超出上限的数组", () => {
    const segment = (startSec: number) => ({
      role: "show" as const,
      label: `段${startSec}`,
      startSec,
      endSec: startSec + 1,
      originalText: "原文",
      purpose: "作用",
      shotType: "镜头",
    });
    const analysis: Analysis = {
      summary: "总结",
      hookType: "提问式",
      hookText: "开头",
      segments: Array.from({ length: 12 }, (_, i) => segment(11 - i)),
      reusablePatterns: Array.from({ length: 8 }, (_, i) => `套路${i}`),
      nonCopyable: Array.from({ length: 7 }, (_, i) => `内容${i}`),
    };
    const result = normalizeAnalysis(analysis);
    expect(result.segments).toHaveLength(10);
    expect(result.segments.map((s) => s.startSec)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.reusablePatterns).toHaveLength(6);
    expect(result.nonCopyable).toHaveLength(6);
  });
});

describe("normalizeScript", () => {
  it("截断、重新编号，并使总时长等于目标时长", () => {
    const script: Script = {
      titleOptions: ["a", "b", "c", "d", "e"],
      shots: Array.from({ length: 14 }, (_, i) => shot(i + 7, 3.5)),
      shootingChecklist: Array.from({ length: 12 }, (_, i) => `清单${i}`),
    };
    const result = normalizeScript(script, 30);
    expect(result.titleOptions).toEqual(["a", "b", "c"]);
    expect(result.shots).toHaveLength(12);
    expect(result.shootingChecklist).toHaveLength(10);
    expect(result.shots.map((s) => s.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(result.shots.reduce((a, s) => a + s.durationSec, 0)).toBe(30);
  });

  it("已经是整数且加总正确的时长保持不变", () => {
    const script: Script = {
      titleOptions: ["a"],
      shots: [shot(1, 3), shot(2, 3), shot(3, 6), shot(4, 7), shot(5, 5), shot(6, 6)],
      shootingChecklist: ["x"],
    };
    expect(normalizeScript(script, 30).shots.map((s) => s.durationSec)).toEqual([3, 3, 6, 7, 5, 6]);
  });
});

describe("normalizeRewrittenShot", () => {
  it("镜号、角色和时长改回原值", () => {
    const original = shot(3, 6);
    const rewritten: Shot = { ...shot(9, 2), segmentRole: "cta", line: "新台词" };
    expect(normalizeRewrittenShot(rewritten, original)).toEqual({
      ...rewritten,
      index: 3,
      segmentRole: "show",
      durationSec: 6,
    });
  });
});
