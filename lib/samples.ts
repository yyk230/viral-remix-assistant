import type { Analysis, ProductInput, Script, Segment } from "./types";

export interface Sample {
  id: string;
  title: string;
  text: string;
  analysis: Analysis;
  script: Script;
}

export const DEFAULT_PRODUCT: ProductInput = {
  name: "低糖全麦贝果",
  sellingPoints: ["0 蔗糖", "每天早上现烤", "6 种口味"],
  audience: "控糖的上班族",
  style: "真实亲切",
  solo: true,
  onCamera: false,
  location: "店内操作台",
  targetDurationSec: 30,
};

const COMMON_CHECKLIST_HEAD = ["场地：店内操作台", "产品：低糖全麦贝果（准备 2 份，一份完整、一份切开）"];

// ---------- 示例 1：烘焙新品（反常识/警告式） ----------

const bakerySegments: Segment[] = [
  {
    role: "hook",
    label: "反向劝退开场",
    startSec: 0,
    endSec: 5,
    originalText: "千万别在下午四点以后来买我家的海盐碱水包。",
    purpose: "用反常识的劝退句制造好奇，让人停下来想知道原因",
    shotType: "产品特写 + 大字花字",
  },
  {
    role: "pain",
    label: "反转揭晓：稀缺感",
    startSec: 5,
    endSec: 9,
    originalText: "不是因为不好吃，是因为根本买不到。",
    purpose: "立刻反转，把「劝退」变成「抢手」的稀缺信号",
    shotType: "空货架或最后几个面包的画面",
  },
  {
    role: "show",
    label: "制作工艺",
    startSec: 9,
    endSec: 17,
    originalText: "每天早上六点开始揉面，一炉只出二十个，表皮要刷三遍碱水才会有这种深棕色。",
    purpose: "用具体的时间、数量和工序展示用心，数字让信息更可信",
    shotType: "手部揉面、刷碱水的过程镜头",
  },
  {
    role: "show",
    label: "口感特写",
    startSec: 17,
    endSec: 25,
    originalText: "你看这个切面，组织是紧实有嚼劲的，咬下去先是海盐的咸香，然后是麦子的回甘。",
    purpose: "用切面画面和咀嚼描述调动食欲",
    shotType: "切面微距 + 掰开展示",
  },
  {
    role: "proof",
    label: "口碑与现做背书",
    startSec: 25,
    endSec: 34,
    originalText: "很多老顾客说，这是他们吃过最像德国那边的味道。我们没有中央工厂，所有面包都是店里现做的。",
    purpose: "借老顾客评价和「店里现做」强调品质",
    shotType: "顾客取货或店内全景",
  },
  {
    role: "cta",
    label: "留货引导互动",
    startSec: 34,
    endSec: 41,
    originalText: "想吃的话，建议上午来，或者评论区告诉我你想要几个，我帮你留。",
    purpose: "给出到店时间和评论留货两种行动，同时拉高评论互动",
    shotType: "打包装袋特写 + 引导花字",
  },
];

