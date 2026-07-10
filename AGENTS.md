# UI-Catch 项目知识库

> Chrome MV3 扩展：点图标 → 悬停高亮 → 点击/框选捕获元素指纹 → 三栏 Prompt 构建器 → 复制 AI-Ready Prompt。纯 Vanilla JS，无构建步骤。
>
> 全局规则见 `~/.config/opencode/AGENTS.md`（CROSS-PROJECT KNOWLEDGE / COGNITION / UNIVERSAL PRINCIPLES）。本文件只写项目特有内容，不重复全局规则。

## 1. VERIFICATION GATE

本项目无构建步骤、无测试框架、无 linter——纯 Vanilla JS 由 Chrome 直接加载。验证全部为**行为验证**：

| 验证项 | 方法 |
|---|---|
| 扩展加载 | `chrome://extensions/` 开发者模式 → 加载已解压 → 无报错 |
| 注入成功 | 点图标 → 页面 console 出现 `🐾 UI-Catch: 探针已成功注入！` |
| 高亮正常 | 悬停元素 → 黄色（`#facc15`）描边 + 半透明背景 |
| 精准捕获 | 点击元素 → 弹出模态框（非 toast）→ 三栏可编辑 → 复制成功 |
| 框选捕获 | 切"区域框选" → 拖拽 → LCA 元素闪黄 → 弹区域捕获模态框 |
| 多选捕获 | 切"多选选取" → 依次点多个元素（再点取消选中）→ 底部浮动"✓ 完成(N)" → 弹多选模态框 |
| 精灵光标 | 设置面板上传 sprite → 光标变动画 → 锚点定位准确 |
| Esc 退出 | 按 Esc → 全部 UI 移除 → console 出现 `探针已安全退出` |

**TDD 基线**：当前无自动化测试。未来若加测试，走 Puppeteer/Playwright 扩展测试方案（MV3 需特殊启动参数），不引入 Jest 等浏览器外框架。

## 2. DEVELOPMENT LOOP

Feedback-driven 是默认基线（全局已覆盖）。本项目处于**成熟维护期**（v1.0 已打包 `.crx`），feedback 流程偏轻：

- 反馈记录于 `docs/feedback.json`，编号 `fb_NNN`
- 新反馈 → 在 `docs/knowledge/` 对应分类沉淀决策 → 实现 → 标 `resolved`
- 大改动（新功能/改注入机制）走 feedback；小修（样式/文案/选择器微调）直接改 + 手动验证

## 3. TRIGGERS

| 用户说/现象 | 行动 |
|---|---|
| "捕获的元素定位不准" | 查 `getUniqueSelector` / `getCSSPath` 降级链，确认是否新框架场景 |
| "复制失败/没反应" | 查 `navigator.clipboard` 是否在 secure context，`execCommand` 降级是否触发 |
| "精灵光标不跟手/错位" | 查锚点 anchor X/Y 数学（L909-912 偏移计算），确认 spriteSize 与 anchor 单位一致 |
| "React/Vue 组件没识别" | 查 Fiber key 前缀（`__reactFiber$` vs `__reactInternalInstance$`，React 版本差异） |
| "框选选不到/选多了" | 查 `findElementsInRect` 几何判断 + `getLowestCommonAncestor` 路径比较 |
| "页面样式被插件污染" | 查是否漏用 Shadow DOM（工具栏/模态框/设置面板必须 Shadow DOM 封装） |

## 4. AUTONOMY

**CAN（agent 独立决定）**：
- 修改 `content.js` 内部逻辑（选择器算法、框架检测、UI 交互）
- 调整高亮样式、模态框文案、动画参数
- 同步更新 README / AGENTS.md / docs 以匹配代码现状

**MUST ASK（需人确认）**：
- 改 `manifest.json` 的 `permissions`（安全边界）
- 改注入机制（`<script>` 标签法是验证过的方案，勿轻易换）
- 删除 `web_accessible_resources`
- 引入构建步骤/依赖（当前零依赖是核心卖点）
- 发布新版 `.crx`（需 `.pem` 签名密钥）

## 5. ANTI-PATTERNS（项目特有，NEVER 违反）

- **NEVER** 用 `className` 读捕获元素的类名——SVG 元素返回 `SVGAnimatedString` 不是字符串。用 `getAttribute('class')`
- **NEVER** 切换到 `chrome.scripting.executeScript({world:'MAIN'})`——部分 Chrome 版本/页面 CSP 下静默失败。`<script>` 标签注入是验证过的方案
- **NEVER** 删除 `web_accessible_resources`——没有它 `chrome.runtime.getURL('content.js')` 返回被拦截的 URL
- **NEVER** 忘记从捕获的 class 字符串里 strip 掉 `ui-catch-hover`——`getAttribute('class')` 会包含注入的高亮类
- **NEVER** 让插件 UI 元素被当成捕获目标——必须过 `isOwnUI()` 守卫（toolbarHost / marquee / spriteCanvas / `[data-ui-catch-modal]`）
- **NEVER** 在精灵帧检测里用 `className` 或 DOM 属性——只能用 canvas `getImageData` 像素扫描判断帧是否为空
- **NEVER** 以为 `onMousedown`/`onMouseup` 里调 `preventDefault()` 就能阻止点击的默认行为——`<a>` 跳转/`<button>` 提交发生在 `click` 事件上，必须用 `armClickSwallow()` 拦截 click 本身

