# package.json 详解

## scripts（命令脚本）

你在 Vue 2 里常用 `npm run serve`，这里对应关系：

```json
"scripts": {
  "dev": "next dev",        // npm run dev → 启动开发服务器（= npm run serve）
  "build": "next build",    // npm run build → 打包（一样）
  "start": "next start",    // npm run start → 启动生产服务器
  "lint": "next lint",      // npm run lint → 代码检查
  "db:migrate": "prisma migrate dev",  // 数据库迁移
  "db:studio": "prisma studio",        // 数据库可视化界面
  "db:generate": "prisma generate"     // 生成 ORM 代码
}
```

## dependencies vs devDependencies

```
dependencies     → 生产环境需要的包（会被打包）
devDependencies  → 只在开发时用（不会打包进去）
```

安装时的区别：
```bash
npm install axios          # 装到 dependencies
npm install -D tailwindcss # 装到 devDependencies（-D 是简写）
```

## 版本号含义

```
"next": "^14.2.35"
         │ │  │
         │ │  └── 补丁版本（bug 修复）
         │ └───── 次版本（新功能，向后兼容）
         └─────── 主版本（可能有破坏性变更）

^ 符号含义：允许自动升级次版本和补丁版本，但不升级主版本
  ^14.2.35 → 可以升到 14.9.99，但不会升到 15.0.0
```

## 本项目各依赖的作用

### 框架核心
| 包 | 作用 | Vue 2 对应 |
|----|------|-----------|
| next | 全栈框架 | vue + vue-cli + vue-router |
| react | UI 库 | vue |
| react-dom | DOM 渲染 | vue 内置 |

### 状态管理
| 包 | 作用 | Vue 2 对应 |
|----|------|-----------|
| zustand | 全局状态 | vuex |

### 后端（Vue 2 纯前端项目没有这些）
| 包 | 作用 |
|----|------|
| @prisma/client | 数据库 ORM，写 JS 代码操作数据库 |
| prisma | 数据库迁移工具 |
| node-cron | 定时任务，类似 Linux crontab |
| openai | 调用 AI 接口的 SDK |

### 工具
| 包 | 作用 | Vue 2 对应 |
|----|------|-----------|
| axios | HTTP 请求 | 一样 |
| typescript | 类型检查 | 可选 |
| tailwindcss | CSS 框架 | Element UI / 手写 CSS |
