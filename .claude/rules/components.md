# 组件约束

适用于 `components/` 和 `app/` 下的页面组件。

## 组件结构

- 使用函数声明 + `export default`
- 页面组件默认 `"use client"`
- `app/layout.tsx` 保持服务端组件
- 共享组件放 `components/` 目录

## 状态与数据

- 局部状态用 `useState`，全局状态用 `zustand`
- 数据获取在 `useEffect` 中完成
- 异步操作必须有 loading 状态反馈
- 错误状态必须展示给用户，禁止静默失败（禁止空 catch）

## 样式

- 使用 Tailwind 工具类，不写自定义 CSS
- 主色用 `primary` / `primary-container` token，禁止硬编码颜色值
- 标题用 `font-headline`，正文用 `font-body`
- 图标用 Material Symbols Outlined (`material-symbols-outlined`)
- 响应式断点用 `md:` 前缀
