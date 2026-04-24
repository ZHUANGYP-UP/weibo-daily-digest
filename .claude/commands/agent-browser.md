浏览器自动化 — 使用 agent-browser CLI 进行浏览器自动化交互。

参数: $ARGUMENTS

---

# Agent Browser

AI 代理的快速浏览器自动化 CLI 工具。通过 CDP 协议连接 Chrome/Chromium，使用无障碍树快照和紧凑的 `@eN` 元素引用。

安装：`npm i -g agent-browser && agent-browser install`

## 从这里开始

在运行任何 `agent-browser` 命令之前，加载实际的工作流内容：

```bash
agent-browser skills get core             # 从这里开始 — 工作流、常见模式、故障排除
agent-browser skills get core --full      # 包含完整命令参考和模板
```

## 专项技能

```bash
agent-browser skills get electron          # Electron 桌面应用
agent-browser skills get slack             # Slack 工作区自动化
agent-browser skills get dogfood           # 探索性测试 / QA / Bug 排查
agent-browser skills get vercel-sandbox    # Vercel Sandbox
agent-browser skills get agentcore         # AWS Bedrock AgentCore 云浏览器
```

## 特点

- 快速原生 Rust CLI，兼容任何 AI 代理
- 通过 CDP 连接 Chrome/Chromium，无需 Playwright/Puppeteer 依赖
- 无障碍树快照配合元素引用，实现可靠交互
- 会话管理、认证保险库、状态持久化、视频录制
