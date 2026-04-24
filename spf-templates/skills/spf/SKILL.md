---
name: spf
description: superpowers + planning-with-files 流水线 - 新项目开发全流程编排，支持项目 Wiki 知识库实现跨迭代知识累积
triggers:
  - command: /spf
  - intent: 新项目开发、完整开发流程、方案探索到实现
---

# SPF 流程编排技能

## 执行规则（HARD RULES）

<HARD-GATE>
SPF 是编排层。以下规则优先级高于所有子技能的内置跳转指令。

1. **SPF 控制流程流转** - 子技能完成后控制权必须返回 SPF，由 SPF 决定下一步
2. **禁止子技能自行跳转** - brainstorming 完成后不得自行调用 writing-plans；writing-plans 完成后不得自行提供 Execution Handoff 选择
3. **每个 Phase 必须更新状态文件** - 开始时写 `in_progress`，完成时写 `complete`，写入 `.spf/state.json`
4. **Phase 按顺序执行** - 0 → 1 → 1.5 → 2 → 2.5 → 3 → 4 → 4.5，不得跳过（除非参数指定）
5. **关键产出物需确认** - Phase 间自动流转，但 Spec（Phase 1 完成后）和 Plan（Phase 2 完成后）需通过 AskUserQuestion 让用户确认后再继续
6. **Phase 4 必须委托执行** - Phase 4 的代码实现 MUST 通过 `Agent(subagent_type: "spf-executor")` 完成，SPF 编排层 NEVER 直接编辑代码文件
</HARD-GATE>

**状态更新模式**：每个 Phase 开始时设 `current_phase: "phase_N"` + `phases.phase_N.status: "in_progress"`，完成时设 `status: "complete"`。下文各 Phase 不再重复此模式。

## 参数说明

| 参数 | 说明 |
|------|------|
| `<需求描述>` | 功能需求描述 |
| `--skip-brainstorm` | 跳过 Phase 1，直接进入 Phase 2 |
| `--from-plan <路径>` | 从已有 plan 开始，跳过 Phase 1/2 |
| `--execute-only` | 仅执行（已有 task_plan.md），跳到 Phase 4 |
| `--fullstack` | 全栈模式，前后端分离项目 |
| `--wiki-lint` | 校验 Wiki 完整性，不执行流程 |

## Step 1: 参数解析 + 目录初始化

解析用户输入提取 requirement 和标志位。创建必要目录：

```bash
mkdir -p .spf docs/superpowers/specs docs/superpowers/plans docs/superpowers/wiki
# 全栈模式: mkdir -p .spf docs/superpowers/{specs,plans}/<需求名>
```

初始化 Wiki 基础文件（如不存在）：
```bash
# index.md（如不存在）
if [ ! -f docs/superpowers/wiki/index.md ]; then
  cat > docs/superpowers/wiki/index.md << 'EOF'
# SPF Wiki 索引

## Spec 摘要
| 页面 | 说明 | 日期 |
|------|------|------|

## Plan 摘要
| 页面 | 说明 | 日期 |
|------|------|------|

## 经验
| 页面 | 说明 | 日期 |
|------|------|------|

## 实体
| 页面 | 说明 |
|------|------|

## 概念
| 页面 | 说明 |
|------|------|
EOF
fi

# log.md（如不存在）
if [ ! -f docs/superpowers/wiki/log.md ]; then
  cat > docs/superpowers/wiki/log.md << 'EOF'
# SPF Wiki 操作日志
EOF
fi
```

初始化 `.spf/state.json`（如不存在）：`{ "requirement": "...", "current_phase": "step_1", "phases": {}, "artifacts": {} }`

## Step 2: 状态检测与恢复

读取 `.spf/state.json` 判断恢复点：
- **有状态文件**：
  - 找最后一个 `complete` 的 phase 从下一个继续
  - `in_progress` 的从该 phase 重新开始
  - `artifacts` 中的文件路径可复用
  - **可读取 `artifacts.spec_path` 指向的 spec 文件了解设计决策背景**
  - **可读取 `artifacts.plan_path` 指向的 plan 文件了解执行计划**
- **无状态文件（fallback）**：按文件存在性检测 → `task_plan.md` 存在从 Phase 4，`plans/*.md` 从 Phase 3，`specs/*.md` 从 Phase 2，否则从 Phase 0（全栈模式对应检查 `frontend/`/`backend/` 下的文件）
- **参数覆盖**：`--execute-only` → Phase 4，`--from-plan` → Phase 3，`--skip-brainstorm` → Phase 2，`--wiki-lint` → 仅校验 Wiki

## Phase 0: 上下文加载

**条件**: `not execute_only`

