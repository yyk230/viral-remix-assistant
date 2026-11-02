import { describe, expect, it } from "vitest";
import { ruleAnalyze } from "@/lib/mock/analyze";
import { mockRewriteShot, ruleGenerate } from "@/lib/mock/generate";
import { normalizeScript } from "@/lib/postprocess";
import type { ProductInput } from "@/lib/types";

const analysis = ruleAnalyze(
  "你还在为早餐发愁吗？很多人早上来不及做饭。我们的三明治十分钟就能做好。用的是当天的新鲜面包。顾客都说味道很好。喜欢的话记得点赞关注。",
);

const product: ProductInput = {
  name: "手作果酱",
  sellingPoints: ["无添加", "当季水果"],
  audience: "宝妈",
  style: "温馨治愈",
  solo: true,
  onCamera: false,
  location: "家里厨房",
  targetDurationSec: 15,
};

describe("ruleGenerate", () => {
  it("镜头与分段一一对应，后处理后总时长等于目标时长", () => {
    const script = ruleGenerate(analysis, product);
    expect(script.shots.map((s) => s.segmentRole)).toEqual(analysis.segments.map((s) => s.role));
    for (const target of [15, 30, 60]) {
      const normalized = normalizeScript(script, target);
      expect(normalized.shots.reduce((a, s) => a + s.durationSec, 0)).toBe(target);
    }
  });

  it("一个人拍、不出镜的规则生效", () => {
    const script = ruleGenerate(analysis, product);
    for (const shot of script.shots) {
      expect(shot.shooting).toMatch(/^(手机固定在三脚架，|单手手持，)/);
      expect(shot.line.startsWith("旁白：")).toBe(true);
    }
    expect(script.shots[0].shooting.startsWith("单手手持，")).toBe(true);
    expect(script.shots[1].shooting.startsWith("手机固定在三脚架，")).toBe(true);
  });

  it("有人帮拍、出镜时不加前缀，cta 末尾追加风格结束语", () => {
    const script = ruleGenerate(analysis, { ...product, solo: false, onCamera: true });
    expect(script.shots.some((s) => /三脚架|单手手持/.test(s.shooting))).toBe(false);
    expect(script.shots.some((s) => s.line.startsWith("旁白："))).toBe(false);
    expect(script.shots.at(-1)!.line.endsWith("愿你每天都有一点小确幸")).toBe(true);
  });

  it("标题 3 条且没有未替换的占位符，清单按条件生成", () => {
    const script = ruleGenerate(analysis, product);
    expect(script.titleOptions).toHaveLength(3);
    expect(JSON.stringify(script)).not.toMatch(/\{(name|point|audience|location|firstPoint)\}/);
    expect(script.shootingChecklist).toContain("手机三脚架");
    expect(script.shootingChecklist).toContain("补光灯或靠窗的自然光");
  });
});

describe("mockRewriteShot", () => {
  it("返回的台词与原来不同，连续重写会交替变化", () => {
    const script = normalizeScript(ruleGenerate(analysis, product), 15);
    const original = script.shots[2];
    const first = mockRewriteShot(product, script, original.index);
    expect(first.line).not.toBe(original.line);
    expect(first.segmentRole).toBe(original.segmentRole);

    const updated = { ...script, shots: script.shots.map((s) => (s.index === first.index ? first : s)) };
    const second = mockRewriteShot(product, updated, original.index);
    expect(second.line).not.toBe(first.line);
  });

  it("镜号不存在时抛出异常", () => {
    const script = ruleGenerate(analysis, product);
    expect(() => mockRewriteShot(product, script, 99)).toThrow();
  });
});
