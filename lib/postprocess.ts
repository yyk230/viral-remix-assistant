import { allocateDurations } from "./durations";
import type { Analysis, Script, Shot } from "./types";

export const OUTPUT_LIMITS = {
  segments: 10,
  patterns: 6,
  titles: 3,
  shots: 12,
  checklist: 10,
} as const;

export function normalizeAnalysis(analysis: Analysis): Analysis {
  const segments = [...analysis.segments]
    .sort((a, b) => a.startSec - b.startSec)
    .slice(0, OUTPUT_LIMITS.segments);
  return {
    ...analysis,
    segments,
    reusablePatterns: analysis.reusablePatterns.slice(0, OUTPUT_LIMITS.patterns),
    nonCopyable: analysis.nonCopyable.slice(0, OUTPUT_LIMITS.patterns),
  };
}

export function normalizeScript(script: Script, targetDurationSec: number): Script {
  const shots = script.shots.slice(0, OUTPUT_LIMITS.shots);
  const current = shots.map((s) => s.durationSec);
  const alreadyValid =
    current.every((d) => Number.isInteger(d) && d >= 1) &&
    current.reduce((a, b) => a + b, 0) === targetDurationSec;
  const durations = alreadyValid ? current : allocateDurations(current, targetDurationSec);

  return {
    titleOptions: script.titleOptions.slice(0, OUTPUT_LIMITS.titles),
    shots: shots.map((shot, i) => ({ ...shot, index: i + 1, durationSec: durations[i] })),
    shootingChecklist: script.shootingChecklist.slice(0, OUTPUT_LIMITS.checklist),
  };
}

export function normalizeRewrittenShot(shot: Shot, original: Shot): Shot {
  return {
    ...shot,
    index: original.index,
    segmentRole: original.segmentRole,
    durationSec: original.durationSec,
  };
}
