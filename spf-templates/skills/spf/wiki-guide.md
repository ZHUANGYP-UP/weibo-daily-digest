# SPF Wiki 知识库

SPF 使用项目级 Wiki 实现跨迭代知识累积，解决多轮迭代后知识丢失的问题。零外部依赖，纯 Markdown 文件，由 LLM 自行维护。

## 目录结构

```
<project>/docs/superpowers/
├── specs/                        # Raw: Spec 原始文档（已有，不变）
│   └── <name>.md
├── plans/                        # Raw: Plan 原始文档（已有，不变）
│   └── <name>.md
├── experiences/                  # Raw: 经验原始文档（Phase 4.5 生成）
│   └── <topic>.md
├── wiki/                         # LLM 生成维护的知识页面（新增）
│   ├── index.md                  # 内容目录
│   ├── log.md                    # 操作日志
│   ├── spec-<name>.md            # Spec 摘要页
│   ├── plan-<name>.md            # Plan 摘要页
│   ├── experience-<name>.md      # 经验摘要页
│   ├── entity-<name>.md          # 实体页
│   └── concept-<name>.md         # 概念页
└── archive/                      # 压缩归档（已有，不变）
```

**关键设计**：raw sources 就是 specs/、plans/、experiences/ 目录下的文件本身，不复制。wiki 页面通过相对路径引用它们（如 `../specs/<name>.md`）。

## 页面命名规范

| 页面类型 | 命名格式 | 示例 |
|----------|---------|------|
| Spec 摘要 | `spec-<name>.md` | `spec-user-auth.md` |
| Plan 摘要 | `plan-<name>.md` | `plan-user-auth.md` |
| 经验摘要 | `experience-<name>.md` | `experience-jwt-pitfalls.md` |
| 实体页 | `entity-<name>.md` | `entity-react-query.md` |
| 概念页 | `concept-<name>.md` | `concept-optimistic-update.md` |

## 页面模板

### index.md

```markdown
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
```

### log.md

```markdown
# SPF Wiki 操作日志

## [YYYY-MM-DD] init | Wiki 初始化
创建 SPF Wiki 目录结构和基础文件。
```

### 摘要页 frontmatter

```yaml
# Spec 摘要页
tags: [spec, <领域标签>]
type: spec
source: "../specs/<file>.md"
date: YYYY-MM-DD

# Plan 摘要页
tags: [plan, <领域标签>]
type: plan
source: "../plans/<file>.md"
spec: "[[spec-<name>]]"
date: YYYY-MM-DD

# 经验页
tags: [experience, <标签>]
type: experience
source: "../experiences/<file>.md"
date: YYYY-MM-DD

# 实体页
tags: [entity, <类型>]
type: entity

# 概念页
tags: [concept, <领域>]
type: concept
```

## 三大操作

### Ingest（导入）

将 raw source 文件导入 Wiki，创建摘要页和相关实体/概念页。

**流程**：
1. 读取源文件（如 `docs/superpowers/specs/<name>.md`）
2. 无需复制——raw source 就是源文件本身
3. 创建 wiki 摘要页（`docs/superpowers/wiki/spec-<name>.md` 等）
4. 从源文件提取实体和概念，创建/更新 `wiki/entity-<name>.md` 和 `wiki/concept-<name>.md`
5. 用 `[[wikilinks]]` 建立页面间交叉引用
6. 更新 `wiki/index.md`（在对应类别下添加条目）
7. 追加到 `wiki/log.md`（格式：`## [YYYY-MM-DD] ingest | <type>: <name>`）

### Recall（检索）

根据查询词检索 Wiki 中的相关页面。

**流程**：
1. 读取 `wiki/index.md` 获取所有页面列表
2. 根据查询关键词筛选相关页面（匹配页面名、说明、标签）
3. 读取相关页面全文
4. 返回结构化摘要

### Lint（校验）

检查 Wiki 完整性（`--wiki-lint` 参数触发）。

**检查项**：
- index.md 中的条目是否有对应页面文件
- 摘要页的 source 路径是否指向有效文件
- wikilinks 是否指向存在的页面

## 集成阶段

### Phase 0: 上下文加载

在 SPF 开始前，检索 Wiki 中的历史资源：

```bash
# 检索相关资源
/spf-resource recall "<需求描述>"
```

Wiki 为空时跳过，输出 "Wiki 为空，跳过上下文加载"。

### Phase 1.5: Spec 导入 Wiki

在 spec 生成后，通过 `spf-wikier` 子代理执行 Wiki 导入：

```
Agent(subagent_type: "spf-wikier", description: "导入 spec 到 Wiki",
  prompt: "源文件: docs/superpowers/specs/<需求名>.md\n类型: spec\n项目目录: <pwd>")
```

### Phase 2.5: Plan 导入 Wiki

在 plan 生成后，通过 `spf-wikier` 子代理执行 Wiki 导入：

```
Agent(subagent_type: "spf-wikier", description: "导入 plan 到 Wiki",
  prompt: "源文件: docs/superpowers/plans/<需求名>.md\n类型: plan\n项目目录: <pwd>")
```

### Phase 4.5: 经验导入 Wiki

迭代完成后，生成经验文档并通过 `spf-wikier` 子代理执行 Wiki 导入：

```
Agent(subagent_type: "spf-wikier", description: "导入经验到 Wiki",
  prompt: "源文件: docs/superpowers/experiences/<主题>.md\n类型: experience\n项目目录: <pwd>")
```

## 手动使用 spf-resource

```bash
# 导入 spec 到 Wiki
/spf-resource add docs/superpowers/specs/auth.md --type=spec

# 导入 plan 到 Wiki
/spf-resource add docs/superpowers/plans/auth.md --type=plan

# 导入经验到 Wiki
/spf-resource add docs/superpowers/experiences/auth-jwt.md --type=experience

# 检索相关资源
/spf-resource recall "用户认证"

# 列出 Wiki 中所有 spec
/spf-resource list --type=spec
```
