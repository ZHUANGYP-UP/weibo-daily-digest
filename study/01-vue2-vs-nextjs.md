# Vue 2 → Next.js 对照学习笔记

## 项目结构对比

```
Vue 2 项目                    Next.js 项目
─────────                    ──────────
src/                         app/
├── views/Home.vue           ├── page.tsx          （首页）
├── views/About.vue          ├── about/page.tsx    （关于页）
├── components/              components/            （共享组件）
├── store/index.js (Vuex)    store/                 （Zustand）
├── router/index.js          （不需要！文件夹即路由）
├── App.vue                  app/layout.tsx         （全局布局）
├── main.js                  （不需要！Next.js 自动处理）
public/                      public/                （静态资源）
```

## 核心概念对照

| Vue 2 | Next.js (React) | 说明 |
|-------|-----------------|------|
| `<template>` | JSX `return (...)` | 模板写法不同 |
| `data()` | `useState()` | 响应式数据 |
| `computed` | `useMemo()` | 计算属性 |
| `watch` | `useEffect()` | 侦听变化 |
| `methods` | 普通函数 | 方法定义 |
| `mounted()` | `useEffect(() => {}, [])` | 组件挂载 |
| `v-if` | `{condition && <div/>}` | 条件渲染 |
| `v-for` | `{list.map(item => ...)}` | 列表渲染 |
| `v-model` | `value` + `onChange` | 双向绑定 |
| `$emit` | 回调函数 props | 子传父 |
| `props` | props | 父传子（一样） |
| Vuex | Zustand | 全局状态管理 |
| vue-router | 文件系统路由 | 路由方式 |
| axios | axios / fetch | HTTP 请求（一样） |

## 组件写法对比

### Vue 2 写法
```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="count++">点击了 {{ count }} 次</button>
    <ul>
      <li v-for="item in list" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: '你好',
      count: 0,
      list: []
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      const res = await axios.get('/api/list')
      this.list = res.data
    }
  }
}
</script>
```

### Next.js (React) 写法
```tsx
"use client"
import { useState, useEffect } from "react"

export default function MyPage() {
  const [title] = useState("你好")
  const [count, setCount] = useState(0)
  const [list, setList] = useState([])

  // mounted() 的等价写法
  useEffect(() => {
    fetch("/api/list")
      .then(r => r.json())
      .then(setList)
  }, [])  // 空数组 = 只在挂载时执行一次

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => setCount(count + 1)}>
        点击了 {count} 次
      </button>
      <ul>
        {list.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 关键差异

### 1. 没有 v-model，手动绑定
```tsx
// Vue 2: <input v-model="name" />
// React:
const [name, setName] = useState("")
<input value={name} onChange={(e) => setName(e.target.value)} />
```

### 2. 路由不用配置文件
```
Vue 2: router/index.js 里手动写 { path: '/about', component: About }
Next.js: 创建 app/about/page.tsx 文件就自动有了 /about 路由
```

### 3. "use client" 是什么？
Next.js 默认组件在服务端渲染（SSR），加了 "use client" 才在浏览器运行。
需要用 useState、useEffect、onClick 等浏览器功能时必须加。
Vue 2 没有这个概念，所有组件都在浏览器运行。
