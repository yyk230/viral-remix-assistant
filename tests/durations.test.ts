import { describe, expect, it } from "vitest";
import { allocateDurations } from "@/lib/durations";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("allocateDurations", () => {
  const weightSets = [
    [1, 1, 1],
    [5, 4, 8, 8, 9, 7],
    [0, 3, -2, 10],
    [100, 1, 1, 1, 1],
    [2.5, 3.7, 1.1],
  ];

  for (const total of [15, 30, 60]) {
    for (const weights of weightSets) {
      it(`总时长 ${total} 秒、权重 ${JSON.stringify(weights)}`, () => {
        const result = allocateDurations(weights, total);
        expect(result).toHaveLength(weights.length);
        expect(sum(result)).toBe(total);
        expect(result.every((d) => Number.isInteger(d) && d >= 1)).toBe(true);
      });
    }
  }

  it("12 个镜头分配 15 秒", () => {
    const result = allocateDurations([9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 15);
    expect(sum(result)).toBe(15);
    expect(Math.min(...result)).toBe(1);
  });

  it("按权重比例分配", () => {
    expect(allocateDurations([1, 3], 10)).toEqual([3, 7]);
  });

  it("镜头数超过总时长时抛出异常", () => {
    expect(() => allocateDurations(new Array(16).fill(1), 15)).toThrow();
  });
});
