import type { ChatMessage } from "./llm";
import type { Analysis, ProductInput, Script } from "./types";

const ROLE_ENUM = "hook（钩子）| pain（痛点）| show（展示）| proof（信任）| cta（行动号召）| other（其他）";

const COMMON_RULES = "只输出一个 JSON 对象，不要输出任何其他文字、解释或 Markdown 代码块标记。";

function describeProduct(product: ProductInput): string {
  return [
    `产品名：${product.name}`,
    `卖点：${product.sellingPoints.join("；")}`,
    `目标人群：${product.audience}`,
    `风格：${product.style}`,
    `拍摄条件：${product.solo ? "一个人拍" : "有人帮忙拍"}，${product.onCamera ? "本人出镜" : "本人不出镜"}，场地为「${product.location}」`,
    `目标时长：${product.targetDurationSec} 秒`,
  ].join("\n");
}

const SHOT_FIELDS = `{
  "index": 1,
  "segmentRole": "hook",
  "durationSec": 3,
  "visual": "画面内容",
  "shooting": "景别、运镜和拍摄提示",
  "line": "台词或旁白",
  "onScreenText": "画面花字，可为空字符串"
}`;

const SHOOTING_RULES = (product: ProductInput) =>
  [
    product.solo
      ? "- 一个人拍：shooting 只能使用「手机固定在三脚架」或「单手手持」两种方式。"
      : "- 有人帮忙拍：可以使用跟拍、推拉等运镜。",
    product.onCamera
      ? "- 本人出镜：line 是出镜口播。"
      : "- 本人不出镜：line 必须以「旁白：」开头，visual 以手部操作和产品特写为主，不出现人脸。",
  ].join("\n");

export function buildAnalyzeMessages(referenceText: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: `你是资深短视频编导，擅长拆解爆款短视频的结构。请拆解用户给出的参考视频口播文案，${COMMON_RULES}

JSON 结构：
{
  "summary": "一句话总结这条视频的结构套路",
  "hookType": "钩子类型",
  "hookText": "原文的开头句",
  "segments": [
    {
      "role": "${ROLE_ENUM} 中的一个英文值",
      "label": "这一段的小标题",
      "startSec": 0,
      "endSec": 4,
      "originalText": "这一段对应的原文",
      "purpose": "这一段在结构中的作用",
      "shotType": "建议的镜头类型"
    }
  ],
  "reusablePatterns": ["结构层面可以复用的套路"],
  "nonCopyable": ["原作者特有、不能照搬的内容"]
}

要求：
- segments 分成 3 到 8 段，按原文顺序排列，originalText 必须摘自原文。
- 按约 4.5 字/秒估算每段的起止秒数。
- hookType 优先从以下取值中选择：提问式、数字冲击、反常识/警告、悬念、对比反差、痛点共鸣、直接展示。
- reusablePatterns 写结构层面的套路（例如「开头 3 秒用反问制造冲突」），不要写具体台词。
- nonCopyable 写原作者特有的内容，例如具体台词、人设、独家素材。`,
    },
    { role: "user", content: `参考文案：\n${referenceText}` },
  ];
}

export function buildGenerateMessages(
  referenceText: string,
  analysis: Analysis,
  product: ProductInput,
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `你是短视频编导，负责把爆款视频的「结构」迁移到用户自己的产品上，生成可以直接照着拍的分镜脚本。${COMMON_RULES}

JSON 结构：
{
  "titleOptions": ["标题 1", "标题 2", "标题 3"],
  "shots": [${SHOT_FIELDS}],
  "shootingChecklist": ["拍摄前需要准备的场地、道具等"]
}

要求：
- 按拆解结果的结构顺序生成 4 到 10 个镜头，segmentRole 取 ${ROLE_ENUM} 中的英文值，并与对应的结构段落一致。
- 所有镜头的 durationSec 之和尽量接近目标时长。
- 必须满足拍摄条件：
${SHOOTING_RULES(product)}
- 台词口语化，符合所选风格，围绕产品卖点展开。
- 只迁移结构，禁止复用参考文案中连续 8 个字及以上的原句。
- 生成 3 个标题备选和 4 到 8 条拍摄清单。`,
    },
    {
      role: "user",
      content: `参考文案：\n${referenceText}\n\n拆解结果：\n${JSON.stringify(analysis)}\n\n我的产品：\n${describeProduct(product)}`,
    },
  ];
}

export function buildRewriteMessages(
  referenceText: string,
  analysis: Analysis,
  product: ProductInput,
  script: Script,
  shotIndex: number,
  instruction?: string,
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `你是短视频编导，负责重写分镜脚本中的某一个镜头。${COMMON_RULES}

JSON 结构（只返回这一个镜头对象，不要包裹在其他字段里）：
${SHOT_FIELDS}

要求：
- 只重写指定的镜头，保持它的 index、segmentRole 和 durationSec 不变。
- 必须满足拍摄条件：
${SHOOTING_RULES(product)}
- 只迁移结构，禁止复用参考文案中连续 8 个字及以上的原句。
- ${instruction ? "按用户的修改要求重写。" : "用户没有给出修改要求，请换一种写法。"}`,
    },
    {
      role: "user",
      content: `参考文案：\n${referenceText}\n\n拆解结果：\n${JSON.stringify(analysis)}\n\n我的产品：\n${describeProduct(product)}\n\n完整脚本：\n${JSON.stringify(script)}\n\n要重写的镜号：${shotIndex}${instruction ? `\n修改要求：${instruction}` : ""}`,
    },
  ];
}
