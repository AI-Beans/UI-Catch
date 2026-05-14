# UI-Catch

> Chrome 扩展 — 点击图标，悬停高亮 DOM 元素，点击捕获元素指纹，生成 AI-Ready Prompt 复制到剪贴板。

## 为什么做这个

用 Cursor / Claude Code / Copilot 等 AI 编码工具改前端时，最烦的是**描述你要改哪个元素**。

UI-Catch 让你直接在页面上**点一下**，自动提取元素指纹、生成结构化 Prompt，复制到剪贴板，粘贴给 AI 就行。

**指哪打哪，不用废话。**

## 功能

- **悬停高亮** — 鼠标移上去，目标元素绿色描边 + 半透明背景
- **智能定位** — 优先级瀑布：`#id` → `data-testid` → 唯一 CSS Selector → CSS Path，全量查找，只展示最短唯一标识
- **框架感知** — 自动检测 React Fiber / Vue 实例，提取组件名
- **可编辑 Prompt** — 玻璃拟态模态框，完整展示 Prompt，支持自定义修改后一键复制
- **零侵入** — Shadow DOM 封装 UI，capture phase 事件拦截，清理后不留痕迹
- **Esc 退出** — 随时按 Esc 取消

## 安装

### 方式一：加载源码（开发）

1. `git clone https://github.com/AI-Beans/UI-Catch.git`
2. Chrome 打开 `chrome://extensions/`
3. 右上角开启 **开发者模式**
4. 点击 **加载已解压的扩展程序**，选择 `UI-Catch-Extension/` 文件夹
5. 完成

### 方式二：安装 .crx（后续发布）

> 暂未发布到 Chrome Web Store，目前请用方式一。

## 使用

1. 打开任意网页
2. 点击浏览器右上角 UI-Catch 图标
3. 页面顶部出现提示条 → 鼠标悬停到目标元素（绿色高亮）
4. 点击目标元素 → 弹出模态框，显示完整 Prompt
5. 在模态框中编辑 Prompt（可选）
6. 点击 **复制到剪贴板** → 粘贴给你的 AI 编码工具

按 **Esc** 可随时取消。

## 生成的 Prompt 长什么样

**有 ID 的元素（最简洁）：**
```
我在调整前端 UI。请帮我修改下面这个特定元素：

【特征指纹】
<button id="submit-btn">提交</button>

【定位ID】
#submit-btn

【我的需求】
1. 
```

**无 ID，有唯一 class 组合：**
```
我在调整前端 UI。请帮我修改下面这个特定元素：

【特征指纹】
<span class="text-gray-500 font-semibold">入门指南</span>

【定位Selector】
span.text-gray-500.font-semibold

【我的需求】
1. 
```

**React 项目（自动检测组件）：**
```
我在调整前端 UI。请帮我修改下面这个特定元素：

【特征指纹】
<button class="px-4 py-2 rounded-full">提交</button>

【定位Selector】
button.px-4.py-2

【组件】
<SubmitButton> (react)

【我的需求】
1. 
```

## 架构

```
用户点击图标
       ↓
background.js (Service Worker, 隔离沙箱)
       ↓ chrome.scripting.executeScript + <script> 标签注入
content.js (页面 Main World, 与书签方法同环境)
       ↓
悬停高亮 → 点击捕获 → 智能定位+框架感知 → 弹出可编辑模态框 → 用户确认复制 → 清理
```

### 为什么用 `<script>` 标签注入而不是 Content Script

Chrome MV3 的 Content Script 运行在隔离沙箱（Isolated World），`document.execCommand('copy')` 和 `navigator.clipboard` 受限。通过 `<script>` 标签注入到页面的 Main World，和书签方法（Bookmarklet）执行环境完全一致，剪贴板操作零障碍。

### 为什么用 Shadow DOM 封装模态框

避免页面 CSS 污染插件 UI，也避免插件样式泄漏到页面。模态框完全隔离，不受任何页面的 `!important` 或全局样式影响。

### 智能定位策略

全量查找，最小展示。按优先级瀑布降级，命中第一个就停：

```
1. #id                  → 有就直接用，最短最稳
2. [data-testid=""]     → 没ID但测试标记有
3. 唯一 CSS Selector    → 自动裁剪到能命中的最短 class 组合
4. CSS Path             → 以上都不行才用完整路径（html > body > ...）
```

### 框架感知

运行在页面 Main World 意味着可以直接访问框架内部属性：

| 框架 | 检测方式 | 提取信息 |
|------|---------|---------|
| React 16+ | `__reactFiber$` 私有属性 | 向上遍历 Fiber 树（最多15层）→ 组件名 + 基本 Props |
| Vue 2 | `__vue__` 私有属性 | `$options.name` |
| Vue 3 | `__vue_app__` 私有属性 | `_.type.name` |

仅在检测到组件名时才展示，不显示冗余信息。

## 文件结构

```
UI-Catch-Extension/
├── manifest.json      # MV3 配置: activeTab, scripting, web_accessible_resources
├── background.js      # Service Worker: 图标点击 → 注入 <script> 标签到 Main World
└── content.js         # 全部业务逻辑: 高亮、捕获、智能定位、框架感知、模态框、剪贴板
```

纯 Vanilla JS，零依赖，无构建步骤。

## 技术细节

| 决策 | 原因 |
|------|------|
| Main World 注入 | 隔离沙箱中剪贴板 API 受限，且需要访问框架内部属性 |
| `getAttribute('class')` 替代 `className` | SVG 元素的 `className` 返回 `SVGAnimatedString`，不是字符串 |
| Capture phase 事件监听 | 防止业务代码 `stopPropagation()` 阻挡捕获 |
| `CSS.escape()` 处理选择器 | ID/class 中可能含特殊字符（如 Tailwind 的 `text-[13px]`） |
| `web_accessible_resources` | 没有它 `chrome.runtime.getURL('content.js')` 返回被拦截的 URL |
| `window.__UI_CATCH_ACTIVE` | 防止快速连点图标导致重复注入 |
| `pointer-events: none` Toast | 防止提示条拦截悬停检测 |
| 剪贴板双引擎 | `navigator.clipboard` 优先，`execCommand('copy')` 降级 |

## 开发

```bash
# 修改代码后，在 chrome://extensions/ 点击扩展卡片上的刷新按钮即可
# 无需重新加载页面
```

## License

MIT