const bakeryScript: Script = {
  titleOptions: [
    "控糖也能吃的贝果，0 蔗糖每天现烤",
    "贝果别乱买，先看配料表第二位",
    "上班族早餐：低糖全麦贝果 6 种口味",
  ],
  shots: [
    {
      index: 1,
      segmentRole: "hook",
      durationSec: 3,
      visual: "操作台上一排刚出炉的贝果，镜头慢慢推近",
      shooting: "手机固定在三脚架，俯拍中景缓慢推近",
      line: "旁白：控糖的朋友，先别急着买贝果。",
      onScreenText: "控糖的先别急着买贝果",
    },
    {
      index: 2,
      segmentRole: "pain",
      durationSec: 3,
      visual: "手拿起一个普通甜贝果，翻过来露出配料表",
      shooting: "单手手持，近景对准配料表",
      line: "旁白：很多贝果配料表第二位就是白砂糖。",
      onScreenText: "配料表第二位＝白砂糖？",
    },
    {
      index: 3,
      segmentRole: "show",
      durationSec: 6,
      visual: "双手揉全麦面团、分割整形，放进烤箱",
      shooting: "手机固定在三脚架，俯拍手部特写",
      line: "旁白：我们家的低糖全麦贝果，0 蔗糖，每天早上现烤，出炉就上架。",
      onScreenText: "0 蔗糖 · 每天早上现烤",
    },
    {
      index: 4,
      segmentRole: "show",
      durationSec: 7,
      visual: "刀切开贝果，双手掰开展示扎实的切面",
      shooting: "单手手持，微距贴近切面",
      line: "旁白：切开看，组织很扎实，嚼起来是全麦本身的麦香，不靠糖撑味道。",
      onScreenText: "嚼得到麦香",
    },
    {
      index: 5,
      segmentRole: "proof",
      durationSec: 5,
      visual: "6 种口味的贝果在托盘上一字排开",
      shooting: "手机固定在三脚架，平拍横移",
      line: "旁白：附近写字楼的回头客最多，原味、黑芝麻、蔓越莓，6 种口味轮着吃。",
      onScreenText: "回头客最多 · 6 种口味",
    },
    {
      index: 6,
      segmentRole: "cta",
      durationSec: 6,
      visual: "把贝果装进纸袋，封口贴上店标",
      shooting: "手机固定在三脚架，近景",
      line: "旁白：想试试的话评论区说口味，我明早给你留一个。",
      onScreenText: "评论区说口味 · 明早留货",
    },
  ],
  shootingChecklist: [
    ...COMMON_CHECKLIST_HEAD,
    "6 种口味各 1 个，用于横移镜头",
    "一个普通甜贝果和它的配料表（对比用）",
    "手机三脚架",
    "纸袋和店标贴纸",
  ],
};

// ---------- 示例 2：服装穿搭（提问式） ----------

const fashionSegments: Segment[] = [
  {
    role: "hook",
    label: "身材疑问开场",
    startSec: 0,
    endSec: 4,
    originalText: "一米五五的女生，真的穿不了阔腿裤吗？",
    purpose: "直接点名目标人群，抛出她们最在意的问题",
    shotType: "全身镜前站定，正面全景",
  },
  {
    role: "pain",
    label: "共鸣与承诺",
    startSec: 4,
    endSec: 9,
    originalText: "我以前也这么觉得，直到我试了这三个方法。",
    purpose: "先认同观众的顾虑，再承诺给出数量明确的解决方法",
    shotType: "半身近景，对镜头说话",
  },
  {
    role: "show",
    label: "方法一：裤长",
    startSec: 9,
    endSec: 16,
    originalText: "第一，裤长一定要盖住鞋面，只露出一点点鞋尖，腿立刻长了五厘米。",
    purpose: "给出可以照做的细节和量化效果",
    shotType: "裤脚和鞋面的特写",
  },
  {
    role: "show",
    label: "方法二：腰线",
    startSec: 16,
    endSec: 22,
    originalText: "第二，上衣选短款，或者把衣角塞进去，让腰线往上提。",
    purpose: "用一个简单动作展示改变比例的方法",
    shotType: "塞衣角的动作特写",
  },
  {
    role: "show",
    label: "方法三：同色系",
    startSec: 22,
    endSec: 28,
    originalText: "第三，鞋子选和裤子同色系的，视觉上是一整条线。",
    purpose: "补充第三个方法，凑成完整的「三步法」",
    shotType: "从鞋到裤的竖向摇镜",
  },
  {
    role: "proof",
    label: "上身效果验证",
    startSec: 28,
    endSec: 34,
    originalText: "你看我现在这一身，是不是完全看不出只有一米五五？",
    purpose: "用上身效果回应开头的问题，证明方法有效",
    shotType: "全身转身展示",
  },
  {
    role: "cta",
    label: "引导到店与收藏",
    startSec: 34,
    endSec: 43,
    originalText: "同款裤子我放在橱窗里了，有三个颜色。小个子的姐妹记得收藏，下次逛街直接照着买。",
    purpose: "告诉观众去哪买，并用「收藏照着买」给出低门槛行动",
    shotType: "橱窗陈列 + 收藏引导花字",
  },
];

