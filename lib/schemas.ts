import { z } from "zod";
import {
  INPUT_LIMITS,
  SEGMENT_ROLES,
  STYLES,
  type Analysis,
  type ProductInput,
  type Script,
  type SegmentRole,
  type Shot,
} from "./types";

z.config(z.locales.zhCN());

// ---- 模型输出：宽进严出，只校验类型、必填和数组最小长度 ----

const text = z.string().trim().min(1);

const segmentRole = z.preprocess(
  (v) => (typeof v === "string" && (SEGMENT_ROLES as readonly string[]).includes(v) ? v : "other"),
  z.enum(SEGMENT_ROLES),
) as z.ZodType<SegmentRole>;

export const segmentSchema = z.object({
  role: segmentRole,
  label: text,
  startSec: z.coerce.number().nonnegative(),
  endSec: z.coerce.number().nonnegative(),
  originalText: text,
  purpose: text,
  shotType: text,
});

export const analysisSchema: z.ZodType<Analysis> = z.object({
  summary: text,
  hookType: text,
  hookText: text,
  segments: z.array(segmentSchema).min(2),
  reusablePatterns: z.array(text).min(1),
  nonCopyable: z.array(text).min(1),
});

export const shotSchema: z.ZodType<Shot> = z.object({
  index: z.coerce.number().int().positive(),
  segmentRole: segmentRole,
  durationSec: z.coerce.number().positive(),
  visual: text,
  shooting: text,
  line: text,
  onScreenText: z.string().trim().default(""),
});

export const scriptSchema: z.ZodType<Script> = z.object({
  titleOptions: z.array(text).min(1),
  shots: z.array(shotSchema).min(2),
  shootingChecklist: z.array(text).min(1),
});

// ---- 用户输入：严格校验 ----

export const referenceTextSchema = z
  .string()
  .trim()
  .min(INPUT_LIMITS.referenceMin, `参考文案至少 ${INPUT_LIMITS.referenceMin} 字`)
  .max(INPUT_LIMITS.referenceMax, `参考文案最多 ${INPUT_LIMITS.referenceMax} 字`);

export const productInputSchema: z.ZodType<ProductInput> = z.object({
  name: z
    .string()
    .trim()
    .min(1, "请填写产品名")
    .max(INPUT_LIMITS.name, `产品名最多 ${INPUT_LIMITS.name} 字`),
  sellingPoints: z
    .array(
      z
        .string()
        .trim()
        .min(1, "卖点不能为空")
        .max(INPUT_LIMITS.sellingPoint, `每条卖点最多 ${INPUT_LIMITS.sellingPoint} 字`),
    )
    .min(1, "至少填写 1 条卖点")
    .max(INPUT_LIMITS.sellingPointsMax, `最多 ${INPUT_LIMITS.sellingPointsMax} 条卖点`),
  audience: z
    .string()
    .trim()
    .min(1, "请填写目标人群")
    .max(INPUT_LIMITS.audience, `目标人群最多 ${INPUT_LIMITS.audience} 字`),
  style: z.enum(STYLES),
  solo: z.boolean(),
  onCamera: z.boolean(),
  location: z
    .string()
    .trim()
    .min(1, "请填写拍摄场地")
    .max(INPUT_LIMITS.location, `拍摄场地最多 ${INPUT_LIMITS.location} 字`),
  targetDurationSec: z.union([z.literal(15), z.literal(30), z.literal(60)]),
});

export const analyzeRequestSchema = z.object({
  referenceText: referenceTextSchema,
});

export const generateRequestSchema = z.object({
  referenceText: referenceTextSchema,
  analysis: analysisSchema,
  product: productInputSchema,
});

export const rewriteRequestSchema = z.object({
  referenceText: referenceTextSchema,
  analysis: analysisSchema,
  product: productInputSchema,
  script: scriptSchema,
  shotIndex: z.number().int().positive(),
  instruction: z
    .string()
    .trim()
    .max(INPUT_LIMITS.instruction, `修改要求最多 ${INPUT_LIMITS.instruction} 字`)
    .optional(),
});