1. 检查 Wiki 是否存在且有内容：读取 `docs/superpowers/wiki/index.md`，如无条目则输出 "Wiki 为空，跳过上下文加载" 并跳过
2. 调用 `spf-resource recall "<需求描述>"` 检索 Wiki 中的相关 spec/plan/经验
3. **更新状态文件**：将检索结果写入 `.spf/state.json` 的 `phases.phase_0`：
   ```json
   {
     "status": "complete",
     "loaded_context": "<简要总结检索发现，1-2 句话>"
   }
   ```
   检索结果已被主代理看到并内化为决策上下文，无需在 state.json 中持久化完整 results 数组。

**下一步**: `--wiki-lint` → 校验 Wiki 完整性后结束；`--skip-brainstorm` → Phase 2；否则 → Phase 1

## Phase 1: 方案探索

**条件**: `not skip_brainstorm and not from_plan and not execute_only`

<SPF-OVERRIDE>
Phase 1 采用子代理执行模式，保护主上下文。

**执行流程**:

### 1. 初始化 Phase 1 状态

在 `.spf/state.json` 的 `phases.phase_1` 中初始化：

```json
{
  "status": "in_progress",
  "iteration": 0,
  "exploration_summary": "",
  "design_context": {
    "understood_requirements": [],
    "confirmed_decisions": [],
    "pending_questions": []
  },
  "qna_history": [],
  "output": null
}
```

创建临时工作文件 `.spf/brainstorm-session.json`（仅用于子代理通信）：
```json
{
  "requirement": "<需求描述>",
  "status": "in_progress",
  "iteration": 0,
  "exploration_summary": "",
  "design_context": { ... },
  "current_questions": [],
  "answers": [],
  "output": null
}
```

### 2. 循环执行

```
循环直到 session.status === "complete":
  1. 递增迭代计数 (iteration += 1)，更新 session 文件
  2. 启动子代理：
     Agent(
       subagent_type: "spf-brainstormer",
       description: "探索需求: <需求描述>",
       prompt: "会话文件: .spf/brainstorm-session.json\n主状态文件: .spf/state.json\n项目目录: <pwd>"
     )
  3. 读取 session 文件的 status 字段
  4. 如果 status === "need_input":
     - 读取 current_questions
     - 使用 AskUserQuestion 向用户提问（一次一个问题）
     - 将回答追加到 session.answers
     - 追加到状态文件的 phases.phase_1.qna_history
  5. 如果 status === "complete":
     - 将 session 内容合并到 .spf/state.json 的 phases.phase_1
     - 删除 .spf/brainstorm-session.json
     - 退出循环
```

### 3. 合并状态

将子代理的探索结果写入 `.spf/state.json`：

```json
{
  "phases": {
    "phase_1": {
      "status": "complete",
      "output": { "spec_path": "..." }
    }
  },
  "artifacts": { "spec_path": "..." }
}
```

探索细节已写入 spec 文档（`artifacts.spec_path`），无需在 state.json 中重复保留。

**SPF 跳过的步骤**:
- Spec Review Loop - 不 dispatch spec-document-reviewer
- User Review Gate - 由 SPF 编排层在 Phase 1 完成后统一处理
- 调用 writing-plans - 由 SPF 编排层控制流转

**上下文保护**: 主代理不读取项目的探索细节，只处理问答中转。

**全栈模式**: 子代理生成 `frontend-spec.md` + `backend-spec.md` + `api-contracts.md`
</SPF-OVERRIDE>

**输出**: `docs/superpowers/specs/<需求名>.md`（全栈: `specs/<需求名>/` 目录），记录到 `artifacts.spec_path`

**用户确认**: Spec 文档生成后，使用 AskUserQuestion 向用户展示 spec 路径并询问：
- 选项 1: "确认，继续生成 Plan"
- 选项 2: "需要修改"（用户可描述修改意见，SPF 重新启动 brainstormer 子代理修订）

**下一步**: Phase 1.5

## Phase 1.5 / 2.5: 持久化

Phase 1.5（Spec）和 Phase 2.5（Plan）结构相同：

- **条件**: 前序 Phase 完成
- **操作**: 通过子代理执行 Wiki 导入
  ```
  Agent(
    subagent_type: "spf-wikier",
    description: "导入 <spec|plan> 到 Wiki",
    prompt: "源文件: <artifact_path>\n类型: <spec|plan>\n项目目录: <pwd>"
  )
  ```
  全栈模式传目录路径。子代理返回后输出导入摘要。
- **下一步**: Phase 1.5 → Phase 2，Phase 2.5 → Phase 3

## Phase 2: 计划生成

**条件**: `not from_plan and not execute_only`

