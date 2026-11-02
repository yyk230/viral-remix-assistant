/**
 * 每镜先分 1 秒，剩余秒数按权重用最大余数法分配。
 * 要求 weights.length <= total（最多 12 镜、最短 15 秒，必然满足）。
 */
export function allocateDurations(weights: number[], total: number): number[] {
  const n = weights.length;
  if (n === 0) return [];
  if (n > total) {
    throw new Error(`镜头数 ${n} 超过总时长 ${total} 秒，无法保证每镜至少 1 秒`);
  }

  const safeWeights = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 1));
  const weightSum = safeWeights.reduce((a, b) => a + b, 0);
  const remaining = total - n;

  const raw = safeWeights.map((w) => (w / weightSum) * remaining);
  const result = raw.map(Math.floor);
  const leftover = remaining - result.reduce((a, b) => a + b, 0);

  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; k < leftover; k++) {
    result[order[k].i] += 1;
  }

  return result.map((d) => d + 1);
}
