Vercel React 最佳实践 — React/Next.js 性能优化指南。

参数: $ARGUMENTS

---

# Vercel React 最佳实践

由 Vercel 维护的 React/Next.js 应用综合性能优化指南。8 个类别 70 条规则，按影响力排序。

## 规则参考

详细规则文件位于 `.claude/references/vercel-react-rules/`。

## 按优先级分类

| 优先级 | 类别 | 影响 | 前缀 |
|--------|------|------|------|
| 1 | 消除瀑布流 | 关键 | `async-` |
| 2 | 包大小优化 | 关键 | `bundle-` |
| 3 | 服务端性能 | 高 | `server-` |
| 4 | 客户端数据获取 | 中高 | `client-` |
| 5 | 重渲染优化 | 中 | `rerender-` |
| 6 | 渲染性能 | 中 | `rendering-` |
| 7 | JavaScript 性能 | 低中 | `js-` |
| 8 | 高级模式 | 低 | `advanced-` |

## 快速参考

### 消除瀑布流（关键）
- await 前先检查低成本同步条件
- 将 await 移到实际使用的分支
- 独立操作用 Promise.all()
- API 路由中尽早启动 promise
- 使用 Suspense 流式传输

### 包大小优化（关键）
- 直接导入，避免桶文件
- 重型组件用 next/dynamic
- 水合后加载分析/日志
- 悬停/聚焦时预加载

### 服务端性能（高）
- 像 API 路由一样认证服务器操作
- 用 React.cache() 去重
- 用 LRU 缓存跨请求
- 最小化传给客户端的数据
- 并行化获取

### 重渲染优化（中）
- 不要订阅仅在回调中使用的状态
- 昂贵工作提取到 memo 组件
- 派生状态在渲染期间计算，不用 effects
- 函数式 setState 获得稳定回调
- 非紧急更新用 startTransition

### JavaScript 性能（低中）
- 批量 CSS 变更
- Map/Set 做 O(1) 查找
- 循环中缓存属性
- 提前返回
- flatMap 一次完成映射和过滤
