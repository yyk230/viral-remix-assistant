import { describe, expect, it } from "vitest";
import { detectHookType, ruleAnalyze, splitSentences } from "@/lib/mock/analyze";

const custom =
  "你还在为早餐发愁吗？很多人早上来不及做饭。我们的三明治十分钟就能做好。用的是当天的新鲜面包。顾客都说味道很好。喜欢的话记得点赞关注。";

describe("ruleAnalyze", () => {
  it("首句为 hook，含行动号召关键词的末句为 cta", () => {
    const result = ruleAnalyze(custom);
    expect(result.segments[0]).toMatchObject({ role: "hook", originalText: "你还在为早餐发愁吗？" });
    expect(result.hookText).toBe("你还在为早餐发愁吗？");
    expect(result.segments.at(-1)).toMatchObject({ role: "cta", originalText: "喜欢的话记得点赞关注。" });
    expect(result.segments.map((s) => s.role)).toEqual(["hook", "pain", "show", "proof", "cta"]);
  });

  it("中间句子尽量平均分成 3 组（4 句分成 2、1、1）", () => {
    const result = ruleAnalyze(custom);
    expect(result.segments[1].originalText).toBe("很多人早上来不及做饭。我们的三明治十分钟就能做好。");
    expect(result.segments[2].originalText).toBe("用的是当天的新鲜面包。");
  });

  it("末句不含行动号召关键词时没有 cta", () => {
    const result = ruleAnalyze("今天介绍一款面包。它很好吃，口感松软，价格也实惠，适合当早餐，大家可以试试看。");
    expect(result.segments.map((s) => s.role)).toEqual(["hook", "pain"]);
  });

  it("只有一句话也能得到至少 2 段", () => {
    const byComma = ruleAnalyze("这是一段没有句号的很长的文案，用来测试逗号切分是否正常工作的情况");
    expect(byComma.segments.length).toBeGreaterThanOrEqual(2);
    const noPunctuation = ruleAnalyze("这是一段完全没有任何标点符号的很长很长的文案用来测试对半切分的逻辑");
    expect(noPunctuation.segments).toHaveLength(2);
  });

  it("时间轴从 0 开始，连续递增", () => {
    const { segments, summary } = ruleAnalyze(custom);
    expect(segments[0].startSec).toBe(0);
    for (let i = 0; i < segments.length; i++) {
      expect(segments[i].endSec).toBeGreaterThan(segments[i].startSec);
      if (i > 0) expect(segments[i].startSec).toBe(segments[i - 1].endSec);
    }
    expect(summary).toContain(`约${segments.at(-1)!.endSec}秒`);
  });
});

describe("detectHookType", () => {
  it("按顺序判断 4 种钩子类型", () => {
    expect(detectHookType("千万别在晚上买面包，3 个原因")).toBe("反常识/警告");
    expect(detectHookType("小个子能穿阔腿裤？")).toBe("提问式");
    expect(detectHookType("为什么大家都爱这家店")).toBe("提问式");
    expect(detectHookType("9 块 9 解决了我的难题")).toBe("数字冲击");
    expect(detectHookType("九块九解决了我的难题")).toBe("数字冲击");
    expect(detectHookType("今天带大家逛逛我的小店")).toBe("直接展示");
    expect(detectHookType("今天给大家介绍一款好用的产品")).toBe("直接展示");
    expect(detectHookType("一万个人里只有一个能做到")).toBe("数字冲击");
  });
});

describe("splitSentences", () => {
  it("按中英文句末标点和换行切分，保留标点", () => {
    expect(splitSentences("第一句。第二句！\n第三句?第四句")).toEqual(["第一句。", "第二句！", "第三句?", "第四句"]);
  });
});
