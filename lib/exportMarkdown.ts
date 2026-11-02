import { ORIGINALITY_FIELD_LABELS, ROLE_LABELS } from "./labels";
import { originalitySummary, type OriginalityResult } from "./originality";
import type { Analysis, ProductInput, Script, Source } from "./types";

export function exportMarkdown(
  product: ProductInput,
  analysis: Analysis,
  script: Script,
  originality: OriginalityResult,
  source: Source,
): string {
  const total = script.shots.reduce((sum, s) => sum + s.durationSec, 0);
  const lines: string[] = [
    `# ${product.name} · 爆款复刻脚本`,
    "",
    "## 参考结构",
    "",
    analysis.summary,
    "",
    `钩子类型：${analysis.hookType}`,
    "",
    "## 标题备选",
    "",
    ...script.titleOptions.map((t, i) => `${i + 1}. ${t}`),
    "",
    `## 分镜（共 ${total} 秒）`,
    "",
  ];

  for (const shot of script.shots) {
    lines.push(
      `### 镜 ${shot.index} · ${ROLE_LABELS[shot.segmentRole]} · ${shot.durationSec} 秒`,
      "",
      `- 画面：${shot.visual}`,
      `- 拍法：${shot.shooting}`,
      `- 台词：${shot.line}`,
      `- 花字：${shot.onScreenText.trim() || "无"}`,
      "",
    );
  }

  lines.push("## 拍摄清单", "", ...script.shootingChecklist.map((item) => `- ${item}`), "");

  lines.push("## 原创性检查", "", originalitySummary(originality));
  if (originality.hits.length > 0) {
    lines.push("");
    for (const hit of originality.hits) {
      lines.push(`- 镜 ${hit.shotIndex} ${ORIGINALITY_FIELD_LABELS[hit.field]}：「${hit.fragment}」`);
    }
  }

  lines.push("", `由爆款复刻助手生成（来源：${source === "llm" ? "AI 生成" : "演示数据"}）`, "");
  return lines.join("\n");
}
