# DOM 元素定位选择器生成（领域调研 2026-07）

> 覆盖：`UI-Catch-Extension/content.js` 的 `getUniqueSelector` / `getCSSPath` / `getComponentInfo`
> 决定要不要改选择器算法前必读。

## 我们的算法（基线）

瀑布优先级：`#id` → `[data-testid]` → 最短唯一 class 组合（querySelectorAll 验证）→ 完整 CSS Path（nth-of-type）→ 旁路 React Fiber / Vue 实例取组件名。

## 判断：主流骨架 ✅，落后 4 处

主流库（finder / css-selector-generator / optimal-select / DevTools 原生）的骨架与我们一致：`id → testid/attr → class 组合 → nth 路径`。差异在以下四点。

## 主流库对照

| 库 | 量级 | 核心策略 | 与我们异同 |
|---|---|---|---|
| Chrome DevTools `DOMPath.ts` | 浏览器原生 | id → class → nth-child，optimized 遇 id/body 停 | 骨架同；用 nth-child，我们用 nth-of-type（我们更稳） |
| @medv/finder | 1.5k★ / npm 70万周 | penalty 系统：id(0)>class(1)>attr(2)>tag(5)>nth-of-type(10)>nth-child(50)，回溯删冗余层级 | 思路最接近，但 penalty 显式化 + 更激进裁剪 |
| css-selector-generator (fczbkk) | 596★ / 4.7万周 | 幂集组合 + 白/黑名单 + `ignoreGeneratedClassNames` + Shadow DOM + 多元素 | class 组合同源，但配置更细、明确处理生成类名 |
| optimal-select (Autodesk) | 262★ | id/class/href/src → tag → nth-child，**专门做鲁棒性后处理**（`>`降空格、nth-child→nth-of-type、删冗余 class） | 骨架同构，多一个鲁棒性阶段（我们没有） |
| @cypress/unique-selector | 9★ / 5k周 | Cypress fork，加 `data-cy`/`data-test`/`name`/role 支持 + Shadow DOM + requiredAttributes | testid 理念一致，但支持更全 |
| fczbkk/css-selector-generator-benchmark | 188★ | 唯一公开系统对比，测成功率/唯一率/长度（**没测鲁棒性**，issue #1 是待补） | 参考而非库 |

## 4 个缺口（按对"喂给 AI"用途的重要性排序）

| 缺口 | 代表库做了什么 | 对我们的影响 |
|---|---|---|
| **① 过滤生成类名** | css-selector-generator `ignoreGeneratedClassNames`、finder `wordLike` | **已实现（fb_004）**——React/Vue 项目满地 `css-1x2y3z`/`sc-abc`/CSS Modules hash——喂给 AI 是噪声且重载失效。**性价比最高：~10 行正则** |
| **② 鲁棒性后处理** | optimal-select 专做：nth-child→nth-of-type、`>`降空格、删冗余 class | 我们的输出偏长，AI 难读一串 nth |
| **③ 扩展语义信号** | Playwright/Testing Library 推 `role`/`aria-label`；Cypress 认 `data-cy`/`data-test`/`data-qa` | AI 秒懂 `[role="button"]`，比 `div.x4y` 强 |
| **④ Shadow DOM** | css-selector-generator、@cypress/unique-selector 都支持 | 现代组件库（Lit/Shoelace）穿透不了 |

## 反直觉：测试框架方向相反（但不能直接套用）

Playwright/Testing Library 官方优先级：`getByRole` > `getByLabelText` > ... > `getByTestId`（兜底），明确反对 class/id/nth。**它们面向人写测试**（要可读+模拟用户感知），我们面向机器在任意页面抓取（只能利用已有信号）。但 Testing Library 的理念提示：`role`/`aria-label` 对 AI 同样高可读，值得纳入瀑布（即缺口 ③）。

## 实现优先级建议

1. ✅ 缺口 ①（过滤生成类名）—— 已实现（fb_004），改动最小、收益最大、零风险（纯减法）
2. 缺口 ③（role/aria-label/data-cy 等）—— 提升可读性，与 ① 可同批做
3. 缺口 ②（鲁棒性后处理）—— 改动中等，需测试
4. 缺口 ④（Shadow DOM）—— 涉及选择器语法变更（`:host >` 链），最复杂

## 关键引用

- @medv/finder penalty 系统: https://github.com/antonmedv/finder/blob/a8d83110d3d035e029c571b94965b629a10a469f/finder.ts#L62-L120
- css-selector-generator class 过滤: https://github.com/fczbkk/css-selector-generator/blob/73a01496240e94470a9224873735b8dbcb060bc6/src/selector-class.ts#L23-L67
- optimal-select 鲁棒性优化: https://github.com/autarc/optimal-select/blob/722d220d2dc54d78121d610a69f6544c2e116721/src/optimize.js#L78-L122
- Chrome DevTools cssPath: https://github.com/ChromeDevTools/devtools-frontend/blob/466be4a9e6a4db8867f8c04e034d3383f624d99f/front_end/panels/elements/DOMPath.ts#L14-L35
- benchmark 能力对比: https://github.com/fczbkk/css-selector-generator-benchmark/blob/98af186499efd82f07e3da6f470f9d9565708645/src/components/CapabilitiesComparison.tsx#L28-L95
- Playwright Locators 优先级: https://playwright.dev/docs/locators
- Testing Library 查询优先级: https://testing-library.com/docs/queries/about/#priority
- Cypress 选择器最佳实践: https://docs.cypress.io/app/core-concepts/best-practices#Selecting-Elements
- Hypothesis Fuzzy Anchoring（跨改动鲁棒锚定研究）: https://hypothes.is/blog/fuzzy-anchoring/
- David Furlong 独立探索（class 不稳定/id 重复/nth 脆弱实证）: https://www.davidfurlong.me/creating-unique-stable-selectors-dom-elements
