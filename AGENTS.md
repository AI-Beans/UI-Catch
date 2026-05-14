# PROJECT KNOWLEDGE BASE

## OVERVIEW

Chrome MV3 extension (UI-Catch) — click icon → hover-highlight DOM elements → click to capture element fingerprint → copy AI-ready prompt to clipboard. Pure vanilla JS, no build step.

## STRUCTURE

```
UI-Catch-Extension/
├── manifest.json      # MV3 config: activeTab, scripting, web_accessible_resources
├── background.js      # Service worker: icon click → inject <script> tag into page main world
├── content.js         # All business logic, runs in page's real JS context (not isolated world)
├── *.crx              # Packaged extension (build artifact)
└── *.pem              # Extension signing key (DO NOT commit)
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add new permissions | `manifest.json` | `permissions` array + `web_accessible_resources` if injecting new files |
| Change injection mechanism | `background.js` | Only 11 lines — creates `<script>` tag via `chrome.runtime.getURL` |
| Modify highlight behavior | `content.js` L7-22 | `.ui-catch-hover` CSS class definition |
| Change fingerprint format | `content.js` L64-84 | `getAttribute('class')` + tag + id + innerText extraction |
| Change prompt template | `content.js` L86 | Single template string |
| Fix clipboard issues | `content.js` L90-107 | Dual-engine: `navigator.clipboard` → `execCommand('copy')` fallback |
| Add exit/abort logic | `content.js` L47-51, L31-41 | Esc keydown handler + `cleanup()` function |

## KEY ARCHITECTURE DECISIONS

**Main world injection (not isolated world):** Content scripts in Chrome MV3 run in an isolated JS context where `document.execCommand('copy')` and `navigator.clipboard` are restricted. Background.js works around this by injecting a `<script>` tag that loads `content.js` into the page's real JS environment — identical execution context to a bookmarklet. This is why `web_accessible_resources` is required in manifest.

**Capture-phase listeners:** All event listeners use `true` (capture phase) to intercept before business code can `stopPropagation()`.

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER** use `className` on captured elements — SVG elements return `SVGAnimatedString` not a string. Use `getAttribute('class')` instead.
- **NEVER** switch to `world: 'MAIN'` in `chrome.scripting.executeScript` — it silently fails on some Chrome versions / page CSPs. The `<script>` tag injection is the proven approach.
- **NEVER** remove `web_accessible_resources` — without it, `chrome.runtime.getURL('content.js')` returns a blocked URL.
- **NEVER** forget to strip `ui-catch-hover` from captured class strings — `getAttribute('class')` includes injected classes.

## GOTCHAS

- `window.__UI_CATCH_ACTIVE` guard prevents double-injection on rapid icon clicks
- Toast `pointer-events:none` ensures it doesn't intercept hover detection
- `cleanup()` must remove all 4 listeners (mouseover, mouseout, click, keydown) + style element + residual hover classes
- `.pem` file is the extension signing key — losing it means can't update the extension
- No build/bundle step — raw JS loaded directly by Chrome

## COMMANDS

```bash
# Load: chrome://extensions/ → Developer mode → Load unpacked → select UI-Catch-Extension/
# Reload: chrome://extensions/ → click refresh icon on extension card
# Package: chrome://extensions/ → Pack extension (generates .crx + .pem)
```
