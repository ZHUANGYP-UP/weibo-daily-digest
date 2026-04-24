# 经验文档模板

Phase 4.5 生成经验文档时使用此模板：

```markdown
---
name: <主题>
project: <项目名>
created: <日期>
tags: [<标签1>, <标签2>]
---

# <主题>

## 影响范围
- 新增：xxx 模块
- 修改：xxx 模块
- 依赖：xxx 模块

## 决策
| 决策点 | 选择 | 原因 |
|--------|------|------|
| ... | ... | ... |

## 坑点预警
- **问题**: ...
  - 解决: ...

## 复用模式
(代码片段或模式)
```

## Wiki 导入

经验文档生成后，通过 `spf-resource add <path> --type=experience` 自动导入到项目 Wiki（docs/superpowers/wiki/）。
