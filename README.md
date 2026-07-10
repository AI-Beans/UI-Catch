# UI-Catch

> Chrome 扩展 — 点击图标，悬停高亮 DOM 元素，点击捕获元素指纹，生成 AI-Ready Prompt 复制到剪贴板。

## 为什么做这个

用 Cursor / Claude Code / Copilot 等 AI 编码工具改前端时，最烦的是**描述你要改哪个元素**。

UI-Catch 让你直接在页面上**点一下**，自动提取元素指纹、生成结构化 Prompt，复制到剪贴板，粘贴给 AI 就行。

**指哪打哪，不用废话。**

## 功能

- **悬停高亮** — 鼠标移上去，目标元素黄色（`#facc15`）描边 + 半透明背景
- **智能定位** — 优先级瀑布：`#id` → `data-testid` → 唯一 CSS Selector → CSS Path，全量查找，只展示最短唯一标识
- **框架感知** — 自动检测 React Fiber / Vue 实例，提取组件名
- **三栏 Prompt 构建器** — 系统提示预设 + 我的需求 + 折叠元素详情，localStorage 自动记住，复制时自动整合
- **三种选取模式** — 精准选取（点单个）/ 区域框选（拖拽自动嗅探公共祖先）/ 多选选取（依次点多个精准叠加，绕开框选的过度嗅探）
- **精灵光标**（可选）— 设置面板上传 4×4 sprite sheet，光标变成逐帧动画；可调 FPS、可视化设置锚点，让光标精确定位在鼠标的真实触点上
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
3. 页面顶部出现工具栏 → 鼠标悬停到目标元素（黄色高亮）
4. 选择模式（精准选取 / 区域框选 / 多选选取，点工具栏右上角 ⚙ 可上传精灵光标）
5. 弹出模态框：填写系统提示预设 + 我的需求，元素详情默认折叠
6. 点击 **复制到剪贴板** → 自动整合三部分内容，粘贴给 AI

> **多选选取**：依次点击要捕获的元素（再点一次取消选中），底部浮现"✓ 完成 (N)"，点它生成包含全部元素的 Prompt。

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

**多选选取（多个元素一起捕获）：**
```
我在调整前端 UI。请帮我修改下面这个特定元素：

【多选捕获 · 共 2 个元素】

【元素 1】
特征指纹: <button class="px-4 py-2">提交</button>
定位Selector: button.px-4.py-2

【元素 2】
特征指纹: <button class="px-4 py-2">取消</button>
定位Selector: button.px-4.py-2.cancel

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

### 精灵光标系统

可选的像素动画光标——点工具栏 ⚙ 打开设置面板，上传一张 4×4 的 sprite sheet（最多 16 帧）即可启用：

- **逐帧动画**：canvas 渲染（256×256 内部，CSS 缩放），独立扫描 canvas 用 `getImageData` 像素扫描自动跳过空帧
- **可视化锚点**：预览框里白点=鼠标真实位置，精灵图相对白点偏移；点预览图或调 X/Y 输入框设置锚点比例（0–100%）
- **可调 FPS**：1–30 帧/秒
- 全部参数（sprite dataURL / FPS / size / anchor X/Y）存 `localStorage`，下次注入自动恢复
- 光标 canvas `pointer-events:none`，不影响悬停检测和点击捕获

## 文件结构

```
UI-Catch/
├── AGENTS.md              # 项目知识库（agent 规则、反模式、架构约束）
├── README.md              # 本文件（用户视角）
├── docs/
│   ├── feedback.json      # 反馈驱动开发记录（fb_NNN）
│   └── knowledge/         # 沉淀的决策与领域知识
└── UI-Catch-Extension/
    ├── manifest.json      # MV3 配置: activeTab, scripting, web_accessible_resources
    ├── background.js      # Service Worker: 图标点击 → 注入 <script> 标签到 Main World
    └── content.js         # 全部业务逻辑: 高亮、捕获、智能定位、框架感知、模态框、精灵光标、剪贴板
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
| `pointer-events: none` 精灵光标/marquee | 防止光标 canvas 与框选覆盖层拦截悬停和点击检测 |
| 剪贴板双引擎 | `navigator.clipboard` 优先，`execCommand('copy')` 降级 |

## 开发

```bash
# 修改代码后，在 chrome://extensions/ 点击扩展卡片上的刷新按钮即可
# 无需重新加载页面
```

## 致谢

UI-Catch × [PixelMotionAI](https://github.com/PixelMotionAI) — Make Pixel Art Alive。精灵光标系统由 PixelMotionAI 协作设计。

## License

MIT
