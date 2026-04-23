-- =============================================
-- 微博每日摘要系统 - 数据库建表脚本 (SQLite)
-- =============================================

-- 博主表：存储用户关注的微博博主信息
CREATE TABLE IF NOT EXISTS "Blogger" (
    "id"        TEXT NOT NULL PRIMARY KEY,   -- cuid 主键
    "uid"       TEXT NOT NULL UNIQUE,        -- 微博 UID，唯一标识
    "name"      TEXT NOT NULL,               -- 博主昵称
    "avatar"    TEXT,                        -- 头像 URL
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 原始微博表：从微博抓取的单条内容
CREATE TABLE IF NOT EXISTS "Post" (
    "id"          TEXT NOT NULL PRIMARY KEY, -- cuid 主键
    "bloggerId"   TEXT NOT NULL,             -- 关联博主 ID
    "weiboId"     TEXT NOT NULL UNIQUE,      -- 微博原始 ID，用于去重
    "content"     TEXT NOT NULL,             -- 正文内容
    "publishedAt" DATETIME NOT NULL,         -- 发布时间
    "url"         TEXT NOT NULL,             -- 原始微博链接
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_bloggerId_fkey"
        FOREIGN KEY ("bloggerId") REFERENCES "Blogger"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Post_bloggerId_idx" ON "Post"("bloggerId");
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- 摘要表：AI 生成的每日摘要文章
CREATE TABLE IF NOT EXISTS "Digest" (
    "id"         TEXT NOT NULL PRIMARY KEY,  -- cuid 主键
    "date"       TEXT NOT NULL UNIQUE,       -- 日期 YYYY-MM-DD，每天最多一条
    "title"      TEXT,                       -- 摘要标题
    "content"    TEXT,                       -- AI 生成的摘要 Markdown，failed 时为 null
    "rawPostIds" TEXT NOT NULL,              -- 关联的 Post ID 列表（JSON 数组字符串）
    "status"     TEXT NOT NULL DEFAULT 'pending', -- pending | done | failed
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Digest_date_idx" ON "Digest"("date");
CREATE INDEX "Digest_status_idx" ON "Digest"("status");

-- 站内消息通知表
CREATE TABLE IF NOT EXISTS "Notification" (
    "id"        TEXT NOT NULL PRIMARY KEY,   -- cuid 主键
    "digestId"  TEXT UNIQUE,                 -- 关联 Digest，"今日无新动态"时为 null
    "title"     TEXT NOT NULL,               -- 通知标题
    "body"      TEXT,                        -- 通知摘要描述
    "type"      TEXT NOT NULL DEFAULT 'digest', -- digest | alert | system
    "isRead"    BOOLEAN NOT NULL DEFAULT 0,  -- 是否已读
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_digestId_fkey"
        FOREIGN KEY ("digestId") REFERENCES "Digest"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- 用户配置表（单例模式）
CREATE TABLE IF NOT EXISTS "Settings" (
    "id"       TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "pushTime" TEXT NOT NULL DEFAULT '08:00',    -- 每日推送时间 HH:mm
    "aiStyle"  TEXT NOT NULL DEFAULT 'concise'   -- concise | detailed
);

-- 初始化默认配置
INSERT OR IGNORE INTO "Settings" ("id", "pushTime", "aiStyle")
VALUES ('singleton', '08:00', 'concise');
