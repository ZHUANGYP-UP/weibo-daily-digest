# 数据访问约束

适用于 `prisma/schema.prisma` 和所有使用 Prisma 的代码。

## Prisma 使用

- 必须通过 `@/lib/prisma` 导入单例，禁止自行 `new PrismaClient()`
- Prisma 调用直接写在路由处理器中，不引入 Repository 层
- 分页查询使用 `Promise.all` 并行获取数据和总数
- Settings 单例使用 `upsert` 操作

## Schema 定义

- 新增 Model 必须含中文 Docstring 注释
- 外键关系必须配置 `onDelete` 策略
- 高频查询字段必须添加 `@@index`
- 唯一标识字段必须标记 `@unique`
- 字段命名 camelCase，Model 命名 PascalCase