调用 `superpowers:writing-plans` 技能。

<SPF-OVERRIDE>
覆盖 writing-plans 流程：

- 执行计划生成流程
- **跳过 Plan Review Loop** - 不 dispatch plan-document-reviewer，用户确认由 SPF 编排层在 Phase 2 完成后处理
- **跳过 Execution Handoff** - 不询问用户选择执行方式
- 计划保存后控制权返回 SPF

以下 writing-plans 指令在 SPF 中无效：
- "dispatch plan-document-reviewer subagent"
- "offer execution choice"
- "Two execution options: 1. Subagent-Driven 2. Inline Execution"
- "REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development"
- "REQUIRED SUB-SKILL: Use superpowers:executing-plans"

SPF 中 writing-plans 终态 = plan 保存到文件 → 返回 SPF。
</SPF-OVERRIDE>

**全栈模式**: 调用两次，分别生成 `frontend-plan.md` 和 `backend-plan.md`

**输出**: `docs/superpowers/plans/<需求名>.md`（全栈: `plans/<需求名>/` 目录），记录到 `artifacts.plan_path`

**用户确认**: Plan 文档生成后，使用 AskUserQuestion 向用户展示 plan 路径并询问：
- 选项 1: "确认，开始执行"
- 选项 2: "需要修改"（用户可描述修改意见，SPF 重新调用 writing-plans 修订）

**下一步**: Phase 2.5

## Phase 3: Plan 预处理

**条件**: `not execute_only`

确认 plan 文件头部包含 planning-with-files 指令行：
```
> **For agentic workers:** REQUIRED SKILL: Use planning-with-files to implement this plan task-by-task.
```
缺失则补上。不生成 task_plan.md / findings.md / progress.md（由 Phase 4 自动创建）。

**全栈模式**: 将 `api-contracts.md` 复制到 `shared/` 目录。

**下一步**: Phase 4

## Phase 4: 执行

<SPF-OVERRIDE>
Phase 4 是纯委托阶段。SPF 编排层的唯一职责是启动和监控 spf-executor 子代理。

**强制约束**:
- SPF MUST 通过 `Agent(subagent_type: "spf-executor")` 执行所有代码实现
- SPF NEVER 直接使用 Edit/Write/Bash 等工具修改项目代码文件
- SPF 在 Phase 4 中允许的操作仅限：读取文件、更新 `.spf/state.json`、启动/重启子代理、TaskCreate/TaskUpdate 可视化进度

以下思维模式在 Phase 4 中无效（反模式）:
- "任务比较简单，我直接实现更快"
- "不需要启动子代理，我可以直接编辑代码"
- "先实现几个简单任务，复杂的再交给子代理"
- "子代理开销太大，直接执行更高效"
</SPF-OVERRIDE>

### 4.0 任务计数与模式选择

1. 读取 plan 文件（`artifacts.plan_path`），统计所有 `### Task` 级别的叶子任务数（不含 `## Phase` 分组标题）
2. 模式选择（`BATCH_SIZE=4`）：
   - `task_count <= BATCH_SIZE`: **单批次模式**（全部交给一个子代理）
   - `task_count > BATCH_SIZE`: **分批模式**，按 `BATCH_SIZE` 按 Task 粒度分块

将选择结果写入 `.spf/state.json` 的 `phases.phase_4`：
```json
{
  "status": "in_progress",
  "mode": "single|batch",
  "task_count": N,
  "batches": []
}
```

### 4.1 单批次模式（task_count <= BATCH_SIZE）

**单项目模式**:
1. 读取 plan 文件（`artifacts.plan_path`），提取任务摘要
2. MUST 使用 Agent 工具启动子代理：
   ```
   Agent(subagent_type: "spf-executor", description: "执行 <需求描述>", prompt: "Plan 文件: <plan_path>\n项目目录: <pwd>")
   ```
3. 子代理返回后，读取 `progress.md` 和 `task_plan.md` 检查完成状态
4. 未完成则重新启动子代理（最多 3 轮）

**全栈模式**: 后端优先 → 前端 Mock → 并行开发（可用 `dispatching-parallel-agents`）→ 联调集成

### 4.2 分批模式（task_count > BATCH_SIZE）

#### 4.2.1 分批初始化

1. 按 `BATCH_SIZE=4` 顺序分块（plan 本身已按依赖顺序排列，无需额外分析）
2. 批次信息写入 `.spf/state.json` 的 `phases.phase_4.batches`：
   ```json
   {
     "batches": [
       { "id": 1, "phases": "1-4", "status": "pending", "retry_count": 0 },
       { "id": 2, "phases": "5-8", "status": "pending", "retry_count": 0 },
       { "id": 3, "phases": "9-10", "status": "pending", "retry_count": 0 }
     ]
   }
   ```
