# 需求文档

## 简介

一个全栈应用，定时抓取指定微博博主的最新内容，通过通义千问 AI 整理成摘要文章，并推送到站内消息区域。
前端使用 Next.js + shadcn/ui，后端使用 Next.js API Routes（Node.js），帮助用户高效获取关注博主的重要动态。

## 词汇表

- **System**：整个应用系统
- **Scraper**：微博内容抓取模块，负责从微博平台获取博主发布的内容
- **Digest**：由 AI 生成的每日摘要文章，包含当日所有博主的内容整理
- **Scheduler**：定时任务调度器，负责按配置时间触发抓取和推送流程
- **User**：使用本系统的用户
- **Blogger**：用户关注的微博博主，通过 UID 唯一标识
- **Notification**：站内消息通知，与 Digest 一一对应
- **Post**：从微博抓取的单条原始微博内容
- **Settings**：用户配置项，包括推送时间和 AI 整理风格

## 需求

### 需求 1：博主管理

**用户故事：** 作为用户，我想管理我关注的微博博主列表，以便系统知道要抓取哪些人的内容。

#### 验收标准

1. THE System SHALL 提供一个界面，允许用户通过输入微博 UID 添加博主
2. WHEN 用户添加博主时，THE System SHALL 存储该博主的 UID、昵称和头像信息
3. WHEN 用户删除一个博主时，THE System SHALL 从列表中移除该博主及其关联的 Post 数据
4. THE System SHALL 展示当前已添加的博主列表，包括博主名称和头像
5. IF 用户添加的 UID 已存在于博主列表中，THEN THE System SHALL 返回错误提示"该博主已添加"
6. IF 用户添加的 UID 在微博平台不存在，THEN THE System SHALL 返回错误提示"博主不存在"

### 需求 2：内容抓取

**用户故事：** 作为用户，我想系统自动抓取博主的最新微博，以便我不需要手动去微博查看。

#### 验收标准

1. WHEN 定时任务触发时，THE Scraper SHALL 抓取所有已添加博主的最新微博内容
2. THE Scraper SHALL 为每条微博存储以下字段：微博 ID、正文内容、发布时间、原始链接
3. THE Scraper SHALL 通过微博 ID 去重，只存储上次抓取之后发布的新内容
4. IF 某个博主的抓取失败，THEN THE Scraper SHALL 记录该博主的错误日志，并继续抓取其他博主
5. THE System SHALL 提供手动触发抓取的 API 接口，调用后立即执行一次完整抓取流程

### 需求 3：AI 内容整理

**用户故事：** 作为用户，我想将抓取到的微博内容自动整理成一篇可读的摘要文章，以便我快速了解重要信息。

#### 验收标准

1. WHEN 抓取完成后，THE System SHALL 调用通义千问 API，根据用户配置的 AI 风格将原始微博内容整理成结构化摘要
2. THE System SHALL 在摘要中保留每条原始微博的发布时间和内容要点
3. THE System SHALL 按博主分组组织摘要内容
4. IF 通义千问 API 调用失败，THEN THE System SHALL 将 Digest 状态标记为"failed"并保留原始 Post 数据
5. THE System SHALL 在摘要中为每条引用的微博附带原始链接

### 需求 4：站内消息推送

**用户故事：** 作为用户，我想在每天固定时间在站内收到摘要推送，以便养成阅读习惯。

#### 验收标准

1. THE Scheduler SHALL 支持用户配置每日推送时间，默认值为 08:00
2. WHEN 推送时间到达时，THE System SHALL 在站内消息区域生成一条新的 Notification，关联当日 Digest
3. IF 当日没有新的微博内容，THEN THE System SHALL 生成一条"今日无新动态"的 Notification
4. THE System SHALL 在页面顶部导航栏显示未读 Notification 的数量角标
5. WHEN 用户点击消息角标时，THE System SHALL 展示 Notification 列表面板
6. WHEN 用户点击某条 Notification 时，THE System SHALL 将该 Notification 标记为已读

### 需求 5：摘要浏览

**用户故事：** 作为用户，我想在网页上浏览历史摘要文章，以便回顾之前的内容。

#### 验收标准

1. THE System SHALL 提供历史摘要列表页面，按日期降序排列，支持分页加载
2. WHEN 用户点击某篇摘要时，THE System SHALL 展示完整的摘要 Markdown 内容
3. THE System SHALL 在摘要详情中为每条引用的微博提供可点击的原始链接
4. THE System SHALL 支持按博主筛选历史摘要列表

### 需求 6：用户配置

**用户故事：** 作为用户，我想配置系统的各项参数，以便系统按我的偏好运行。

#### 验收标准

1. THE System SHALL 提供配置界面，允许用户设置每日推送时间（HH:mm 格式）
2. THE System SHALL 允许用户配置 AI 整理风格，可选值为"简洁摘要"或"详细分析"
3. WHEN 用户保存配置时，THE System SHALL 验证推送时间格式为合法的 HH:mm 值
4. WHEN 用户保存合法配置时，THE System SHALL 立即持久化并应用新配置
5. IF 用户提交的配置值不合法，THEN THE System SHALL 返回具体的验证错误信息
