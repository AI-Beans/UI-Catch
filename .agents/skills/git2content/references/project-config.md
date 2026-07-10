# Project Config — chronicle.config.json

> A lightweight, version-controlled project context file that helps the Chronicle agent generate more accurate and personalized content.

---

## Overview

`chronicle.config.json` lives in your project root, right next to your code. It's a simple JSON file that gives the agent context about your project — who you are, who you're building for, what stage you're at, and what words to avoid.

This is NOT a database or a CMS. It's a living document that grows with your project. You commit it alongside your code, edit it by hand when things change, and the agent reads it to produce better content.

## Philosophy

- **All fields are optional.** Partial data is better than no data. The agent works fine without this file.
- **Version-controlled.** This file lives in your repo. It changes when your project changes.
- **Human-editable.** Any field can be updated by hand. The agent will respect your edits.
- **Inferrable defaults.** If the file doesn't exist, the agent infers context from git history, directory name, and code structure.

## File Location

```
<project-root>/chronicle.config.json
```

## Schema

```json
{
  // === Layer 0: 项目智慧层 — 项目应该往哪走（反哺积累） ===
  "projectIntelligence": {
    "valueMap": {
      "coreUserValues": ["string — from all Value Chains, the 2-3 recurring user value themes"],
      "unfulfilledPromises": ["string — open questions/promises from cocreate perspectives never followed up"],
      "valueCoverage": "high | medium | low — how much of the identified user value space is covered by commits"
    },
    "trajectory": {
      "direction": "deepening | broadening | drifting | stuck",
      "evidence": "string — why this assessment, referencing narrative chapters or commit patterns",
      "lastAssessed": "ISO date"
    },
    "momentum": {
      "commitCadence": "accelerating | steady | slowing",
      "userValueDensity": "increasing | stable | decreasing — recent commits' user-value density trend",
      "lastAssessed": "ISO date"
    },
    "nextMoveSuggestions": [
      {
        "what": "string — the concrete suggested next move",
        "why": "string — why this and not something else",
        "evidence": ["string — commit hashes, narrative chapter titles, config fields, or cocreate quotes"],
        "priority": "critical | high | medium",
        "status": "suggested | accepted | dismissed | done | stale",
        "suggestedAt": "ISO date",
        "resolvedAt": "ISO date or null",
        "dismissReason": "string or null — why the user rejected it (captured as decision signal)"
      }
    ]
  },

  // === Layer 3: 品牌层 — 你想被怎么认知 ===
  "projectName": "string — human-readable project name",
  "tagline": "string — one-line product description (Chinese, ≤30 chars)",
  "developerName": "string — your name or alias",
  "brandVoice": "string — personality description for content generation",
  "targetAudience": "string — who you're building for",
  "productStage": "string — one of: idea, prototype, early, growth, mature",
  "coreValue": "string — the one thing your product does better than anything else",
  "community": "string — where your users gather",
  "metrics": {
    "users": "string — user count or stage indicator",
    "paidRate": "string — monetization status",
    "highlights": ["string — recent achievements or milestones"]
  },
  "taboos": ["string — words/phrases to NEVER use in generated content"],

  // === Layer 2: PM 补强层 — 你想不到的地方，agent 替你补 ===
  "pmBlindSpots": [
    "string — your natural thinking gaps from a PM perspective"
  ],

  // === Layer 1: 声音层 — 你怎么说，做自己的本我沉淀 ===
  "identity": {
    "origin": "string — your origin story, formative experiences (2-3 sentences)",
    "formativeExperiences": ["string — experiences that shaped who you are"],
    "values": ["string — core values in priority order"],
    "selfDeprecatingPatterns": ["string — how you self-deprecate (your humor DNA)"],
    "languageDNA": {
      "bannedPhrases": ["string — words you'd never use naturally"],
      "favoritePatterns": ["string — sentence structures you gravitate toward"],
      "humorStyle": "string — your humor type and how it manifests"
    },
    "voiceLearnings": [
      { "before": "what agent generated", "after": "what you changed it to", "rule": "the extracted principle" }
    ]
  },
  "memories": [
    { "date": "ISO date", "content": "what you said", "tags": ["category tags"] }
  ]
}
```

