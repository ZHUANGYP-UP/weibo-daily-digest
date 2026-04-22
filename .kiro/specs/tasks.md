# 实现计划：微博每日摘要

## 概述

按照设计文档，逐步搭建 Next.js 全栈应用。每个任务都是可独立完成的编码步骤，所有测试任务均为必须实现。

## 任务

- [ ] 1. 初始化项目结构与数据库
  - 使用 `create-next-app` 初始化 Next.js 项目，配置 TypeScript + Tailwind CSS
  - 安装依赖：`prisma`, `@prisma/client`, `shadcn/ui`, `zustand`, `node-cron`, `openai`, `axios`, `cheerio`, `fast-check`, `jest`, `@testing-library/react`
  - 初始化 Prisma，配置 SQLite 数据源
  - 按设计文档创建所有数据模型：Blogger、Post、Digest、Notification、Settings
  - 运行 `prisma migrate dev` 生成数据库
  - 配置 Jest + ts-jest 测试环境
  - _Requirements: 1.2, 2.2, 3.1, 4.2, 6.1_

- [ ] 2. 实现博主管理 API 与页面
  - [ ] 2.1 实现博主 CRUD API
    - 创建 `app/api/bloggers/route.ts`：GET（列表）、POST（添加）
    - 创建 `app/api/bloggers/[id]/route.ts`：DELETE（删除）
    - POST 时验证 UID 不为空，重复 UID 返回 400
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 2.2 为博主 API 写属性测试
    - **Property 1: 添加博主后可查询到**
    - 对任意合法 UID，添加后 GET /api/bloggers 应包含该博主
    - **Validates: Requirements 1.1, 1.2**
    - `// Feature: weibo-daily-digest, Property 1`

  - [ ] 2.3 实现博主管理前端页面
    - 创建 `app/bloggers/page.tsx`
    - 使用 shadcn/ui 的 Card、Input、Button 组件
    - 实现添加博主表单（输入 UID）和博主列表展示
    - 使用 `useBloggerStore` (Zustand) 管理状态
    - _Requirements: 1.1, 1.4_

  - [ ] 2.4 为博主删除写属性测试
    - **Property: 删除博主后不可查询到**
    - 对任意博主列表，删除其中一个后，列表不再包含该博主
    - **Validates: Requirements 1.3**
    - `// Feature: weibo-daily-digest, Property 1 (delete variant)`

- [ ] 3. 实现微博抓取模块
  - [ ] 3.1 实现 Scraper 核心逻辑
    - 创建 `lib/scraper.ts`
    - 实现 `scrapeBlogger(blogger)` 函数，请求 m.weibo.cn API 解析微博列表
    - 实现去重逻辑：查询数据库已有 weiboId，过滤后只插入新微博
    - 记录每次抓取的错误日志
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.2 为抓取去重写属性测试
    - **Property 2: 抓取去重**
    - 对任意包含重复 weiboId 的微博列表，入库后数据库中不存在重复记录
    - **Validates: Requirements 2.2**
    - `// Feature: weibo-daily-digest, Property 2`

  - [ ] 3.3 实现手动触发抓取 API
    - 创建 `app/api/scrape/route.ts`：POST 触发立即抓取所有博主
    - _Requirements: 2.4_

- [ ] 4. 检查点 - 确保所有测试通过，如有问题请告知

- [ ] 5. 实现 AI 摘要生成模块
  - [ ] 5.1 实现通义千问调用模块
    - 创建 `lib/ai.ts`
    - 配置 OpenAI SDK 指向 Dashscope 兼容接口，使用 `qwen-turbo` 模型
    - 实现 `buildPrompt(posts)` 函数，将微博列表格式化为 prompt（包含时间、内容、博主）
    - 实现 `generateDigest(posts)` 函数，调用 API 返回摘要 Markdown
    - AI 失败时将 Digest status 设为 "failed"
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ] 5.2 为 prompt 构建写属性测试
    - **Property 3: prompt 包含关键信息**
    - 对任意微博列表，`buildPrompt` 生成的字符串应包含每条微博的时间和内容
    - **Validates: Requirements 3.2**
    - `// Feature: weibo-daily-digest, Property 3`

  - [ ] 5.3 为摘要状态完整性写属性测试
    - **Property 4: 摘要状态完整性**
    - 对任意 AI 调用结果（成功或失败），Digest 的 status 只能是 "pending"、"done"、"failed" 之一
    - **Validates: Requirements 3.1, 3.4**
    - `// Feature: weibo-daily-digest, Property 4`

