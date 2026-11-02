# 爆款复刻助手

**最快体验**：`npm install` → `npm run dev` → 打开 http://localhost:3000
→ 选一个示例 → 开始拆解 → 填入示例产品 → 生成我的脚本（不需要配置任何 Key，这条路径返回预置的高质量示例结果）。

小影 AI 产品经理笔试 Demo：粘贴一条爆款短视频的口播文案，AI 拆解出它的结构（钩子、节奏、镜头顺序），再把结构迁移到你自己的产品上，生成可以照着拍的分镜脚本，并用确定性规则检查台词和花字有没有照抄原句。

产品说明（笔试第 1 到 6 题）见 [docs/产品说明文档.md](docs/产品说明文档.md)。

## 环境要求

- Node.js 20 及以上（开发时使用 Node 24）
- 实际使用的版本：Next.js 16.4.3、React 19.3.0、Tailwind CSS 4、zod 4、vitest 5

## 配置真实模型（可选）

复制 `.env.example` 为 `.env.local`，填写三个变量：

```bash
LLM_BASE_URL=https://api.deepseek.com
LLM_API_KEY=你的 Key
LLM_MODEL=deepseek-chat
```

- 接口需兼容 OpenAI Chat Completions，并支持 `response_format: { type: "json_object" }`（DeepSeek、通义千问兼容模式、OpenAI 都支持）。
- 三个变量任意一个为空时，使用演示数据，页面徽标显示「演示数据 · 未配置模型」。
- 已配置但调用失败（Key 错误、超时 45 秒、返回格式不对）时，退回演示数据，徽标显示「演示数据 · 模型调用失败」，服务端打印错误日志。不重试。

## 命令

```bash
npm run dev     # 本地开发
npm run test    # 单元测试（vitest）
npm run lint    # ESLint
npm run build   # 生产构建
```

## 目录

```
app/
  page.tsx                 单页三步流程（参考文案 → 拆解与产品 → 分镜脚本）
  api/analyze/route.ts     拆解参考文案
  api/generate/route.ts    生成分镜脚本
  api/rewrite-shot/route.ts 重写单个镜头
components/                页面组件
lib/
  llm.ts                   模型调用、JSON 容错解析、退回演示数据
  prompts.ts               三个 prompt
  schemas.ts               zod 校验（模型输出宽松、用户输入严格）
  postprocess.ts           服务端后处理（截断、重新编号、时长归一）
  durations.ts             时长分配（每镜至少 1 秒，加总等于目标时长）
  originality.ts           原创性检查（最长公共子串 ≥ 8 字即标记）
  samples.ts               3 个内置示例、示例产品、预置的拆解结果和分镜脚本
  mock/                    规则拆解与规则生成（演示数据）
  exportMarkdown.ts        导出 Markdown
tests/                     单元测试
docs/产品说明文档.md        笔试答卷
docs/AI使用记录.md          使用的 AI 工具及其在本次作业中的作用（提交材料第 3 项）
docs/images/               文档截图
```

## Demo 范围

Demo 聚焦验证核心流程，以下能力按设计暂不包含（取舍理由见 [产品说明文档第 3 题](docs/产品说明文档.md#demo-范围与取舍)）：

- 输入方式为粘贴口播文案或字幕，暂不解析视频链接。
- 未配置模型 Key 时，「内置示例 + 示例产品 + 30 秒」返回预置的高质量示例结果，其他组合由规则引擎生成，用于演示完整流程；真实生成质量以接入大模型后为准。
- 未配置模型时，单镜重写只更换写法，不响应修改要求。
- 原创性检查针对台词和花字。
- 不做账号和持久化，刷新后数据清空。