> **Note**: Layer 0 accumulates through the 反哺 (feedback) step and evolves based on user acceptance/rejection. Layer 1 grows automatically through use. Layer 2 shrinks as your PM thinking matures. Layer 3 is your steady brand direction. Over time, as your thinking evolves, all layers may merge into one authentic voice.

## Field Reference

### projectName
- **Type**: `string`
- **Required**: No
- **Description**: The human-readable name of your project. If omitted, the agent uses the repository directory name.
- **Example**: `"时光沙盘 (Chronicle Sandbox)"`

### tagline
- **Type**: `string`
- **Required**: No
- **Description**: A one-line product description in Chinese. Used as a seed for narrative taglines and content positioning. Keep it ≤30 characters.
- **Example**: `"代码即自媒体内容"`

### developerName
- **Type**: `string`
- **Required**: No
- **Description**: Your name or alias. If omitted, the agent reads `git config user.name`.
- **Example**: `"KKD304"`

### brandVoice
- **Type**: `string`
- **Required**: No
- **Description**: A personality description that shapes the tone of generated content. Think of it as the persona you want your content to project. Be specific — "professional" is vague, "真诚、温暖、带点强迫症的独立开发者" is useful.
- **Example**: `"真诚、极客、带点强迫症的独立开发者，相信 agent 时代的开发范式"`

### targetAudience
- **Type**: `string`
- **Required**: No
- **Description**: Who you're building for. Helps the agent choose the right language level, platform references, and pain points to emphasize.
- **Example**: `"独立开发者、Build in Public 爱好者、AI Agent 早期采纳者"`

### productStage
- **Type**: `string`
- **Required**: No
- **Enum**: `"idea"` | `"prototype"` | `"early"` | `"growth"` | `"mature"`
- **Description**: Current product stage. Affects how the agent positions content — early-stage projects emphasize vision and learning, growth-stage projects emphasize metrics and user stories.
- **Example**: `"prototype"`

### coreValue
- **Type**: `string`
- **Required**: No
- **Description**: The single most important thing your product does. Used to keep content focused and prevent feature-listing.
- **Example**: `"让 AI Agent 把 Git 提交记录自动翻译成真诚的自媒体文案，零配置、零云端、纯本地"`

### community
- **Type**: `string`
- **Required**: No
- **Description**: Where your users gather. Referenced in cocreate-perspective content and narrative chapters.
- **Example**: `"即刻 + 小红书 + X/Twitter"`

### metrics
- **Type**: `object`
- **Required**: No
- **Description**: Lightweight project metrics. Used to ground narratives and content in real numbers.

#### metrics.users
- **Type**: `string`
- **Example**: `"12K+"` or `"刚刚起步"`

#### metrics.paidRate
- **Type**: `string`
- **Example**: `"5%"` or `"开源免费"`

#### metrics.highlights
- **Type**: `array of strings`
- **Description**: Recent achievements or milestones. Each entry is a short sentence.
- **Example**: `["从 CLI 架构转向纯 Agent Skill 架构", "完成 v1.0.0 协议规范与前端渲染面板"]`

### taboos
- **Type**: `array of strings`
- **Required**: No
- **Description**: Words or phrases to NEVER use in generated content. These are added to the built-in banned word list. Useful if you have personal brand preferences or want to avoid specific platform clichés.
- **Example**: `["绝绝子", "震惊", "保姆级", "全网首发", "大厂"]`

### pmBlindSpots
- **Type**: `array of strings`
- **Required**: No
- **Description**: Your natural thinking gaps from a PM/user-value perspective. The agent uses these to apply EXTRA effort in exactly the areas where your instinct is weakest. Not criticism — it's where you hired a PM. These should shrink over time as your thinking evolves.
- **Example**: `["tends to describe features, not user outcomes", "defaults to implementation angle"]`

### identity
- **Type**: `object`
- **Required**: No
- **Description**: Your authentic voice DNA — extracted from conversations and content edits, NOT manually filled. This is the "be yourself" layer. The agent reads it to make content sound like you, while the Value Chain handles the thinking angle.

#### identity.origin
- **Type**: `string`
- **Description**: Your origin story in 2-3 sentences. What shaped you, what you came from, why you build.
- **Example**: `"前大厂推荐系统工程师，受不了开不完的会转做独立开发。相信 agent 时代的开发范式。"`