- [ ] 6. 实现站内消息通知
  - [ ] 6.1 实现通知 API
    - 创建 `app/api/notifications/route.ts`：GET（通知列表，含未读数）
    - 创建 `app/api/notifications/[id]/route.ts`：PATCH（标记已读）
    - _Requirements: 4.4, 4.5_

  - [ ] 6.2 为未读数一致性写属性测试
    - **Property 2: 通知未读数一致性**
    - 对任意通知状态，API 返回的 unreadCount 应等于数据库中 isRead=false 的记录数
    - **Validates: Requirements 4.4**
    - `// Feature: weibo-daily-digest, Property 2`

  - [ ] 6.3 为标记已读幂等性写属性测试
    - **Property 3: 标记已读的幂等性**
    - 对任意通知，多次调用标记已读，结果与调用一次相同
    - **Validates: Requirements 4.4**
    - `// Feature: weibo-daily-digest, Property 3`

  - [ ] 6.4 实现消息角标组件
    - 在 `app/layout.tsx` 中添加全局导航栏
    - 创建 `components/NotificationBell.tsx`，展示未读数角标
    - 点击展开通知列表面板（使用 shadcn/ui Popover）
    - 使用 `useNotificationStore` (Zustand) 管理未读数状态
    - _Requirements: 4.4, 4.5_

- [ ] 7. 实现定时任务调度器
  - 创建 `lib/scheduler.ts`，使用 node-cron 注册定时任务
  - 定时任务流程：抓取 → AI 整理 → 写入 Digest → 创建 Notification
  - 在 Next.js 自定义服务器（`server.ts`）中启动调度器
  - 从 Settings 表读取推送时间，动态更新 cron 表达式
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. 实现摘要浏览页面
  - [ ] 8.1 实现摘要列表 API
    - 创建 `app/api/digests/route.ts`：GET（按日期降序，支持 bloggerId 筛选）
    - 创建 `app/api/digests/[id]/route.ts`：GET（摘要详情）
    - _Requirements: 5.1, 5.4_

  - [ ] 8.2 为摘要排序写属性测试
    - **Property 5: 摘要列表按日期降序**
    - 对任意摘要数据集，GET /api/digests 返回的列表应按 date 字段降序排列
    - **Validates: Requirements 5.1**
    - `// Feature: weibo-daily-digest, Property 5`

  - [ ] 8.3 实现历史摘要前端页面
    - 创建 `app/history/page.tsx`，展示摘要卡片列表
    - 创建 `app/history/[id]/page.tsx`，展示摘要详情（Markdown 渲染）
    - 摘要详情中每条微博引用包含原始链接
    - 支持按博主筛选（下拉选择器）
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. 实现用户配置页面
  - [ ] 9.1 实现配置 API
    - 创建 `app/api/settings/route.ts`：GET（读取配置）、PUT（更新配置）
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 9.2 为配置保存一致性写属性测试
    - **Property 5: 配置保存一致性（round-trip）**
    - 对任意合法配置对象，PUT 保存后 GET 读取应得到完全相同的值
    - **Validates: Requirements 6.3**
    - `// Feature: weibo-daily-digest, Property 5`

  - [ ] 9.3 实现配置前端页面
    - 创建 `app/settings/page.tsx`
    - 提供推送时间选择器（时间输入）和 AI 风格选择（简洁/详细）
    - 保存后调用 PUT /api/settings 并提示成功
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 10. 实现首页（今日摘要）
  - 创建 `app/page.tsx`，展示今日最新摘要
  - 提供"立即抓取"按钮，调用 POST /api/scrape
  - 若今日无摘要，展示空状态提示
  - _Requirements: 2.4, 5.1_

- [ ] 11. 最终检查点 - 确保所有测试通过，整体功能串联正常

## 备注

- 所有测试任务均为必须实现，确保代码质量和正确性
- 每个任务都引用了具体的需求条目，便于追溯
- 属性测试使用 `fast-check` 库，每个属性至少运行 100 次
- 单元测试使用 Jest + React Testing Library