## 6. ARCHITECTURE

**主世界注入（非隔离世界）**：MV3 Content Script 运行在隔离 JS 上下文，`document.execCommand('copy')` 和 `navigator.clipboard` 受限，且无法访问框架内部属性。`background.js` 通过注入 `<script>` 标签把 `content.js` 加载进页面真实 JS 环境——与 bookmarklet 同执行上下文。这是 `web_accessible_resources` 必须存在的原因。

**捕获阶段监听**：所有事件监听用 `true`（capture phase），在业务代码 `stopPropagation()` 之前拦截。

**Shadow DOM 隔离**：工具栏、模态框、设置面板全部用 `attachShadow({mode:'open'})` 封装。双向防护——页面 CSS 不污染插件 UI，插件样式不泄漏到页面。

**精灵光标系统**：canvas-based（256×256 内部，CSS 缩放），`pointer-events:none`，锚点偏移数学（`anchorX/Y` 0-1 比例 × spriteSize）。帧检测用独立扫描 canvas + `willReadFrequently`。

**单文件业务逻辑**：全部在 `content.js`（1053 行），无模块化。`background.js` 仅 11 行注入器。`manifest.json` 17 行配置。

## 7. ORCHESTRATION

小项目，最小委派：
- UI/视觉改动 → `visual-engineering` 类别
- 选择器算法/框架检测逻辑 → 直接改 + 手动验证（无需委派）
- 文档批量整理 → `writing` 类别

## 8. LOCKED（需显式批准才能动）

- `manifest.json` 的 `permissions` 数组——安全边界
- 注入机制（`<script>` 标签法）——验证过，换方案需证据
- `web_accessible_resources`——注入依赖
- `.pem` 签名密钥——丢失则无法更新扩展

## 9. CONVENTIONS

- **localStorage 键全部前缀 `ui-catch-`**：`sprite` / `sprite-fps` / `sprite-size` / `anchor-x` / `anchor-y` / `system` / `demand` / `toolbar-pos` / `font-scale`
- **生成类名自动过滤**：`css-`/`sc-`/`jss-`/`emotion-` 前缀 + 5+ 字符 hash（含数字或大写）、CSS Modules `__hash` 后缀（含数字或大写，区分 BEM 全小写元素）——在 selector 和特征指纹生成时被 `isGeneratedClass` / `cleanClassStr` 自动剔除
- **窗口守卫**：`window.__UI_CATCH_ACTIVE` 防快速连点重复注入
- **高亮色固定 `#facc15`**（黄色），不是绿色
- **注入 UI 全部 Shadow DOM 或显式 data 属性**（`data-ui-catch-modal`），便于 cleanup 定位
- **cleanup() 必须移除全部**：6 个监听器（mouseover/mouseout/mousedown/mousemove/mouseup/keydown）+ style 元素 + marquee + toolbarHost + multiConfirmHost + spriteCanvas + glowDot + dropdownOutsideListener + 残留 hover/selected 类 + 清空 multiSelected + 重置 `__UI_CATCH_ACTIVE`
- **z-index 层级**：toolbar `2147483647` > glowDot `2147483646` > spriteCanvas `2147483645` > marquee `2147483646` > modal `2147483647`

## 10. DOC SYNC

全局 DOC SYNC 原则已覆盖（grep docs + 知识债检测）。

项目补充：
- `content.js` 是单一事实源——README 和 AGENTS.md 的功能描述必须与它的实际行为一致
- 改了 `content.js` 的用户可见行为后，必须同步检查 README 的"功能"和"生成的 Prompt 长什么样"两段
- 不需要同步纯内部重构（变量改名、提取辅助函数）和样式微调

## 11. COMMANDS

无构建/测试/lint 命令（零依赖纯 JS）。

```bash
# 加载：chrome://extensions/ → 开发者模式 → 加载已解压 → 选 UI-Catch-Extension/
# 重载：chrome://extensions/ → 扩展卡片上的刷新按钮
# 打包：chrome://extensions/ → 打包扩展程序（生成 .crx + .pem）
```

## 12. CONTEXT RECOVERY

新会话先读：
1. 本文件（AGENTS.md）
2. `UI-Catch-Extension/content.js` 全文（1053 行，单文件承载全部业务逻辑）
3. `UI-Catch-Extension/manifest.json` + `background.js`（共 28 行，注入机制）
4. `README.md`（用户视角功能列表）
5. 若涉及已解决的决策历史 → `docs/knowledge/` 对应文件
