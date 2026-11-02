import type { SegmentRole } from "@/lib/types";

export const ROLE_CHIP_CLASS: Record<SegmentRole, string> = {
  hook: "bg-rose-100 text-rose-700",
  pain: "bg-amber-100 text-amber-700",
  show: "bg-sky-100 text-sky-700",
  proof: "bg-emerald-100 text-emerald-700",
  cta: "bg-violet-100 text-violet-700",
  other: "bg-slate-100 text-slate-600",
};