3. 用 TaskCreate 为每个批次创建 UI todolist 条目：
   ```
   subject: "执行 Phase {start}-{end}（批次 {id}/{total}）"
   description: "执行 plan 中的 Phase {start} 到 Phase {end}"
   ```

#### 4.2.2 批次循环

```
for each batch in batches:
  1. 更新 .spf/state.json phases.phase_4.current_batch = batch.id
  2. TaskUpdate 标记当前批次 in_progress
  3. 构造批次 prompt（见 4.2.3）
  4. Agent(subagent_type: "spf-executor", description: "执行批次 {id}: Phase {start}-{end}", prompt: batch_prompt)
  5. 读取 task_plan.md 检查本批次范围内任务的完成状态
  6. 全部 complete → TaskUpdate 标记完成 → 生成 .spf/batch-context.md（见 4.2.4）
  7. 有未完成且 retry_count < 2:
     - retry_count += 1
     - 缩小范围到失败任务，构造重试 prompt（含失败原因）
     - 重新启动子代理
  8. 重试 2 次仍失败 → AskUserQuestion 询问用户是否继续
```

#### 4.2.3 批次 Prompt 构造

- **首批次**: `"Plan 文件: <plan_path>\n项目目录: <pwd>\n执行范围: Phase {start}-{end}"`
- **后续批次**: `"Plan 文件: <plan_path>\n项目目录: <pwd>\n执行范围: Phase {start}-{end}\n前序上下文: .spf/batch-context.md"`
- **重试**: `"Plan 文件: <plan_path>\n项目目录: <pwd>\n执行范围: Phase {failed_start}-{failed_end}\n前序上下文: .spf/batch-context.md\n重试原因: <从 task_plan.md 错误表提取>"`

#### 4.2.4 批次交接上下文 .spf/batch-context.md

每个批次完成后由 SPF 编排层生成（覆盖更新）：

```markdown
# Batch Context (auto-generated)
> Updated: YYYY-MM-DD after Batch {id}

## Completed
- Phase N: <摘要> (commit: abc1234)

## Key Findings
- <从 findings.md 提取最近关键发现>

## Files Created/Modified
- <从 progress.md 提取本批次文件变更>
```

### 4.3 完成检查

所有批次完成后：
1. 读取 `task_plan.md` 做最终检查
2. 更新 `.spf/state.json` `phases.phase_4.status: "complete"`
3. 删除 `.spf/batch-context.md`（清理临时文件）

**下一步**: Phase 4.5

## Phase 4.5: 经验沉淀 + 规划文件压缩

**条件**: Phase 4 完成

### 4.5.1 经验沉淀

**条件**: 检测到重要决策/坑点

1. 回顾迭代，提取关键经验（架构决策、踩坑记录、复用模式）
2. 生成经验文档（模板见 [experience-template.md](./references/experience-template.md)）
3. 持久化：通过子代理执行 Wiki 导入
   ```
   Agent(
     subagent_type: "spf-wikier",
     description: "导入经验到 Wiki",
     prompt: "源文件: docs/superpowers/experiences/<主题>.md\n类型: experience\n项目目录: <pwd>"
   )
   ```

### 4.5.2 规划文件压缩

**条件**: 当前迭代所有 Phase 已完成，且规划文件总行数 >= 1000

检测方式：
```bash
total=$(( $(wc -l < task_plan.md 2>/dev/null || echo 0) + $(wc -l < progress.md 2>/dev/null || echo 0) + $(wc -l < findings.md 2>/dev/null || echo 0) ))
```
total < 1000 时跳过压缩，输出提示"规划文件总行数 < 1000，跳过压缩"。

通过子代理执行压缩，保护主上下文：
Agent(
  subagent_type: "spf-compact",
  description: "压缩规划文件",
  prompt: "项目目录: <pwd>"
)
子代理返回后，更新 state.json 标记 Phase 4.5 完成。

## 全栈模式

`--fullstack` 的目录结构、API 契约模板和执行策略参见 [fullstack.md](./fullstack.md)。核心差异：目录按 `<需求名>/` 组织，Spec/Plan 各生成前后端两份，执行按"API 契约先行 → 后端 → 前端 → 联调"顺序。

## 参考文档

- [fullstack.md](./fullstack.md) - 全栈模式详细规范
- [wiki-guide.md](./wiki-guide.md) - Wiki 知识库使用指南
- [experience-template.md](./references/experience-template.md) - 经验文档模板
- [compact-planning-files.md](./references/compact-planning-files.md) - 规划文件压缩规程
