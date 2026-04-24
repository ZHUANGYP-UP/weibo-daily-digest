# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**大眼睛快搜内容** — 微博每日摘要系统，自动抓取关注博主内容并生成 AI 摘要推送。Next.js 14 全栈应用，移动端优先。

## 常用命令

```bash
npm run dev           # 启动开发服务器
npm run build         # 生产构建
npm run lint          # Next.js lint
npm run db:migrate    # 执行 Prisma 迁移（创建迁移文件 + 应用）
npm run db:generate   # 生成 Prisma Client
npm run db:studio     # 打开 Prisma Studio 查看数据库
```

暂无测试框架，核心逻辑需 TDD 时先搭建测试基础设施。

## 架构

```
app/                # Next.js App Router（所有页面均为 "use client"）
  page.tsx          # 首页仪表盘
  layout.tsx        # 根布局 (TopAppBar + BottomNav)
  bloggers/         # 博主管理页
  history/          # 摘要历史列表 + [id] 详情
  settings/         # 推送时间/AI风格设置
  api/              # REST API 路由
    bloggers/       # GET/POST + [id] DELETE
    digests/        # GET 分页 + [id] 详情
    notifications/  # GET + [id] PATCH 标记已读
    settings/       # GET/PUT 单例设置
    scrape/         # POST 触发抓取（当前为 stub）
components/         # 共享组件 (TopAppBar, BottomNav, NotificationBell)
lib/                # 业务逻辑
  prisma.ts         # Prisma Client 单例（开发环境防热重载多连接）
  validation.ts     # 输入校验 (pushTime HH:mm, aiStyle concise|detailed)
prisma/             # 数据库
  schema.prisma     # Blogger→Post, Digest, Notification, Settings
  dev.db            # SQLite 开发库
  migrations/       # 迁移文件
```

### 关键技术细节

- **路径别名**: `@/*` 映射项目根目录（tsconfig.json）
- **Tailwind v4**: 使用 `@tailwindcss/postcss`，配置在 `tailwind.config.ts`
- **包类型**: `"type": "commonjs"`（package.json）
- **状态管理**: 已装 zustand 但尚未使用
- **API 路由模式**: 统一使用 `@/lib/prisma` 单例 + `NextResponse.json()`，校验通过 `@/lib/validation`
- **AI 接口**: 已装 openai 包，计划用 OpenAI 兼容协议对接阿里灵积（DASHSCOPE_API_KEY）

### 数据模型关系

- **Blogger** 1:N **Post** (级联删除)
- **Digest** 关联 rawPostIds (JSON 字符串)，status: pending|done|failed
- **Notification** 可选关联 Digest (set null)
- **Settings** 单例 (id 固定为 "singleton")

### 设计系统

- 主色 `#b32c00`，容器色 `#f35022`（Tailwind `primary` / `primary-container`）
- 字体: Manrope (标题 `font-headline`) + Inter (正文 `font-body`) + Material Symbols Outlined (图标)
- 风格: 圆角卡片、毛玻璃效果、渐变按钮

## 环境变量

- `DATABASE_URL`: SQLite 连接串 (`file:./dev.db`)
- `DASHSCOPE_API_KEY`: 阿里灵积 AI API Key

## 待实现

- `lib/scraper.ts`: 微博抓取逻辑 (`scrapeAll()`)
- `lib/ai.ts`: AI 摘要生成 (OpenAI 兼容接口)
- `lib/scheduler.ts`: 定时任务 (已装 node-cron 包)
- 博主 UID 验证（通过微博 API 获取昵称头像，当前用 UID 做占位昵称）
- `app/api/scrape/route.ts`: 当前返回 stub 响应，需接入 scraper

## 编码规范

* 核心逻辑必须 TDD，原型/配置可豁免
* 小步修改，持续重构，单次聚焦单一功能
* 显式处理错误，禁止吞异常
* 公开接口/复杂逻辑附中文 Docstring，避免复述代码
