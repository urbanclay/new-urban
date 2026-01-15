# 部署配置与验证步骤（Vercel + DeepSeek + Gemini）

> 假设你已在 Vercel 上连接 GitHub 仓库。下列步骤只涉及环境变量与重新部署即可生效。

## 1) 在 Vercel 上配置环境变量（Project Settings → Environment Variables）

- 必填（至少选其一）：
  - `DEEPSEEK_API_KEY`：你的 DeepSeek API Key
  - `GEMINI_API_KEY`：你的 Gemini API Key（保留现有能力）
- 可选：
  - `DEEPSEEK_BASE_URL`：默认 `https://api.deepseek.com`
  - `DEEPSEEK_MODEL`：默认 `deepseek-chat`
  - `VITE_PUBLIC_API_BASE`：若前后端不同域名，设置为后端 API 的完整地址；同域部署可不填

设置完成后，点击「Redeploy」重新部署。

## 2) 验证 API 工作

- 访问前端页面，进入「智能审计」模块，点击生成月度报告。
- 观察网络请求：应向 `/api/ai/report` 发起 POST 请求（payload 包含 records 与 month）。
- 若使用 DeepSeek：在 Vercel logs 中可看到模型调用日志（成功返回 200）。

## 3) 常见问题排查

- 401/403：确认相应的 API Key 已在 Vercel 环境变量中配置，并触发了 redeploy。
- 5xx：检查 Vercel logs，确认 `baseURL`、`model` 名称是否正确。
- 前端无法访问 API：若跨域/跨域名，请设置 `VITE_PUBLIC_API_BASE` 并重新构建。

## 4) 后续增强建议

- 将记录的「AI 智能分析」也切换至 `/api/ai/analyze`，并在 UI 提供 provider 切换。
- 将本地存储（localStorage）数据迁移至 Supabase（需数据库 schema + RLS + API）。
- CI 中加入 `tsc --noEmit`、`eslint --max-warnings 0` 与构建检查。
