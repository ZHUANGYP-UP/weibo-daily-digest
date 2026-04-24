# 项目架构理解

## Vue 2 项目 vs 本项目

```
Vue 2 项目（纯前端）：
  浏览器 → Vue 页面 → axios 请求 → 后端 API（别人写的）

本项目（Next.js 全栈）：
  浏览器 → React 页面 → fetch 请求 → Next.js API Routes → Prisma → SQLite 数据库
                                       ↑ 前后端在同一个项目里！
```

## 数据流

```
用户操作
  ↓
前端页面（app/bloggers/page.tsx）
  ↓ fetch("/api/bloggers", { method: "POST", body: { uid: "xxx" } })
API 路由（app/api/bloggers/route.ts）
  ↓ prisma.blogger.create({ data: { uid, name, avatar } })
数据库（prisma/dev.db）
  ↓ 返回创建的记录
API 路由
  ↓ NextResponse.json(blogger)
前端页面
  ↓ setBloggers([...bloggers, newBlogger])
页面更新
```

## 文件夹职责

```
app/                    页面和 API（Next.js 约定）
├── page.tsx            首页 → 访问 /
├── bloggers/page.tsx   博主页 → 访问 /bloggers
├── history/page.tsx    历史页 → 访问 /history
├── settings/page.tsx   设置页 → 访问 /settings
├── layout.tsx          全局布局（导航栏在这里）
└── api/                后端 API
    ├── bloggers/route.ts       GET/POST /api/bloggers
    ├── bloggers/[id]/route.ts  DELETE /api/bloggers/:id
    ├── digests/route.ts        GET /api/digests
    ├── notifications/route.ts  GET /api/notifications
    ├── settings/route.ts       GET/PUT /api/settings
    └── scrape/route.ts         POST /api/scrape

components/             可复用组件（跟 Vue 2 的 components/ 一样）
├── TopAppBar.tsx       顶部导航栏
├── BottomNav.tsx       底部导航栏
└── NotificationBell.tsx 通知铃铛

lib/                    业务逻辑（Vue 2 里你可能放在 utils/ 或 services/）
├── prisma.ts           数据库连接
├── validation.ts       数据验证
├── scraper.ts          微博抓取（待开发）
├── ai.ts               AI 摘要生成（待开发）
└── scheduler.ts        定时任务（待开发）

store/                  状态管理（= Vue 2 的 store/）

prisma/                 数据库相关
├── schema.prisma       数据表定义（类似 SQL 建表语句）
├── migrations/         迁移记录
└── dev.db              SQLite 数据库文件
```

## API 路由怎么理解？

Vue 2 里你调接口是请求别人的后端服务器。
Next.js 里 app/api/ 下的文件就是后端代码，跟前端在同一个项目。

```typescript
// app/api/bloggers/route.ts
// 这个文件 = 一个后端接口

export async function GET() {        // 处理 GET /api/bloggers
  const bloggers = await prisma.blogger.findMany()
  return NextResponse.json(bloggers) // 返回 JSON
}

export async function POST(req) {    // 处理 POST /api/bloggers
  const { uid } = await req.json()
  const blogger = await prisma.blogger.create({ data: { uid, name: uid } })
  return NextResponse.json(blogger, { status: 201 })
}
```

相当于 Vue 2 项目里后端同事写的 Express/Koa 路由，
只不过现在你自己写，而且跟前端放在一起。
