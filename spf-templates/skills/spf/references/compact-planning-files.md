# 规划文件压缩规程

## 概述

planning-with-files 的 hooks 在每次工具调用和用户消息时自动注入 task_plan.md / progress.md 的内容。经过多次 SPF 迭代，这些文件不断追加累积，导致上下文膨胀。

本规程定义如何压缩这些文件，确保 hooks 注入的内容始终精简。

## Hook 读取行为（不可修改）

| Hook | 读取内容 | 频率 |
|------|---------|------|
| PreToolUse | `head -30 task_plan.md` | 每次工具调用 |
| UserPromptSubmit | `head -50 task_plan.md` + `tail -20 progress.md` | 每次用户消息 |
| AgentStop | `grep -c "### Phase"` 计算总数，`grep -cF "**Status:** complete"` 检查完成数 | 代理停止时 |

### 关键约束

- 活跃任务计划必须在文件前 50 行（hook 只读前面）
- 历史摘要**不能**使用 `### Phase` 格式（会干扰 AgentStop 的 grep 计数）
- 历史摘要**不能**包含 `**Status:**` 行（同理）
- progress.md 最新内容必须在文件末尾（hook 用 tail -20）

## task_plan.md 压缩

### 识别区块

task_plan.md 由多个区块组成，每个区块以 `# <需求名> - 任务计划` 开头，包含多个 `### Phase N:` 任务。

### 判断完成状态

- **已完成**: 所有 Phase 的 Status 都是 `complete` 或 `skipped`
- **活跃**: 包含 `pending` 或 `in_progress` 的 Phase

### 压缩步骤

1. 读取完整 task_plan.md
2. 将完整内容归档到 `docs/superpowers/archive/archive-YYYY-MM-DD-task_plan.md`
3. 保留所有活跃区块的完整内容
4. 将已完成区块压缩为一行摘要：`- [已完成] <需求名> (Phase M-N)`
5. 摘要放在文件末尾的 `## 历史记录` 区块
6. 保留 `## 遇到的错误` 区块

### 压缩后结构

```markdown
# <当前需求> - 任务计划
> Source plan: ...
## 概述
...
## Phase N: <当前任务>
- **Status**: in_progress
...
---
## 历史记录
- [已完成] ckjr-cli 实现 (Phase 1-12)
- [已完成] API Client 错误处理改进 (Phase 13-17)
- 完整历史详见 docs/superpowers/archive/
---
## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
```

## progress.md 压缩

### 压缩步骤

1. 读取完整 progress.md
2. 将完整内容归档到 `docs/superpowers/archive/archive-YYYY-MM-DD-progress.md`
3. 识别日期会话（以 `## YYYY-MM-DD` 开头的区块）
4. 保留最近 3 个日期会话的完整内容
5. 更早的日期会话压缩为单行摘要
6. 摘要放在文件开头（`## 历史摘要` 区块），最新内容保持在文件末尾

### 压缩后结构

```markdown
# Progress

## 历史摘要
- 2024-01-15: 完成 ckjr-cli 基础架构 (Phase 1-5)
- 2024-01-16: 完成 API Client 实现 (Phase 6-8)

## 2024-01-17 最新需求名

### Phase 9: <任务名>
...
```

## 归档目录

- 路径: `docs/superpowers/archive/`
- 文件名格式: `archive-YYYY-MM-DD-{task_plan,progress}.md`
- 同一天多次压缩时追加后缀: `archive-YYYY-MM-DD-task_plan-2.md`
- 归档文件包含原始文件的完整内容，不做任何修改

## findings.md

仅去重，不压缩：
- 检查重复主题的发现
- 合并相同主题的内容
- 保留所有发现（不归档）

## Hook 兼容性验证清单

压缩完成后，验证以下项目：

- [ ] `head -30 task_plan.md` 显示当前活跃任务（非历史记录）
- [ ] `grep -c "### Phase" task_plan.md` 仅统计活跃 Phase 数量
- [ ] `grep -cF "**Status:** complete" task_plan.md` 仅统计活跃 Phase 的完成数
- [ ] `tail -20 progress.md` 显示最新的执行日志
- [ ] 历史记录区块使用 `- [已完成]` 格式（非 `### Phase`）
- [ ] 历史记录区块不含 `**Status:**` 行
- [ ] 归档文件存在于 `docs/superpowers/archive/`
