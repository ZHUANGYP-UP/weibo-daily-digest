Web 应用测试 — 使用 Playwright 与本地 Web 应用交互和测试。

参数: $ARGUMENTS

---

# Web 应用测试

使用 Playwright 与本地 Web 应用交互和测试。支持验证前端功能、调试 UI 行为、截图和查看浏览器日志。

## 决策树

- 静态 HTML → 直接读取 HTML 识别选择器 → 编写 Playwright 脚本
- 动态 Web 应用 → 服务器已在运行吗？
  - 否 → 启动服务器 + Playwright 脚本
  - 是 → 先侦察再行动（导航 → 等待 networkidle → 截图/检查 DOM → 识别选择器 → 执行操作）

## 基本模式

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    # ... 你的自动化逻辑
    browser.close()
```

## 先侦察再行动

1. 截图或检查 DOM：`page.screenshot()`, `page.content()`, `page.locator('button').all()`
2. 从渲染状态中识别选择器
3. 使用发现的选择器执行操作

## 常见陷阱

- 不要在动态应用上等待 `networkidle` 之前就检查 DOM
- 完成后始终关闭浏览器
- 使用描述性选择器：`text=`、`role=`、CSS 选择器或 ID
