import type { Script } from "./types";

export const ORIGINALITY_THRESHOLD = 8;

export type OriginalityField = "line" | "onScreenText";

export interface OriginalityHit {
  shotIndex: number;
  field: OriginalityField;
  fragment: string;
}

export interface OriginalityResult {
  hits: OriginalityHit[];
  hitShotCount: number;
}

export function normalizeForCompare(text: string): string {
  return text.replace(/[\p{P}\p{S}\s]/gu, "").toLowerCase();
}

export function longestCommonSubstring(a: string, b: string): string {
  if (!a || !b) return "";
  let prev = new Array<number>(b.length + 1).fill(0);
  let bestLen = 0;
  let bestEnd = 0;
  for (let i = 1; i <= a.length; i++) {
    const curr = new Array<number>(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1;
        if (curr[j] > bestLen) {
          bestLen = curr[j];
          bestEnd = i;
        }
      }
    }
    prev = curr;
  }
  return a.slice(bestEnd - bestLen, bestEnd);
}

export function checkOriginality(referenceText: string, script: Script): OriginalityResult {
  const reference = normalizeForCompare(referenceText);
  const hits: OriginalityHit[] = [];

  for (const shot of script.shots) {
    const fields: [OriginalityField, string][] = [
      ["line", shot.line.replace(/^\s*旁白[:：]\s*/, "")],
      ["onScreenText", shot.onScreenText],
    ];
    for (const [field, value] of fields) {
      const fragment = longestCommonSubstring(normalizeForCompare(value), reference);
      if (fragment.length >= ORIGINALITY_THRESHOLD) {
        hits.push({ shotIndex: shot.index, field, fragment });
      }
    }
  }

  return { hits, hitShotCount: new Set(hits.map((h) => h.shotIndex)).size };
}

export function originalitySummary(result: OriginalityResult): string {
  return result.hitShotCount === 0
    ? "未发现照抄参考原句"
    : `${result.hitShotCount} 个镜头与参考原句重复，建议改写`;
}
