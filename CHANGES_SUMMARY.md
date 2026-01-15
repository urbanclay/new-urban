# IntelliWork Assistant — 初步代码审查与 DeepSeek 集成改动摘要

本次在你提供的最初版本基础上完成了以下工作（已在沙箱副本中实现并验证安装依赖通过）：

## 关键发现（Issue）
- 前端是 Vite + React（非 Next.js）。现有 AI 调用位于客户端（`services/geminiService.ts`）并使用 `process.env.API_KEY` 读取密钥：
  - 在 Vite 前端中，`process.env.*` 不会自动注入（需 `import.meta.env.VITE_*`），因此当前代码在浏览器端无法读到该密钥。
  - 同时，将模型密钥放在前端会造成泄露风险（即使能读到，也不应暴露给用户端）。
- README 指示使用 `GEMINI_API_KEY`，而代码里读取 `process.env.API_KEY`，命名不一致。
- 现有功能关注 Gemini，未提供 DeepSeek 切换与后端代理层。

## 本次新增能力（DeepSeek 接入 + 更安全的调用路径）
- 新增后端 API（Vercel Serverless Functions）作为统一的 AI 代理层：
  - `api/ai/analyze.ts`：分析单条记录（可选 `provider=deepseek|gemini`）。
  - `api/ai/report.ts`：生成月度复盘报告（同样可切换提供方）。
  - 后端通过环境变量安全读取密钥，不在前端暴露。
  - DeepSeek 使用 OpenAI 兼容 SDK：`openai`，`baseURL=https://api.deepseek.com`。
- 新增前端服务封装：`services/aiClient.ts`
  - `analyzeWorkContentAPI()` 与 `generateMonthlyReportAPI()` 通过 `fetch` 调后端 API。
  - 支持 `VITE_PUBLIC_API_BASE`（若前后端分域名时可配置）。
- 将 `App.tsx` 中报告生成调用替换为后端 API（默认使用 `deepseek` 提供方）。

## 受影响/新增的文件
- 新增：`api/ai/analyze.ts`
- 新增：`api/ai/report.ts`
- 新增：`services/aiClient.ts`
- 新增：`.env.example`
- 修改：`App.tsx`（将 `generateMonthlyReport` 更换为 `generateMonthlyReportAPI(..., 'deepseek')`）
- 未改动：`services/geminiService.ts`（保留，便于回滚与对照）

## 后续可选优化建议
- 将 `analyzeWorkContent` 也切换到后端 API，以统一调用路径与密钥管理（现在的 `geminiService.ts` 仍在前端直接调用）。
- 为 provider 提供 UI 开关（Gemini/DeepSeek 切换），当前默认 DeepSeek 仅体现在报告生成处。
- 引入 lint/format（`eslint` + `prettier`）与类型检查（`tsc --noEmit`）到 CI。
- 若需要 Supabase 同步能力，可新增 RLS 策略与 API 层，实现记录的云端持久化（当前主要使用 `localStorage`）。
