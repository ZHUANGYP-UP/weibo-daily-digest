# 生命周期对比

## Vue 2 有 8 个生命周期，React 用 useEffect 一个搞定

```
Vue 2 生命周期              React (useEffect)
─────────────              ─────────────────

beforeCreate  ─┐
created       ─┘           （函数体本身就是，代码直接写在组件函数里）

beforeMount                 （没有对应，一般不需要）

mounted       ────────→    useEffect(() => { ... }, [])

beforeUpdate               （没有对应，一般不需要）

updated       ────────→    useEffect(() => { ... })  // 无依赖数组

beforeDestroy              （没有对应）

destroyed     ────────→    useEffect(() => { return () => { 清理 } }, [])
```

## 逐个对比

### 1. mounted → useEffect(fn, [])

页面加载后请求数据，最常用的：

```js
// Vue 2
export default {
  data() { return { list: [] } },
  mounted() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      const res = await axios.get('/api/bloggers')
      this.list = res.data
    }
  }
}
```

```tsx
// React
export default function Page() {
  const [list, setList] = useState([])

  useEffect(() => {
    fetch('/api/bloggers')
      .then(r => r.json())
      .then(setList)
  }, [])  // ← 空数组 = 只执行一次 = mounted

  return <div>...</div>
}
```

### 2. watch → useEffect(fn, [依赖])

监听某个值变化时执行：

```js
// Vue 2
watch: {
  userId(newVal) {
    this.fetchUser(newVal)
  }
}
```

```tsx
// React
const [userId, setUserId] = useState("")

useEffect(() => {
  if (userId) fetchUser(userId)
}, [userId])  // ← userId 变化时执行 = watch
```

### 3. destroyed → useEffect 的 return

组件销毁时清理（定时器、事件监听等）：

```js
// Vue 2
mounted() {
  this.timer = setInterval(this.poll, 5000)
},
beforeDestroy() {
  clearInterval(this.timer)
}
```

```tsx
// React
useEffect(() => {
  const timer = setInterval(poll, 5000)
  return () => clearInterval(timer)  // ← return 的函数 = beforeDestroy
}, [])
```

### 4. created → 直接写在函数体里

```js
// Vue 2
created() {
  console.log('组件创建了')
  this.initSomething()
}
```

```tsx
// React — 函数组件每次渲染都会执行函数体
export default function Page() {
  // 这里的代码相当于 created，但注意每次渲染都会跑
  console.log('组件渲染了')

  // 如果只想跑一次，还是用 useEffect
  useEffect(() => {
    initSomething()
  }, [])
}
```

## useEffect 的三种用法总结

```tsx
// 1. mounted（只执行一次）
useEffect(() => {
  // 页面加载后执行
}, [])  // 空数组

// 2. watch（依赖变化时执行）
useEffect(() => {
  // userId 变了就执行
}, [userId])  // 指定依赖

// 3. updated（每次渲染后都执行）— 少用
useEffect(() => {
  // 每次渲染后都执行
})  // 不传数组

// 4. destroyed（清理函数）
useEffect(() => {
  const timer = setInterval(fn, 1000)
  return () => clearInterval(timer)  // 组件卸载时执行
}, [])
```

## 项目里的实际用法

看 `components/NotificationBell.tsx`：
```tsx
useEffect(() => {
  fetchNotifications()  // 组件挂载后拉通知数据
}, [])                  // 空数组 = mounted，只跑一次
```

看 `app/settings/page.tsx`：
```tsx
useEffect(() => {
  fetch("/api/settings")
    .then(r => r.json())
    .then(data => {
      setPushTime(data.pushTime)  // 页面加载后读取配置
      setAiStyle(data.aiStyle)
    })
}, [])
```

## 一句话记忆

Vue 2 的生命周期是"不同阶段不同函数"，
React 是"一个 useEffect 通过第二个参数控制什么时候跑"。


## 多个 useEffect 拆分写（重要）

一个组件里可以写多个 useEffect，按职责拆开，每个只管一件事：

```tsx
export default function MyPage() {
  const [data, setData] = useState([])
  const [userId, setUserId] = useState("")

  // 1. mounted — 页面加载拉数据
  useEffect(() => {
    fetch("/api/data").then(r => r.json()).then(setData)
  }, [])

  // 2. watch userId — 用户切换时重新拉
  useEffect(() => {
    if (userId) fetch(`/api/user/${userId}`)
  }, [userId])

  // 3. 定时器 + 清除
  useEffect(() => {
    const timer = setInterval(() => console.log("polling"), 5000)
    return () => clearInterval(timer)
  }, [])

  return <div>...</div>
}
```

### 对比 Vue 2

Vue 2 只能有一个 `mounted()`、一个 `watch` 对象，所有逻辑混在一起：

```js
// Vue 2 — 所有逻辑挤在一起
export default {
  mounted() {
    this.fetchData()           // 拉数据
    this.timer = setInterval(this.poll, 5000)  // 定时器也塞这里
  },
  watch: {
    userId(val) { this.fetchUser(val) },  // 所有 watch 挤一个对象
    keyword(val) { this.search(val) },
  },
  beforeDestroy() {
    clearInterval(this.timer)  // 清理也要单独写一个生命周期
  }
}
```

React 的好处：每个 useEffect 自包含（逻辑 + 清理在一起），互不干扰，更容易维护。