const fashionScript: Script = {
  titleOptions: [
    "控糖上班族的早餐，按这 3 点挑贝果",
    "早餐只能吃水煮蛋？试试低糖全麦贝果",
    "挑贝果的 3 个标准，第 1 条最重要",
  ],
  shots: [
    {
      index: 1,
      segmentRole: "hook",
      durationSec: 3,
      visual: "一盘贝果旁边放着一杯美式咖啡",
      shooting: "手机固定在三脚架，45 度俯拍中景",
      line: "旁白：控糖的上班族，早餐真的只能吃水煮蛋吗？",
      onScreenText: "控糖早餐只能吃水煮蛋？",
    },
    {
      index: 2,
      segmentRole: "pain",
      durationSec: 3,
      visual: "手翻看一张写满早餐清单的便利贴，划掉几项",
      shooting: "单手手持，近景",
      line: "旁白：我自己也控过糖，后来摸索出挑贝果的三个标准。",
      onScreenText: "挑贝果看这 3 点",
    },
    {
      index: 3,
      segmentRole: "show",
      durationSec: 5,
      visual: "手指着产品标签上的「0 蔗糖」字样",
      shooting: "单手手持，微距",
      line: "旁白：一看配料，我们这款低糖全麦贝果是 0 蔗糖。",
      onScreenText: "标准一：0 蔗糖",
    },
    {
      index: 4,
      segmentRole: "show",
      durationSec: 5,
      visual: "清晨烤箱打开，热气冒出，贝果出炉",
      shooting: "手机固定在三脚架，烤箱正面近景",
      line: "旁白：二看新鲜度，每天早上现烤，当天卖完。",
      onScreenText: "标准二：每天早上现烤",
    },
    {
      index: 5,
      segmentRole: "show",
      durationSec: 5,
      visual: "6 种口味的贝果依次摆进托盘",
      shooting: "手机固定在三脚架，俯拍",
      line: "旁白：三看能不能吃不腻，6 种口味可以换着来。",
      onScreenText: "标准三：6 种口味",
    },
    {
      index: 6,
      segmentRole: "proof",
      durationSec: 4,
      visual: "切开贝果，夹上鸡蛋和生菜做成早餐",
      shooting: "单手手持，近景跟拍手部动作",
      line: "旁白：夹个蛋和生菜，一份能顶到中午的早餐就好了。",
      onScreenText: "一份顶到中午",
    },
    {
      index: 7,
      segmentRole: "cta",
      durationSec: 5,
      visual: "早餐装盒，旁边放一张店铺地址卡片",
      shooting: "手机固定在三脚架，近景",
      line: "旁白：先收藏这三个标准，路过店里可以来挑一个。",
      onScreenText: "收藏 · 到店挑口味",
    },
  ],
  shootingChecklist: [
    ...COMMON_CHECKLIST_HEAD,
    "产品标签（拍 0 蔗糖字样）",
    "鸡蛋、生菜（做早餐镜头）",
    "手机三脚架",
    "店铺地址卡片",
  ],
};

// ---------- 示例 3：家居好物（数字冲击式） ----------

