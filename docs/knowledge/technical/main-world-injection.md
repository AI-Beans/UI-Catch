# MV3 主世界注入方案

> 覆盖：`UI-Catch-Extension/background.js` + `manifest.json` 的 `web_accessible_resources`
> 改注入机制前必读本文件。

## 问题

Chrome MV3 Content Script 默认运行在 **Isolated World**（隔离 JS 上下文），导致两个硬限制：

1. **剪贴板受限**：`navigator.clipboard.writeText()` 在非 secure context 或某些页面 CSP 下被拒；`document.execCommand('copy')` 在隔离世界行为不一致。
2. **框架内部不可见**：React Fiber（`__reactFiber$`）、Vue 实例（`__vue__` / `__vue_app__`）等私有属性挂在页面真实 JS 上下文的元素上，隔离世界读不到。

## 方案

`background.js` 通过 `chrome.scripting.executeScript` 注入一段极简代码，该代码创建一个 `<script>` 标签，`src` 指向扩展内的 `content.js`（经 `chrome.runtime.getURL` 解析）。标签被插入 `document.head` 后，浏览器在**页面主世界**加载执行 `content.js`——与 bookmarklet 同执行上下文。

```js
// background.js 核心逻辑（11 行）
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const s = document.createElement('script');
      s.src = chrome.runtime.getURL('content.js');
      s.onload = () => s.remove();
      (document.head || document.documentElement).appendChild(s);
    }
  });
});
```

## 为什么不用 `world: 'MAIN'`

`chrome.scripting.executeScript({world: 'MAIN'})` 看似直接，但实测在部分 Chrome 版本 + 页面 CSP 下**静默失败**（无报错、无执行）。`<script>` 标签法是跨版本稳定的方案。

## 依赖

- `manifest.json` 的 `web_accessible_resources` 必须包含 `content.js` 且 `matches: ["<all_urls>"]`。删掉它 → `chrome.runtime.getURL` 返回被浏览器拦截的 URL，注入失败。

## 窗口守卫

`content.js` 顶部用 `if (!window.__UI_CATCH_ACTIVE)` 防快速连点图标导致重复注入（监听器叠加、UI 残留）。`cleanup()` 末尾重置 `__UI_CATCH_ACTIVE = false` 允许下次注入。
