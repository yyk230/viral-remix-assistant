import type { SegmentRole } from "./types";

export const ROLE_LABELS: Record<SegmentRole, string> = {
  hook: "钩子",
  pain: "痛点",
  show: "展示",
  proof: "信任",
  cta: "行动号召",
  other: "其他",
};

export const ORIGINALITY_FIELD_LABELS = {
  line: "台词",
  onScreenText: "花字",
} as const;
