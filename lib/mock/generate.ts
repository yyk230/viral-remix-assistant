import { deepEqual, findSampleByText, isDefaultProduct } from "../samples";
import type { Analysis, ProductInput, Script, SegmentRole, Shot, Style } from "../types";

interface ShotTemplate {
  visualOnCamera: string;
  visualOffCamera: string;
  /** 景别与运镜，一个人拍时会在前面加上「手机固定在三脚架，」或「单手手持，」 */
  shooting: string;
  line: string;
  onScreenText: string;
}

const TEMPLATES: Record<SegmentRole, [ShotTemplate, ShotTemplate]> = {
  hook: [
    {
      visualOnCamera: "店主拿着{name}面对镜头",
      visualOffCamera: "{name}摆在{location}上，镜头缓慢推近",
      shooting: "中景缓慢推近",
      line: "{audience}注意了，这个{name}我劝你先别急着买",
      onScreenText: "{audience}先别急着买",
    },
    {
      visualOnCamera: "店主举起{name}展示给镜头",
      visualOffCamera: "手把{name}推到画面中央",
      shooting: "近景固定机位",
      line: "为什么{audience}都在回购这个{name}？",
      onScreenText: "{audience}都在回购？",
    },
  ],
  pain: [
    {
      visualOnCamera: "店主皱眉摇头，表现纠结",
      visualOffCamera: "手在几款同类产品之间来回犹豫",
      shooting: "近景",
      line: "很多人挑{name}的时候，最怕踩雷，花了钱还不满意",
      onScreenText: "最怕踩雷",
    },
    {
      visualOnCamera: "店主对着镜头讲述自己的经历",
      visualOffCamera: "手翻看同类产品的包装和标签",
      shooting: "近景",
      line: "以前我自己也总遇到这个问题：看着都差不多，买回去才发现不合适",
      onScreenText: "看着都差不多？",
    },
  ],
  show: [
    {
      visualOnCamera: "店主一边介绍一边展示{name}",
      visualOffCamera: "手部展示{name}的细节",
      shooting: "特写",
      line: "我们这款{name}，最大的特点是{point}",
      onScreenText: "{point}",
    },
    {
      visualOnCamera: "店主指着{name}的细节讲解",
      visualOffCamera: "{name}细节微距，手指轻点重点部位",
      shooting: "微距特写",
      line: "你看这里，{point}，这个细节很多人都没注意到",
      onScreenText: "细节：{point}",
    },
  ],
  proof: [
    {
      visualOnCamera: "店主展示顾客的留言和订单",
      visualOffCamera: "顾客留言卡片和订单截图",
      shooting: "近景平移",
      line: "在店里卖了这么久，{audience}的回头客最多，大家最认的就是{point}",
      onScreenText: "回头客最认：{point}",
    },
    {
      visualOnCamera: "店主把{name}递给镜头外的顾客",
      visualOffCamera: "多份{name}整齐码放，手拿起其中一份",
      shooting: "中景横移",
      line: "不只是我说好，试过的{audience}都说{point}这一点确实没话说",
      onScreenText: "试过的都说好",
    },
  ],
  cta: [
    {
      visualOnCamera: "店主打包{name}，对镜头挥手",
      visualOffCamera: "{name}装袋封口",
      shooting: "近景",
      line: "想试试的话，评论区告诉我，我帮你留一份",
      onScreenText: "评论区留言 · 帮你留一份",
    },
    {
      visualOnCamera: "店主在{location}前招手",
      visualOffCamera: "镜头从{name}拉远到{location}全景",
      shooting: "近景拉远到全景",
      line: "先收藏这条视频，下次想买{name}的时候直接来找我",
      onScreenText: "收藏 · 到店找我",
    },
  ],
  other: [
    {
      visualOnCamera: "店主补充讲解",
      visualOffCamera: "{name}换一个角度展示",
      shooting: "近景",
      line: "说到{name}，还有一点值得一提：{point}",
      onScreenText: "{point}",
    },
    {
      visualOnCamera: "店主竖起大拇指",
      visualOffCamera: "手把{name}翻转展示",
      shooting: "特写",
      line: "再补充一句，{point}，这也是我推荐它的原因",
      onScreenText: "补充：{point}",
    },
  ],
};

