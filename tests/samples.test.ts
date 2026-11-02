import { describe, expect, it } from "vitest";
import { mockAnalyze } from "@/lib/mock/analyze";
import { mockGenerate } from "@/lib/mock/generate";
import { checkOriginality } from "@/lib/originality";
import { analysisSchema, productInputSchema, scriptSchema } from "@/lib/schemas";
import { DEFAULT_PRODUCT, SAMPLES } from "@/lib/samples";

describe("内置示例", () => {
  it("DEFAULT_PRODUCT 能通过用户输入校验", () => {
    expect(productInputSchema.safeParse(DEFAULT_PRODUCT).success).toBe(true);
  });

  for (const sample of SAMPLES) {
    describe(sample.title, () => {
      it("文案 150 到 250 字", () => {
        expect(sample.text.length).toBeGreaterThanOrEqual(150);
        expect(sample.text.length).toBeLessThanOrEqual(250);
      });

      it("手写拆解和手写脚本通过 zod 校验", () => {
        expect(analysisSchema.safeParse(sample.analysis).success).toBe(true);
        expect(scriptSchema.safeParse(sample.script).success).toBe(true);
      });

      it("脚本总时长 30 秒、5 到 8 镜，角色顺序与拆解一致", () => {
        const { shots } = sample.script;
        expect(shots.reduce((a, s) => a + s.durationSec, 0)).toBe(30);
        expect(shots.length).toBeGreaterThanOrEqual(5);
        expect(shots.length).toBeLessThanOrEqual(8);
        expect(shots.map((s) => s.segmentRole)).toEqual(sample.analysis.segments.map((s) => s.role));
        expect(shots.map((s) => s.index)).toEqual(shots.map((_, i) => i + 1));
      });

      it("满足一个人拍、不出镜的约束", () => {
        for (const shot of sample.script.shots) {
          expect(shot.shooting).toMatch(/^(手机固定在三脚架|单手手持)/);
          expect(shot.line.startsWith("旁白：")).toBe(true);
        }
      });

      it("原创性检查没有命中", () => {
        expect(checkOriginality(sample.text, sample.script).hits).toEqual([]);
      });

      it("经过 zod 解析后的拆解仍能命中手写脚本；时长改为 15 秒则走规则生成", () => {
        const analysis = analysisSchema.parse(mockAnalyze(sample.text));
        expect(mockGenerate(sample.text, analysis, DEFAULT_PRODUCT)).toEqual(sample.script);

        const ruleScript = mockGenerate(sample.text, analysis, { ...DEFAULT_PRODUCT, targetDurationSec: 15 });
        expect(ruleScript).not.toEqual(sample.script);
      });

      it("拆解与手写拆解不一致时不返回手写脚本", () => {
        const changed = { ...sample.analysis, summary: "来自真实模型的不同总结" };
        expect(mockGenerate(sample.text, changed, DEFAULT_PRODUCT)).not.toEqual(sample.script);
      });
    });
  }
});
