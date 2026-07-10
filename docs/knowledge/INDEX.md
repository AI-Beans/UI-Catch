# UI-Catch 知识库索引

> 本文件是 manifest。按需读对应文件，不要一次全读。
> 新沉淀知识后，在此追加一行：`文件 | 主题 | 何时读`

## 文件清单

| 文件 | 主题 | 何时读 |
|---|---|---|
| `technical/main-world-injection.md` | MV3 主世界注入方案——为什么用 `<script>` 标签而非 `chrome.scripting` 的 `world:'MAIN'` | 改注入机制 / 遇到 clipboard 或框架检测失效 / CSP 相关问题 |
| `technical/dom-selector-generation.md` | DOM 元素定位选择器生成的领域调研——主流库对照 + 我们的算法 4 个缺口（生成类名过滤/鲁棒性后处理/语义信号/Shadow DOM）+ 实现优先级 | 决定要不要改选择器算法 / 评估捕获质量 / 实现 fb_004+ 缺口时 |

## 分类说明

- **technical/**：架构决策、算法细节、非显性技术约束
- **domain/**：Chrome 扩展 / DOM 操作 / 前端框架的领域知识
- **product/**：UI-Catch 产品定位、功能演进、用户场景
