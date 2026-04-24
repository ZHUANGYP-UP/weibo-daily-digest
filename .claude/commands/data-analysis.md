数据分析 — 数据集探索、清洗、统计分析和可视化。

参数: $ARGUMENTS

---

# 数据分析

数据集探索、清洗、统计分析和可视化。支持 Python (Pandas) 和 SQL。

## 步骤 1：加载和探索数据

```python
import pandas as pd
df = pd.read_csv('data.csv')
print(df.info())
print(df.describe())
print(df.isnull().sum())
```

## 步骤 2：数据清洗

- 处理缺失值（fillna / dropna）
- 删除重复项
- 类型转换（pd.to_datetime / astype）
- 删除异常值（IQR 方法）

## 步骤 3：统计分析

- 描述性统计、分组分析、相关性
- 数据透视表

## 步骤 4：可视化

- matplotlib + seaborn
- 直方图、箱线图、热力图、时间序列

## 步骤 5：提取洞察

- 头部/尾部分析、趋势分析、分段分析

## 输出格式

```markdown
# 数据分析报告
## 1. 数据集概览（记录数、列数、日期范围）
## 2. 关键发现
## 3. 统计摘要表格
## 4. 建议
```

## 约束

- 保留原始数据（在副本上操作）
- 记录分析过程
- 不得暴露敏感个人数据
- 不得得出无依据的结论
