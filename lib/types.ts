export type Source = "llm" | "mock";
export type FallbackReason = "not_configured" | "llm_error";

export const SEGMENT_ROLES = ["hook", "pain", "show", "proof", "cta", "other"] as const;
export type SegmentRole = (typeof SEGMENT_ROLES)[number];

export const STYLES = ["真实亲切", "专业测评", "搞笑反转", "温馨治愈"] as const;
export type Style = (typeof STYLES)[number];

export const TARGET_DURATIONS = [15, 30, 60] as const;
export type TargetDuration = (typeof TARGET_DURATIONS)[number];

export const INPUT_LIMITS = {
  referenceMin: 30,
  referenceMax: 2000,
  name: 20,
  sellingPoint: 30,
  sellingPointsMax: 3,
  audience: 30,
  location: 20,
  instruction: 50,
} as const;

export interface Segment {
  role: SegmentRole;
  label: string;
  startSec: number;
  endSec: number;
  originalText: string;
  purpose: string;
  shotType: string;
}

export interface Analysis {
  summary: string;
  hookType: string;
  hookText: string;
  segments: Segment[];
  reusablePatterns: string[];
  nonCopyable: string[];
}

export interface ProductInput {
  name: string;
  sellingPoints: string[];
  audience: string;
  style: Style;
  solo: boolean;
  onCamera: boolean;
  location: string;
  targetDurationSec: TargetDuration;
}

export interface Shot {
  index: number;
  segmentRole: SegmentRole;
  durationSec: number;
  visual: string;
  shooting: string;
  line: string;
  onScreenText: string;
}

export interface Script {
  titleOptions: string[];
  shots: Shot[];
  shootingChecklist: string[];
}

export interface ResultMeta {
  source: Source;
  fallbackReason?: FallbackReason;
}

export interface ApiResult<T> extends ResultMeta {
  data: T;
}
