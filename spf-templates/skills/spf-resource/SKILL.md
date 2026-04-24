---
name: spf-resource
description: SPF 资源管理技能 - 管理 spec/plan/经验文档的 Wiki 导入和检索，支持跨迭代知识累积
triggers:
  - command: /spf-resource
  - intent: SPF资源管理、spec持久化、plan持久化、经验沉淀、检索历史资源、wiki导入
allowed-tools: Bash
---

# SPF 资源管理技能

管理 SPF 相关资源（spec/plan/经验）的 Wiki 导入和检索。通过项目 Wiki（`docs/superpowers/wiki/`）实现跨迭代知识累积，零外部依赖。

## 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `add <路径>` | 将资源导入项目 Wiki | `add docs/superpowers/specs/auth.md` |
| `list [--type=TYPE]` | 列出 Wiki 中的资源 | `list --type=spec` |
| `recall <查询>` | 检索 Wiki 中的相关资源 | `recall 用户认证` |
| `--type` | 资源类型：spec/plan/experience | `--type=spec` |

## Wiki 目录结构

```
<project>/docs/superpowers/
├── specs/                        # Raw: Spec 原始文档
├── plans/                        # Raw: Plan 原始文档
├── experiences/                  # Raw: 经验原始文档
└── wiki/                         # LLM 生成维护的知识页面
    ├── index.md                  # 内容目录
    ├── log.md                    # 操作日志
    ├── spec-<name>.md            # Spec 摘要页
    ├── plan-<name>.md            # Plan 摘要页
    ├── experience-<name>.md      # 经验摘要页
    ├── entity-<name>.md          # 实体页
    └── concept-<name>.md         # 概念页
```

## 执行步骤

### Step 1: 解析命令参数

从 `$ARGUMENTS` 中解析：
- command: `add` | `list` | `recall`
- path: 资源路径（add 命令）
- query: 检索查询（recall 命令）
- type: 资源类型（可选，默认 spec）

### Step 2: Wiki 初始化检查

确保 Wiki 目录和基础文件存在：

```bash
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
WIKI_DIR="$PROJECT_DIR/docs/superpowers/wiki"

if [ ! -d "$WIKI_DIR" ]; then
  mkdir -p "$WIKI_DIR"
fi

if [ ! -f "$WIKI_DIR/index.md" ]; then
  cat > "$WIKI_DIR/index.md" << 'INDEXEOF'
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
INDEXEOF
fi

if [ ! -f "$WIKI_DIR/log.md" ]; then
  cat > "$WIKI_DIR/log.md" << 'LOGEOF'
# SPF Wiki 操作日志
LOGEOF
fi
```

### Step 3: 执行命令

#### add 命令 — Ingest 流程

将 raw source 文件导入 Wiki。无需复制源文件本身，只创建摘要页和交叉引用。

**流程**：

1. **读取源文件**：读取 `<path>` 指定的文件内容
2. **确定页面名称**：从文件路径提取 name（如 `specs/auth.md` → `auth`）
3. **创建摘要页**：在 `wiki/` 下创建 `<type>-<name>.md`，包含：
   - frontmatter（tags、type、source 相对路径、date）
   - 内容摘要（从源文件提取关键信息）
   - 相关 wikilinks

4. **提取实体和概念**：从源文件内容中识别关键实体（库、框架、模块）和概念（设计模式、架构决策），创建/更新对应页面

5. **更新 index.md**：在对应类别下添加表格行

6. **追加 log.md**：`## [YYYY-MM-DD] ingest | <type>: <name>`

**摘要页模板**：

```markdown
---
tags: [spec, <领域标签>]
type: spec
source: "../specs/<file>.md"
date: YYYY-MM-DD
---

# <名称> Spec 摘要

## 概述
<从源文件提取的核心需求描述>

## 关键决策
- <决策1>
- <决策2>

## 相关页面
- [[plan-<name>]]
- [[entity-<name>]]
```

**示例**：

```bash
# 导入 spec
/spf-resource add docs/superpowers/specs/auth.md --type=spec

# 导入 spec 目录（全栈模式）
/spf-resource add docs/superpowers/specs/shop --type=spec

# 导入 plan
/spf-resource add docs/superpowers/plans/auth.md --type=plan

# 导入经验文档
/spf-resource add docs/superpowers/experiences/auth-jwt-pitfalls.md --type=experience
```

#### list 命令

读取 `docs/superpowers/wiki/index.md`，按 `--type` 过滤输出。

**流程**：
1. 读取 `wiki/index.md`
2. 根据 `--type` 参数过滤对应类别
3. 格式化输出表格内容

**示例**：

```bash
# 列出 Wiki 中所有资源
/spf-resource list

# 列出所有 spec
/spf-resource list --type=spec

# 列出所有经验
/spf-resource list --type=experience
```

#### recall 命令

根据查询词检索 Wiki 中的相关页面。

**流程**：
1. 读取 `wiki/index.md` 获取所有页面列表
2. 根据查询关键词筛选相关页面（匹配页面名、说明、标签）
3. 读取相关页面全文
4. 返回结构化摘要

**示例**：

```bash
# 检索认证相关资源
/spf-resource recall "用户认证 JWT"

# 检索特定功能
/spf-resource recall "支付模块设计"
```

### Step 4: 输出结果

- `add`: 显示导入成功及创建的页面列表
- `list`: 显示资源表格
- `recall`: 显示匹配结果及摘要

---

## 使用场景

### SPF 流程集成

#### Phase 0: 上下文加载

在 SPF 开始前，检索 Wiki 中的历史资源：

```bash
# 检索相关资源
/spf-resource recall "<需求描述>"
```

Wiki 为空（index.md 无条目）时跳过，输出 "Wiki 为空，跳过上下文加载"。

#### Phase 1.5: Spec 导入 Wiki

在 spec 生成后：

```bash
# 单项目模式
/spf-resource add docs/superpowers/specs/<需求名>.md --type=spec

# 全栈模式
/spf-resource add docs/superpowers/specs/<需求名>/ --type=spec
```

#### Phase 2.5: Plan 导入 Wiki

在 plan 生成后：

```bash
# 单项目模式
/spf-resource add docs/superpowers/plans/<需求名>.md --type=plan

# 全栈模式
/spf-resource add docs/superpowers/plans/<需求名>/ --type=plan
```

#### Phase 4.5: 经验导入 Wiki

迭代完成后，生成经验文档并导入：

```bash
/spf-resource add docs/superpowers/experiences/<主题>.md --type=experience
```

---

## 注意事项

1. **零依赖**: 纯文件操作，无需 Python、HTTP 服务或嵌入模型
2. **路径解析**: Wiki 路径固定在 `docs/superpowers/wiki/`，无需 `--project` 参数
3. **Git 管理**: Wiki 文件纳入 git 版本控制，与 specs/plans 同级
4. **页面命名**: 使用 `<type>-<name>.md` 格式，name 从源文件名提取（去除日期前缀和扩展名）
5. **交叉引用**: 使用 `[[wikilinks]]` 语法，兼容 Obsidian 等工具的图谱视图
6. **SPF 编排层集成**: SPF 流程中 Phase 1.5/2.5/4.5 的 Wiki 操作已委托给 `spf-wikier` 子代理执行，本技能的 `add` 命令供手动使用时在主上下文中执行