#### identity.formativeExperiences
- **Type**: `array of strings`
- **Description**: Key experiences that shaped who you are. These become metaphor sources and authenticity anchors in content.
- **Example**: `["从小看做木匠的爸爸打磨东西——对细节的强迫是遗传的", "大厂3年学会了什么叫'不赋能'"]`

#### identity.values
- **Type**: `array of strings`
- **Description**: Core values in priority order. These guide what the content emphasizes.
- **Example**: `["自由 > 稳定", "具体 > 抽象", "手艺 > 规模"]`

#### identity.selfDeprecatingPatterns
- **Type**: `array of strings`
- **Description**: How you self-deprecate. Self-deprecation is the most authentic form of humor — capturing it makes content feel real.
- **Example**: `["经常自嘲'懒'，但实际是实用主义", "说'懒得学'来掩饰'不想在无聊的事上花时间'"]`

#### identity.languageDNA
- **Type**: `object`
- **Description**: Your language preferences at the sentence level. More precise than `brandVoice` — this is HOW you construct sentences, not WHO you are.

#### identity.languageDNA.bannedPhrases
- **Type**: `array of strings`
- **Description**: Phrases you'd never use naturally. Stronger and more personal than `taboos` — these are about YOUR voice, not platform norms.
- **Example**: `["赋能", "闭环", "抓手", "不忘初心"]`

#### identity.languageDNA.favoritePatterns
- **Type**: `array of strings`
- **Description**: Sentence structures you naturally gravitate toward. The agent should use these as templates.
- **Example**: `["具体数字对比（从15分钟到5秒）", "反问句式", "场景还原式开头"]`

#### identity.languageDNA.humorStyle
- **Type**: `string`
- **Description**: Your humor type and how it shows up in content.
- **Example**: `"自嘲 + 具体场景还原，不玩梗不追热点"`

#### identity.voiceLearnings
- **Type**: `array of objects`
- **Description**: Extracted from your content edits. When you change generated content, the before→after diff is a precise voice signal. Each entry captures what the agent generated, what you changed it to, and the extracted rule.
- **Example**: `[{"before": "极大地提升了用户体验", "after": "导出从15分钟变成5秒", "rule": "用具体数字替代抽象形容词"}]`

### memories
- **Type**: `array of objects`
- **Required**: No
- **Description**: Things you said in conversation that reveal who you are. Auto-extracted by the agent — you never need to fill this manually. Each memory is a single observation tagged for retrieval.
- **Example**: `[{"date": "2026-05-28", "content": "用户说做自己不累，演别人累", "tags": ["价值观", "authenticity"]}]`

## Full Example