const homeSegments: Segment[] = [
  {
    role: "hook",
    label: "数字反差开场",
    startSec: 0,
    endSec: 5,
    originalText: "九块九的东西，解决了我家三年的厨房难题。",
    purpose: "低价和长期困扰形成反差，让人想知道是什么东西",
    shotType: "产品拿在手里的特写 + 价格花字",
  },
  {
    role: "pain",
    label: "还原糟糕场景",
    startSec: 5,
    endSec: 10,
    originalText: "以前灶台旁边总是堆满瓶瓶罐罐，油渍擦都擦不干净。",
    purpose: "还原观众熟悉的糟糕场景，引发共鸣",
    shotType: "杂乱灶台的使用前画面",
  },
  {
    role: "show",
    label: "产品与安装",
    startSec: 10,
    endSec: 18,
    originalText: "后来我在墙上装了这个免打孔置物架，背胶贴上去静置一晚，能承重五公斤。",
    purpose: "展示产品如何解决问题，并给出关键参数",
    shotType: "安装过程的手部特写",
  },
  {
    role: "show",
    label: "前后对比",
    startSec: 18,
    endSec: 24,
    originalText: "酱油、醋、料酒全部挂上墙，台面一下子空出一大半。",
    purpose: "用使用前后的强烈对比证明效果",
    shotType: "同机位前后对比画面",
  },
  {
    role: "proof",
    label: "耐用与家人背书",
    startSec: 24,
    endSec: 32,
    originalText: "用了半年，没有掉过一次，撕下来也不留胶印。我已经给爸妈家也装了两个。",
    purpose: "用使用时长和「给家人也买了」建立信任",
    shotType: "置物架承重的近景",
  },
  {
    role: "cta",
    label: "购买入口与互动",
    startSec: 32,
    endSec: 39,
    originalText: "链接放在主页橱窗，觉得有用的话先点个赞收藏，装修党一定用得上。",
    purpose: "告诉观众购买入口，并引导点赞收藏",
    shotType: "整洁台面全景 + 引导花字",
  },
];

const homeScript: Script = {
  titleOptions: [
    "一个贝果，让我控糖三个月没破戒",
    "控糖早餐对比：甜甜圈 vs 全麦贝果",
    "0 蔗糖的低糖全麦贝果，每天早上现烤",
  ],
  shots: [
    {
      index: 1,
      segmentRole: "hook",
      durationSec: 4,
      visual: "手心托着一个贝果，镜头对准贝果",
      shooting: "单手手持，近景",
      line: "旁白：一个贝果，让我坚持控糖三个月没破戒。",
      onScreenText: "一个贝果 · 控糖三个月",
    },
    {
      index: 2,
      segmentRole: "pain",
      durationSec: 4,
      visual: "桌上堆着蛋糕和甜甜圈，手把它们推到一边",
      shooting: "手机固定在三脚架，俯拍中景",
      line: "旁白：以前早上一饿就想吃甜的，控糖总是坚持不了几天。",
      onScreenText: "早上一饿就破戒",
    },
    {
      index: 3,
      segmentRole: "show",
      durationSec: 6,
      visual: "全麦面团揉好、整形，放进烤箱",
      shooting: "手机固定在三脚架，俯拍手部特写",
      line: "旁白：后来我们做了这款低糖全麦贝果，0 蔗糖，靠全麦本身的香味。",
      onScreenText: "0 蔗糖 · 全麦",
    },
    {
      index: 4,
      segmentRole: "show",
      durationSec: 6,
      visual: "左边甜甜圈、右边贝果，同一机位对比",
      shooting: "手机固定在三脚架，同机位左右对比",
      line: "旁白：同样是早餐，一边是糖，一边是扎实的麦香，饱腹感差很多。",
      onScreenText: "左：甜甜圈　右：全麦贝果",
    },
    {
      index: 5,
      segmentRole: "proof",
      durationSec: 5,
      visual: "清晨出炉的贝果码放上架，旁边是 6 种口味的标签",
      shooting: "单手手持，平拍横移",
      line: "旁白：每天早上现烤，6 种口味，附近不少上班族每周都来囤。",
      onScreenText: "每天早上现烤 · 6 种口味",
    },
    {
      index: 6,
      segmentRole: "cta",
      durationSec: 5,
      visual: "贝果装袋，递向镜头",
      shooting: "手机固定在三脚架，近景",
      line: "旁白：觉得有用就先点赞收藏，下次早餐不知道吃什么，来店里挑一个。",
      onScreenText: "点赞收藏 · 到店挑一个",
    },
  ],
  shootingChecklist: [
    ...COMMON_CHECKLIST_HEAD,
    "甜甜圈或蛋糕（对比用）",
    "6 种口味标签",
    "手机三脚架",
    "纸袋",
  ],
};

