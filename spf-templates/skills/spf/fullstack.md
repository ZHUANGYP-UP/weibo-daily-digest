# SPF 全栈模式

用于前后端分离项目，生成双工作区结构和 API 契约。

## 与单项目模式的差异

| 维度 | 单项目模式 | 全栈模式 |
|------|-----------|----------|
| 目录结构 | `docs/superpowers/specs/<需求名>.md` | `docs/superpowers/specs/<需求名>/` |
| Spec 文件 | 单文件 | `frontend-spec.md` + `backend-spec.md` + `api-contracts.md` |
| Plan 文件 | 单文件 | `frontend-plan.md` + `backend-plan.md` |
| 执行文件 | 单 `task_plan.md` | `frontend/task_plan.md` + `backend/task_plan.md` |
| 执行顺序 | 线性 | API 契约先行，前后端可并行 |

## 目录结构

**设计阶段**：
```
docs/superpowers/
├── specs/
│   └── <需求名>/
│       ├── frontend-spec.md    # 前端设计规格
│       ├── backend-spec.md     # 后端设计规格
│       └── api-contracts.md    # API 契约定义
└── plans/
    └── <需求名>/
        ├── frontend-plan.md    # 前端实现计划
        └── backend-plan.md     # 后端实现计划
```

**执行阶段**：
```
project/
├── frontend/                   # 前端工作区
│   ├── src/
│   ├── mock/                   # Mock 数据（基于 api-contracts）
│   ├── task_plan.md
│   ├── findings.md
│   └── progress.md
├── backend/                    # 后端工作区
│   ├── src/
│   ├── task_plan.md
│   ├── findings.md
│   └── progress.md
├── shared/
│   └── api-contracts.md        # 契约副本（供双方引用）
└── docs/superpowers/
    └── ...（设计文档）
```

## 全栈流程

```
/spf <需求描述> --fullstack
    │
    ├─→ [Phase 1] 方案探索
    │       └─→ 调用 superpowers:brainstorming
    │               → 额外询问：前后端技术栈、API 风格、认证方式
    │               → 输出: docs/superpowers/specs/<需求名>/
    │                      ├── frontend-spec.md
    │                      ├── backend-spec.md
    │                      └── api-contracts.md
    │       → 自动继续
    │
    ├─→ [Phase 2] 计划生成
    │       └─→ 调用 superpowers:writing-plans（两次调用）
    │               → frontend-plan.md（依赖 api-contracts.md）
    │               → backend-plan.md（定义 api-contracts.md）
    │       → 自动继续
    │
    ├─→ [Phase 3] 格式转换
    │       └─→ 生成双工作区文件
    │               → frontend/task_plan.md, findings.md, progress.md
    │               → backend/task_plan.md, findings.md, progress.md
    │       → 自动继续
    │
    └─→ [Phase 4] 执行
            └─→ 建议执行顺序：
                1. 后端 API 基础设施（生成契约）
                2. 前端 Mock 层（基于契约）
                3. 前后端并行开发
            → 可使用 superpowers:dispatching-parallel-agents 并行执行
```

## API 契约文件模板

`api-contracts.md` 包含：

```markdown
# API 契约

> 版本: 1.0.0
> 最后更新: 2026-03-23
> 后端实现状态: ⏳ 待开发 | 🚧 开发中 | ✅ 已完成

## 校验指令

后端开发完成后运行：
\`\`\`bash
npm run test:api  # 或你的 API 测试命令
\`\`\`

前端联调前检查：
\`\`\`bash
# 确认后端实现状态为 ✅
grep "后端实现状态" shared/api-contracts.md
\`\`\`

---

## 基础信息
- Base URL: `/api/v1`
- 认证方式: Bearer JWT
- 数据格式: JSON

## 接口列表

### 用户认证
| 方法 | 路径 | 描述 | 请求体 | 响应体 | 状态 |
|------|------|------|--------|--------|------|
| POST | /auth/login | 登录 | LoginRequest | AuthResponse | ⏳ |
| POST | /auth/register | 注册 | RegisterRequest | AuthResponse | ⏳ |

### 数据类型

\`\`\`typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: UserProfile;
}
\`\`\`
```

**契约变更流程**：

1. 变更契约时更新版本号（1.0.0 → 1.1.0）
2. 通知相关方（前端/后端）
3. 后端完成后更新"后端实现状态"为 ✅
4. 前端联调前确认状态

## 执行策略

**推荐执行顺序：**

1. **后端先行** - 先实现 API 契约中定义的接口
2. **前端 Mock** - 基于契约生成 Mock，前端可并行开发
3. **联调集成** - 后端完成后，前端切换到真实 API

**并行执行：**

使用 `superpowers:dispatching-parallel-agents` 技能：
- Agent A: 后端开发（在 `backend/` 目录）
- Agent B: 前端开发（在 `frontend/` 目录，使用 Mock）

并行执行示例：
```
# 启动并行 agent
调用 superpowers:dispatching-parallel-agents
  - Task 1: 后端开发（读取 backend/task_plan.md，工作目录 backend/）
  - Task 2: 前端开发（读取 frontend/task_plan.md，工作目录 frontend/）
```

## 目录初始化

```bash
# 单项目模式
mkdir -p docs/superpowers/specs docs/superpowers/plans

# 全栈模式
mkdir -p docs/superpowers/specs/<需求名> docs/superpowers/plans/<需求名>
```

## Brainstorming 额外询问

当 `--fullstack` 时，brainstorming 阶段需额外确认：
- 前端技术栈（React/Vue/Angular 等）
- 后端技术栈（Node/Go/Java/Python 等）
- API 风格（REST/GraphQL/gRPC）
- 认证方式（JWT/Session/OAuth 等）
- 数据库选择（PostgreSQL/MySQL/MongoDB 等）
