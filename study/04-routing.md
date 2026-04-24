# Next.js 路由 vs Vue 2 路由

## 两种跳转方式

### 方式1：Link 组件（= Vue 2 的 `<router-link>`）

```tsx
// Vue 2
<router-link to="/bloggers">去博主页</router-link>

// Next.js
import Link from "next/link"
<Link href="/bloggers">去博主页</Link>
```

项目里 BottomNav.tsx 就是这么用的：
```tsx
<Link href="/bloggers">博主</Link>
<Link href="/history">历史</Link>
<Link href={`/history/${digest.id}`}>查看详情</Link>
```

### 方式2：编程式导航（= Vue 2 的 `this.$router.push()`）

```tsx
// Vue 2
this.$router.push("/bloggers")
this.$router.push({ path: "/history", query: { page: 2 } })
this.$router.replace("/settings")
this.$router.go(-1)  // 后退

// Next.js
"use client"
import { useRouter } from "next/navigation"

export default function MyPage() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/bloggers")              // 跳转（有历史记录）
    router.push("/history?page=2")        // 带参数跳转
    router.replace("/settings")           // 替换（无历史记录）
    router.back()                         // 后退
    router.refresh()                      // 刷新当前页数据
  }

  return <button onClick={handleClick}>跳转</button>
}
```

## 实际例子：添加博主后跳转

```tsx
// Vue 2 写法
methods: {
  async addBlogger() {
    await axios.post("/api/bloggers", { uid: this.uid })
    this.$router.push("/bloggers")
  }
}

// Next.js 写法
import { useRouter } from "next/navigation"

export default function AddBlogger() {
  const router = useRouter()

  const addBlogger = async () => {
    await fetch("/api/bloggers", {
      method: "POST",
      body: JSON.stringify({ uid }),
    })
    router.push("/bloggers")  // 跳转到博主列表
  }
}
```

## 动态路由（= Vue 2 的 `:id` 参数）

```
Vue 2:   router 配置 { path: '/history/:id', component: Detail }
         取参数：this.$route.params.id

Next.js: 创建文件 app/history/[id]/page.tsx（方括号 = 动态参数）
         取参数：
```

```tsx
// Vue 2
this.$route.params.id
this.$route.query.page

// Next.js
import { useParams, useSearchParams } from "next/navigation"

export default function DetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const id = params.id                    // 路径参数 /history/abc → "abc"
  const page = searchParams.get("page")   // 查询参数 ?page=2 → "2"
}
```

## 获取当前路由路径（= Vue 2 的 `this.$route.path`）

```tsx
// Vue 2
this.$route.path      // "/bloggers"
this.$route.name      // "bloggers"

// Next.js
import { usePathname } from "next/navigation"

export default function MyComponent() {
  const pathname = usePathname()  // "/bloggers"
}
```

项目里 BottomNav.tsx 就用了这个来判断当前高亮哪个 tab：
```tsx
const pathname = usePathname()
const isActive = pathname === "/bloggers"  // 当前是否在博主页
```

## 总结对照表

| 功能 | Vue 2 | Next.js |
|------|-------|---------|
| 声明式跳转 | `<router-link to="/x">` | `<Link href="/x">` |
| 编程式跳转 | `this.$router.push("/x")` | `router.push("/x")` |
| 替换跳转 | `this.$router.replace("/x")` | `router.replace("/x")` |
| 后退 | `this.$router.go(-1)` | `router.back()` |
| 路径参数 | `this.$route.params.id` | `useParams().id` |
| 查询参数 | `this.$route.query.page` | `useSearchParams().get("page")` |
| 当前路径 | `this.$route.path` | `usePathname()` |
| 路由配置 | `router/index.js` 手动配 | 文件夹结构自动生成 |