```json
{
  "projectIntelligence": {
    "valueMap": {
      "coreUserValues": [
        "消除'将就'——用户不想因为工具限制而放弃创作想法",
        "一键完成——零配置、拖入即用、不需要学习"
      ],
      "unfulfilledPromises": [
        "cocreate #4 承诺了'让不同引擎的用户都能无缝接入'——至今无后续 commit"
      ],
      "valueCoverage": "medium"
    },
    "trajectory": {
      "direction": "deepening",
      "evidence": "叙事从'消除将就'到'用户用吐槽投出的功能'到'创意归属'——每个章节都在深化核心用户价值而非横向扩展",
      "lastAssessed": "2026-05-28T17:23:00Z"
    },
    "momentum": {
      "commitCadence": "steady",
      "userValueDensity": "increasing",
      "lastAssessed": "2026-05-28T17:23:00Z"
    },
    "nextMoveSuggestions": [
      {
        "what": "兑现 cocreate 中承诺的引擎兼容性（Godot/Unreal 导出支持）",
        "why": "这是你亲手画了两次的饼（commit #2 和 #4 的 cocreate），用户在等。闭环比新功能更有信用。",
        "evidence": ["commit f4e209a cocreate", "commit e93ab5c cocreate", "narrative chapter '用户用吐槽投出的功能'"],
        "priority": "critical",
        "status": "suggested",
        "suggestedAt": "2026-05-28T17:23:00Z",
        "resolvedAt": null,
        "dismissReason": null
      }
    ]
  },
  "projectName": "Git2Content",
  "tagline": "代码即自媒体内容",
  "developerName": "KKD304",
  "brandVoice": "真诚、极客、带点强迫症的独立开发者，相信 agent 时代的开发范式",
  "targetAudience": "独立开发者、Build in Public 爱好者、AI Agent 早期采纳者",
  "productStage": "prototype",
  "coreValue": "让 AI Agent 把 Git 提交记录自动翻译成真诚的自媒体文案，零配置、零云端、纯本地",
  "community": "即刻 + 小红书 + X/Twitter",
  "metrics": {
    "users": "刚刚起步",
    "paidRate": "开源免费",
    "highlights": [
      "从 CLI 架构转向纯 Agent Skill 架构",
      "完成 v1.0.0 协议规范与前端渲染面板"
    ]
  },
  "taboos": ["绝绝子", "震惊", "保姆级", "哭晕", "炸裂", "逆天", "yyds", "全网首发", "大厂"],
  "pmBlindSpots": [
    "倾向于描述做了什么，而不是用户得到了什么",
    "习惯从实现角度解释，不习惯从结果角度",
    "文档类 commit 容易写'我写了文档'而不是'你不用猜了'"
  ],
  "identity": {
    "origin": "前大厂推荐系统工程师，受够了无意义的会议和内卷，转做独立开发。相信 agent 时代的开发范式，对用户注意力零浪费。",
    "formativeExperiences": [
      "大厂3年，学会了什么叫'不赋能'——对黑话的厌恶是从骨子里长出来的",
      "从小看做木匠的爸爸打磨东西——对细节的强迫症有遗传",
      "从 CLI 删到 Skill 的那个瞬间——领悟到减法的力量"
    ],
    "values": ["自由 > 稳定", "具体 > 抽象", "减法 > 加法", "手艺 > 规模"],
    "selfDeprecatingPatterns": [
      "经常自嘲'懒'或'纠结'，但实际是极度的实用主义和完美主义",
      "用'懒得学'来掩饰'不想在无聊的事上花时间'"
    ],
    "languageDNA": {
      "bannedPhrases": ["赋能", "闭环", "抓手", "沉淀", "不忘初心"],
      "favoritePatterns": [
        "具体数字对比（从X小时到Y秒）",
        "场景还原式开头（你有没有过这种经历？）",
        "反问句式",
        "破折号补充真实原因"
      ],
      "humorStyle": "自嘲 + 具体场景还原，不玩梗不追热点"
    },
    "voiceLearnings": [
      {
        "before": "极大地提升了用户体验",
        "after": "导出从15分钟变成5秒",
        "rule": "用具体数字替代抽象形容词"
      }
    ]
  },
  "memories": [
    { "date": "2026-05-28", "content": "用户说'做自己不累，演别人累'", "tags": ["价值观", "authenticity"] },
    { "date": "2026-05-28", "content": "用户说'我就是PM这部分还不够精通'", "tags": ["自我认知", "pm-gap"] },
    { "date": "2026-05-28", "content": "用户说希望思维训练成熟后三层融合为一层", "tags": ["成长方向", "evolution"] }
  ]
}
```

## How the Agent Uses This File

### Project Intelligence Layer (Layer 0)
0. **Feedback loop**: `projectIntelligence` is populated by Step 6c (反哺) after 3+ runs. It represents the agent's accumulated understanding of where the project should go — not what the developer built, but what the project needs.
1. **Value map**: `valueMap.coreUserValues` summarizes the 2-3 recurring user value themes across all Value Chains. Used to check whether new commits serve these values or drift from them.
2. **Trajectory tracking**: `trajectory.direction` is assessed each run (when Step 6c triggers). A project "deepening" means commits are reinforcing core value; "broadening" means adding new value dimensions; "drifting" means the narrative arc is losing coherence; "stuck" means no meaningful progress.
3. **Suggestion lifecycle**: `nextMoveSuggestions` tracks every suggestion the agent has made. Accepted suggestions inform future analysis. Dismissed suggestions (with `dismissReason`) are as valuable as accepted ones — they reveal the developer's real priorities.
4. **Stale management**: Suggestions in `status: "suggested"` for 3+ runs without action are moved to `status: "stale"` and excluded from future output. The agent doesn't nag.

