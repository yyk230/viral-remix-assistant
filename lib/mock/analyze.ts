import { ROLE_LABELS } from "../labels";
import { findSampleByText } from "../samples";
import type { Analysis, Segment, SegmentRole } from "../types";

const CTA_WORDS = ["关注", "评论", "下单", "链接", "私信", "来店", "点赞", "收藏"];
const CHARS_PER_SEC = 4.5;

const ROLE_PRESETS: Record<SegmentRole, { purpose: string; shotType: string; pattern: string }> = {
  hook: {
    purpose: "开头 3 秒抓住注意力，让观众停下来",
    shotType: "产品或人物特写 + 大字花字",
    pattern: "",
  },
  pain: {
    purpose: "说出观众的困扰或顾虑，引发共鸣",
    shotType: "还原问题场景的近景",
    pattern: "钩子之后先讲观众的困扰，再引出产品",
  },
  show: {
    purpose: "展示产品如何解决问题，给出具体细节",
    shotType: "产品细节特写或使用过程",
    pattern: "用具体细节和画面展示产品，而不是空喊卖点",
  },
  proof: {
    purpose: "用口碑、数据或效果建立信任",
    shotType: "效果展示或顾客反馈画面",
    pattern: "在行动号召之前放一段信任背书",
  },
  cta: {
    purpose: "告诉观众下一步做什么，引导互动或购买",
    shotType: "产品全景 + 引导花字",
    pattern: "结尾给出明确且低门槛的行动指令",
  },
  other: {
    purpose: "补充信息，衔接上下文",
    shotType: "过渡镜头",
    pattern: "",
  },
};

const HOOK_PATTERNS: Record<string, string> = {
  "反常识/警告": "开头用「千万别 / 不要」这类反常识的劝退句制造好奇",
  提问式: "开头直接抛出目标人群最关心的问题",
  数字冲击: "开头用具体数字制造反差和冲击",
  直接展示: "开头直接展示产品或结果，用画面抓住注意力",
};

export function splitSentences(text: string): string[] {
  const sentences = (text.match(/[^。！？；!?;\n]+[。！？；!?;]*/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length >= 2) return sentences;

  const single = sentences[0] ?? text.trim();
  const clauses = (single.match(/[^，,]+[，,]*/g) ?? []).map((s) => s.trim()).filter(Boolean);
  if (clauses.length >= 2) return clauses;

  const mid = Math.ceil(single.length / 2);
  return [single.slice(0, mid), single.slice(mid)];
}

export function detectHookType(firstSentence: string): string {
  if (/千万别|不要|别再/.test(firstSentence)) return "反常识/警告";
  if (/[？?]\s*$/.test(firstSentence) || /吗|为什么|怎么/.test(firstSentence)) return "提问式";
  // 「一」常作量词（一款、一下），单独出现不算数字
  if (/[0-9]|[二三四五六七八九十百千万]|一[十百千万]/.test(firstSentence)) return "数字冲击";
  return "直接展示";
}

function splitEvenly<T>(items: T[], groups: number): T[][] {
  const base = Math.floor(items.length / groups);
  const extra = items.length % groups;
  const result: T[][] = [];
  let cursor = 0;
  for (let i = 0; i < groups; i++) {
    const size = base + (i < extra ? 1 : 0);
    result.push(items.slice(cursor, cursor + size));
    cursor += size;
  }
  return result;
}

export function ruleAnalyze(text: string): Analysis {
  const sentences = splitSentences(text.trim());
  const [first, ...rest] = sentences;

  const parts: { role: SegmentRole; text: string }[] = [{ role: "hook", text: first }];

  let ctaText: string | undefined;
  const last = rest[rest.length - 1];
  if (last && CTA_WORDS.some((w) => last.includes(w))) {
    ctaText = rest.pop();
  }

  const middleRoles: SegmentRole[] = ["pain", "show", "proof"];
  splitEvenly(rest, 3).forEach((group, i) => {
    if (group.length > 0) parts.push({ role: middleRoles[i], text: group.join("") });
  });
  if (ctaText) parts.push({ role: "cta", text: ctaText });

  let cursor = 0;
  const segments: Segment[] = parts.map(({ role, text: originalText }) => {
    const duration = Math.max(1, Math.ceil(originalText.length / CHARS_PER_SEC));
    const segment: Segment = {
      role,
      label: ROLE_LABELS[role],
      startSec: cursor,
      endSec: cursor + duration,
      originalText,
      purpose: ROLE_PRESETS[role].purpose,
      shotType: ROLE_PRESETS[role].shotType,
    };
    cursor += duration;
    return segment;
  });

  const hookType = detectHookType(first);
  const reusablePatterns = [
    HOOK_PATTERNS[hookType],
    ...segments.map((s) => ROLE_PRESETS[s.role].pattern),
  ].filter(Boolean);

  return {
    summary: `以${hookType}开头、共${segments.length}段、约${cursor}秒的口播视频`,
    hookType,
    hookText: first,
    segments,
    reusablePatterns,
    nonCopyable: ["原视频的具体台词和口头禅", "原作者的人设和出镜形象", "原视频的独家画面和音乐"],
  };
}

export function mockAnalyze(text: string): Analysis {
  const sample = findSampleByText(text);
  if (sample) return structuredClone(sample.analysis);
  return ruleAnalyze(text);
}