function joinText(segments: Segment[]): string {
  return segments.map((s) => s.originalText).join("");
}

export const SAMPLES: Sample[] = [
  {
    id: "bakery",
    title: "烘焙新品",
    text: joinText(bakerySegments),
    analysis: {
      summary: "用「千万别来买」的反向劝退制造好奇，再用工艺和口感细节建立信任，最后用评论留货引导互动。",
      hookType: "反常识/警告",
      hookText: bakerySegments[0].originalText,
      segments: bakerySegments,
      reusablePatterns: [
        "开头用「千万别……」的反向劝退句制造好奇",
        "紧接着一句反转，把劝退变成稀缺信号",
        "用具体数字（时间、数量、工序次数）展示用心",
        "用切面或细节微距镜头调动食欲",
        "结尾给出「评论区留言」这类低门槛行动，拉高互动",
      ],
      nonCopyable: [
        "原视频的具体台词，例如「根本买不到」「最像德国那边的味道」",
        "原店铺的出炉时间、产量等真实经营信息",
        "原作者的店铺环境和出镜形象",
      ],
    },
    script: bakeryScript,
  },
  {
    id: "fashion",
    title: "服装穿搭",
    text: joinText(fashionSegments),
    analysis: {
      summary: "用小个子的身材疑问开场，分三点给出可以照做的方法，最后用上身效果回应开头并引导收藏。",
      hookType: "提问式",
      hookText: fashionSegments[0].originalText,
      segments: fashionSegments,
      reusablePatterns: [
        "开头直接点名人群，抛出她们最在意的问题",
        "先认同顾虑，再承诺「三个方法」这类数量明确的解决方案",
        "用「第一、第二、第三」分点讲解，每点配一个特写镜头",
        "结尾用效果画面回应开头的问题，形成前后呼应",
        "用「收藏下次照着做」作为低门槛行动",
      ],
      nonCopyable: [
        "原视频的身高数据和具体穿搭单品",
        "原作者本人出镜试穿的形象",
        "原店铺的橱窗和商品信息",
      ],
    },
    script: fashionScript,
  },
  {
    id: "home",
    title: "家居好物",
    text: joinText(homeSegments),
    analysis: {
      summary: "用「九块九解决三年难题」的数字反差开场，展示使用前后对比和耐用性，最后用家人背书引导点赞收藏。",
      hookType: "数字冲击",
      hookText: homeSegments[0].originalText,
      segments: homeSegments,
      reusablePatterns: [
        "开头用低价和长期困扰的数字反差制造好奇",
        "先还原观众熟悉的糟糕场景，再让产品出场",
        "用同一机位拍使用前后对比",
        "用使用时长和「给家人也买了」建立信任",
        "结尾告诉观众在哪买，并引导点赞收藏",
      ],
      nonCopyable: [
        "原视频的价格、承重等具体参数",
        "原作者家中的厨房画面",
        "原视频的具体台词，例如「装修党一定用得上」",
      ],
    },
    script: homeScript,
  },
];

export function findSampleByText(text: string): Sample | undefined {
  const trimmed = text.trim();
  return SAMPLES.find((s) => s.text === trimmed);
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export function isDefaultProduct(product: ProductInput): boolean {
  return (
    product.name.trim() === DEFAULT_PRODUCT.name &&
    product.audience.trim() === DEFAULT_PRODUCT.audience &&
    product.location.trim() === DEFAULT_PRODUCT.location &&
    product.style === DEFAULT_PRODUCT.style &&
    product.solo === DEFAULT_PRODUCT.solo &&
    product.onCamera === DEFAULT_PRODUCT.onCamera &&
    product.targetDurationSec === DEFAULT_PRODUCT.targetDurationSec &&
    product.sellingPoints.length === DEFAULT_PRODUCT.sellingPoints.length &&
    product.sellingPoints.every((p, i) => p.trim() === DEFAULT_PRODUCT.sellingPoints[i])
  );
}