### Brand Layer (Layer 3)
1. **Content generation**: `brandVoice` and `targetAudience` shape the tone and focus of all three perspectives (authentic, visual, cocreate).
2. **Narrative**: `coreValue` and `productStage` help the agent write narratives that feel grounded and appropriately ambitious.
3. **Taboo enforcement**: `taboos` are merged with the built-in banned word list. Every generated sentence is checked against them.
4. **Metrics grounding**: `metrics.highlights` can be woven into narrative chapters to add concrete achievements.
5. **Personalization**: `developerName` and `community` make cocreate-perspective content feel specific to the developer's actual community.

### PM Reinforcement Layer (Layer 2)
6. **Blind spot compensation**: `pmBlindSpots` tells the agent where your natural thinking is weakest. The agent applies EXTRA PM effort in these areas — more "so what?" iterations, stronger user-outcome framing, explicit before→after transformations.
7. **Shrinking over time**: As your PM thinking matures, you can remove blind spots. If the agent notices you consistently produce user-centric content in a previously weak area, it can suggest removing that blind spot.

### Voice Identity Layer (Layer 1)
8. **Voice DNA injection**: `identity.languageDNA` directly shapes sentence construction — favorite patterns become templates, banned phrases are enforced alongside taboos.
9. **Origin and values as metaphor sources**: `identity.origin` and `formativeExperiences` provide authentic metaphor material (e.g., "like my dad sanding wood" instead of generic comparisons).
10. **Self-deprecation as authenticity anchor**: `identity.selfDeprecatingPatterns` ensures humor feels like you, not like a content factory.
11. **Voice learnings as correction log**: `identity.voiceLearnings` records your editorial preferences — each entry is a rule the agent must follow in future generation.
12. **Memories as context retrieval**: `memories` provide just-in-time context. When generating content about a topic that matches a memory tag, the agent weaves in that memory.

## Lifecycle

### First Run (No Config)
If `chronicle.config.json` doesn't exist, the agent:
1. Infers what it can from the repo (name, developer from git config).
2. Asks 2-3 quick questions to fill the most impactful fields.
3. Generates the config file with Layer 3 (brand) populated. Layers 1 and 2 start empty and grow through use.

### Subsequent Runs (Config Exists)
The agent reads the config and uses all four layers. Three additional things happen automatically:

1. **Context accumulation**: If the user provides new context in conversation (e.g., "我们现在有5万用户了", "目标用户变了"), the agent updates the config file accordingly.
2. **Identity extraction** (Step 7): After writing chronicle.json, the agent reviews the conversation for voice signals — expressions of values, humor patterns, language preferences, self-deprecation, origin fragments. These are extracted into Layer 1 (identity) and Layer 2 (pmBlindSpots) WITHOUT requiring user action. See SKILL.md Step 7 for details.
3. **Project intelligence feedback** (Step 6c): After 3+ runs, the agent analyzes all accumulated data and generates actionable guidance. Deposited into Layer 0 (projectIntelligence). User reactions (accept/dismiss) are captured as decision signals. See SKILL.md Step 6c for details.

### Manual Edits
The developer can edit the config by hand at any time. The agent respects manual edits and never overwrites them without asking.

### Layer Evolution
- **Layer 0 (project intelligence)**: Accumulates through 反哺 step. Suggestions evolve through status lifecycle (suggested → accepted/done or dismissed/stale). The value map and trajectory are reassessed each run.
- **Layer 1 (voice)**: Grows automatically. Never shrinks unless the user prunes it manually.
- **Layer 2 (PM blind spots)**: Shrinks as thinking matures. The agent may suggest removing entries when content quality in that area consistently meets PM standards.
- **Layer 3 (brand)**: Stable. Changes only when the project's direction or positioning shifts.
- **Ultimate goal**: As PM thinking becomes second nature, all four layers merge into one authentic voice that is both true to the developer AND user-centric AND strategically directed.

## Design Principles

1. **Lightweight**: This is a single JSON file, not a database. No schemas to migrate, no migrations to run.
2. **Optional**: Every field has sensible defaults. An empty `{}` is valid.
3. **Living**: The file evolves with the project. It's not a one-time setup — it grows as the project grows.
4. **Version-controlled**: Committed alongside code, so the config's history is the project's history.
5. **Human-first**: Written by humans, for humans. The agent reads it, but the developer owns it.
