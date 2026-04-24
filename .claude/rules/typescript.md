# TypeScript 约束

适用于所有 `.ts` / `.tsx` 文件。

## 类型

- 禁止 `any` 类型
- API 响应类型集中定义在 `lib/types.ts`，组件内不再重复定义
- 数据模型类型从 `@prisma/client` 导入，不手动定义
- 函数参数和返回值必须有类型注解

## 导入

- 项目内模块使用 `@/` 路径别名，禁止相对路径跨目录导入
- 导入顺序：Next.js → 外部库 → 内部模块（`@/`） → 类型导入

## 命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `TopAppBar.tsx` |
| 工具/库文件 | camelCase | `validation.ts` |
| API 路由目录 | kebab-case | `bloggers/[id]/route.ts` |
| 变量/函数 | camelCase | `fetchBloggers` |
| 常量 | UPPER_SNAKE_CASE | `PAGE_SIZE` |
| 布尔变量 | is/has 前缀 | `isRead`, `hasMore` |
| 事件处理 | on 前缀 | `onClick`, `onSubmit` |
| 数据获取函数 | fetch/get 前缀 | `fetchBloggers`, `getSettings` |

## 禁止事项

- 禁止硬编码 API Key、密钥等敏感信息
- 禁止空 catch 块（至少 `console.error`）
- 禁止未处理的 Promise（必须 `.catch()` 或 try-catch）
- 禁止魔法数字（提取为命名常量）

## 注释

- 公开接口和复杂逻辑附中文 Docstring（`/** */`），避免复述代码
- 代码内注释用中文
