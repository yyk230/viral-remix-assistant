import { describe, expect, it } from "vitest";
import { checkOriginality, normalizeForCompare, originalitySummary } from "@/lib/originality";
import type { Script } from "@/lib/types";

const reference = "千万别在下午四点以后来买我家的海盐碱水包。不是因为不好吃，是因为根本买不到。";

function scriptWith(line: string, onScreenText = ""): Script {
  return {
    titleOptions: ["标题"],
    shots: [
      { index: 1, segmentRole: "hook", durationSec: 3, visual: "v", shooting: "s", line, onScreenText },
      { index: 2, segmentRole: "cta", durationSec: 3, visual: "v", shooting: "s", line: "完全原创的一句话", onScreenText: "" },
    ],
    shootingChecklist: ["x"],
  };
}

describe("checkOriginality", () => {
  it("照抄 8 个字命中", () => {
    const result = checkOriginality(reference, scriptWith("我觉得根本买不到是因为太火了"));
    expect(result.hits).toEqual([]);
    const hit = checkOriginality(reference, scriptWith("我家的海盐碱水包真的好"));
    expect(hit.hits).toEqual([{ shotIndex: 1, field: "line", fragment: "我家的海盐碱水包" }]);
    expect(hit.hitShotCount).toBe(1);
  });

  it("7 个字不命中", () => {
    expect(checkOriginality(reference, scriptWith("家的海盐碱水包")).hits).toEqual([]);
  });

  it("夹杂标点和空白时照样命中", () => {
    const result = checkOriginality(reference, scriptWith("我家的，海盐 碱水包！"));
    expect(result.hits).toHaveLength(1);
  });

  it("「旁白：」前缀不影响判断", () => {
    expect(checkOriginality("旁白：今天天气很好啊我们出去", scriptWith("旁白：完全不同")).hits).toEqual([]);
    expect(checkOriginality(reference, scriptWith("旁白：我家的海盐碱水包")).hits).toHaveLength(1);
  });

  it("花字同样检查，同一镜多处命中只计一个镜头", () => {
    const result = checkOriginality(reference, scriptWith("我家的海盐碱水包", "千万别在下午四点以后"));
    expect(result.hits.map((h) => h.field)).toEqual(["line", "onScreenText"]);
    expect(result.hitShotCount).toBe(1);
  });

  it("改写后不命中", () => {
    expect(checkOriginality(reference, scriptWith("傍晚来店里，碱水包大概率已经卖完了")).hits).toEqual([]);
  });
});

describe("辅助函数", () => {
  it("归一化去掉标点、符号、空白并转小写", () => {
    expect(normalizeForCompare("A b，C！+ 中")).toBe("abc中");
  });

  it("汇总文案", () => {
    expect(originalitySummary({ hits: [], hitShotCount: 0 })).toBe("未发现照抄参考原句");
    expect(originalitySummary({ hits: [], hitShotCount: 2 })).toBe("2 个镜头与参考原句重复，建议改写");
  });
});
