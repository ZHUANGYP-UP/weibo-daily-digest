SPF 资源管理 — 管理 spec/plan/经验文档的 Wiki 导入和检索。

参数: $ARGUMENTS

---

# SPF 资源管理技能

管理 SPF 相关资源（spec/plan/experience）的 Wiki 导入和检索。通过项目 Wiki（`docs/superpowers/wiki/`）实现跨迭代知识累积，零外部依赖。

## 参数解析

从 $ARGUMENTS 中解析：
- **add <路径>**: 将资源导入项目 Wiki
- **list [--type=TYPE]**: 列出 Wiki 中的资源（type: spec/plan/experience）
- **recall <查询>**: 检索 Wiki 中的相关资源
- **--type**: 资源类型：spec/plan/experience

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

从 $ARGUMENTS 中解析 command、path/query、type。

### Step 2: Wiki 初始化检查

确保 Wiki 目录和基础文件存在：

检查 `docs/superpowers/wiki/` 目录是否存在，不存在则创建。
检查 `docs/superpowers/wiki/index.md` 是否存在，不存在则创建：
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

检查 `docs/superpowers/wiki/log.md` 是否存在，不存在则创建：
```markdown
# SPF Wiki 操作日志
```

### Step 3: 执行命令

#### add 命令 — Ingest 流程

将 raw source 文件导入 Wiki。无需复制源文件本身，只创建摘要页和交叉引用。

**流程**：

1. **读取源文件**：读取 `<path>` 指定的文件内容。如果是目录（全栈模式），读取目录下所有 `.md` 文件
2. **确定页面名称**：从文件路径提取 name（如 `specs/auth.md` → `auth`，去除日期前缀和扩展名）
3. **创建摘要页**：在 `wiki/` 下创建 `<type>-<name>.md`，包含：
   - frontmatter：tags、type、source（相对路径相对于 wiki 目录）、date
   - 内容：概述（从源文件提取核心需求描述）、关键决策、相关 wikilinks

   摘要页模板：
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

4. **提取实体和概念**：从源文件内容中识别：
   - **实体**：库、框架、模块、API 等具体技术组件 → 创建/更新 `wiki/entity-<name>.md`
   - **概念**：设计模式、架构决策、最佳实践等抽象概念 → 创建/更新 `wiki/concept-<name>.md`
   - 如果页面已存在，追加新的引用信息；如果不存在，创建新页面

5. **建立交叉引用**：用 `[[wikilinks]]` 语法在相关页面间建立双向链接

6. **更新 index.md**：在对应类别下添加表格行：
   - Spec → `## Spec 摘要` 下添加 `| [[spec-<name>]] | <说明> | YYYY-MM-DD |`
   - Plan → `## Plan 摘要` 下添加 `| [[plan-<name>]] | <说明> | YYYY-MM-DD |`
   - Experience → `## 经验` 下添加 `| [[experience-<name>]] | <说明> | YYYY-MM-DD |`
   - 实体 → `## 实体` 下添加 `| [[entity-<name>]] | <说明> |`
   - 概念 → `## 概念` 下添加 `| [[concept-<name>]] | <说明> |`

7. **追加 log.md**：`## [YYYY-MM-DD] ingest | <type>: <name>`

#### list 命令

读取 `docs/superpowers/wiki/index.md`，按 `--type` 过滤输出对应类别表格内容。

#### recall 命令

根据查询词检索 Wiki 中的相关页面。

**流程**：
1. 读取 `wiki/index.md` 获取所有页面列表
2. 根据查询关键词筛选相关页面（匹配页面名、说明、标签）
3. 读取相关页面全文
4. 返回结构化摘要

### Step 4: 输出结果

- `add`: 显示导入成功及创建的页面列表
- `list`: 显示资源表格
- `recall`: 显示匹配结果及摘要

## 注意事项

1. **零依赖**: 纯文件操作，无需 Python、HTTP 服务或嵌入模型
2. **Git 管理**: Wiki 文件纳入 git 版本控制，与 specs/plans 同级
3. **页面命名**: 使用 `<type>-<name>.md` 格式，name 从源文件名提取（去除日期前缀和扩展名），全小写，空格用 `-` 替换
4. **交叉引用**: 使用 `[[wikilinks]]` 语法，兼容 Obsidian 等工具的图谱视图
5. **source 路径**: 摘要页的 source 路径使用相对路径（相对于 wiki 目录）