const STYLE_ENDINGS: Record<Style, string> = {
  真实亲切: "有问题随时在评论区问我",
  专业测评: "以上是我的实测结论，供你参考",
  搞笑反转: "别说我没提醒你，手慢就没了",
  温馨治愈: "愿你每天都有一点小确幸",
};

const TITLE_TEMPLATES = [
  "{name}｜{firstPoint}，{audience}闭眼入",
  "{name}这样选不踩雷：{firstPoint}是关键",
  "{audience}的{name}，我只推荐这一款",
];

function fill(template: string, product: ProductInput, point: string): string {
  return template
    .replaceAll("{name}", product.name)
    .replaceAll("{point}", point)
    .replaceAll("{firstPoint}", product.sellingPoints[0])
    .replaceAll("{audience}", product.audience)
    .replaceAll("{location}", product.location);
}

/** position 为镜头在脚本中的 0 基序号 */
function buildShot(
  role: SegmentRole,
  position: number,
  variant: number,
  product: ProductInput,
  durationSec: number,
): Shot {
  const template = TEMPLATES[role][variant % 2];
  const point = product.sellingPoints[position % product.sellingPoints.length];
  const index = position + 1;

  let shooting = fill(template.shooting, product, point);
  if (product.solo) {
    shooting = `${index % 2 === 0 ? "手机固定在三脚架，" : "单手手持，"}${shooting}`;
  }

  let line = fill(template.line, product, point);
  if (role === "cta") line = `${line}。${STYLE_ENDINGS[product.style]}`;
  if (!product.onCamera) line = `旁白：${line}`;

  return {
    index,
    segmentRole: role,
    durationSec,
    visual: fill(product.onCamera ? template.visualOnCamera : template.visualOffCamera, product, point),
    shooting,
    line,
    onScreenText: fill(template.onScreenText, product, point),
  };
}

function buildChecklist(product: ProductInput): string[] {
  const list = [`场地：${product.location}`, `产品：${product.name}（准备 2 份，一份完整、一份切开）`];
  if (product.solo) list.push("手机三脚架");
  if (["店", "室内", "家"].some((w) => product.location.includes(w))) list.push("补光灯或靠窗的自然光");
  list.push("提前写好花字文案");
  return list;
}

export function ruleGenerate(analysis: Analysis, product: ProductInput): Script {
  const shots = analysis.segments.map((segment, i) =>
    buildShot(segment.role, i, i % 2, product, Math.max(Math.abs(segment.endSec - segment.startSec), 1)),
  );
  return {
    titleOptions: TITLE_TEMPLATES.map((t) => fill(t, product, product.sellingPoints[0])),
    shots,
    shootingChecklist: buildChecklist(product),
  };
}

export function mockGenerate(referenceText: string, analysis: Analysis, product: ProductInput): Script {
  const sample = findSampleByText(referenceText);
  if (sample && deepEqual(analysis, sample.analysis) && isDefaultProduct(product)) {
    return structuredClone(sample.script);
  }
  return ruleGenerate(analysis, product);
}

export function mockRewriteShot(product: ProductInput, script: Script, shotIndex: number): Shot {
  const original = script.shots.find((s) => s.index === shotIndex);
  if (!original) throw new Error(`镜号 ${shotIndex} 不存在`);

  const position = shotIndex - 1;
  const candidates = [0, 1].map((variant) =>
    buildShot(original.segmentRole, position, variant, product, original.durationSec),
  );
  const different = candidates.find((c) => c.line !== original.line);
  if (different) return different;

  const fallback = candidates[(position + 1) % 2];
  return { ...fallback, line: `${fallback.line}（换个说法）` };
}
