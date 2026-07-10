# Chronicle Protocol v1.0.0

> The single source of truth for the `chronicle.json` data contract.

## Overview

The Chronicle Protocol defines a JSON structure that captures Git commit history translated into multi-perspective social media content. It serves as the bridge between the local agent (which extracts and translates commits) and the web preview (which renders and allows refinement).

**Version**: 1.0.0
**Stability**: The `schemaVersion` field enables future protocol evolution. Agents must read this field and reject versions they don't understand.

---

## Top-Level Structure

```json
{
  "schemaVersion": "1.0.0",
  "repoName": "string",
  "activeBranch": "string",
  "lastGeneratedAt": "string",
  "developerName": "string",
  "stats": { ... },
  "narrative": { ... },
  "projectIntelligence": { ... },
  "curation": { ... },
  "developmentGuidance": { ... },
  "commits": [ ... ]
}
```

### Field Definitions

| Field               | Type   | Required | Description                                                       |
| -------------------- | ------ | -------- | ----------------------------------------------------------------- |
| `schemaVersion`      | string | yes      | Protocol version. Must be `"1.0.0"`.                              |
| `repoName`           | string | yes      | Project directory name (from `basename` of project root).         |
| `activeBranch`       | string | yes      | Current Git branch (from `git rev-parse --abbrev-ref HEAD`).      |
| `lastGeneratedAt`    | string | yes      | ISO 8601 timestamp of when this file was last generated/updated.  |
| `developerName`      | string | yes      | Developer's name (from `git config user.name`).                   |
| `stats`              | object | yes      | Aggregate statistics. See below.                                  |
| `narrative`          | object | no       | Project development narrative — a holistic story generated from git history. See below. |
| `projectIntelligence`| object | no       | Project intelligence snapshot from 反哺 analysis. See below.     |
| `curation`           | object | no       | Editorial curation decisions — which commits to tell, group, or skip. See below. |
| `developmentGuidance`| object | no       | Strategic guidance for what to build next, based on narrative gaps. See below. |
| `commits`            | array  | yes      | Ordered array of commit entries. Earliest first.                  |

---

## Stats Object

```json
{
  "totalCommits": 4,
  "totalWords": 1420
}
```

| Field           | Type    | Required | Description                                                    |
| --------------- | ------- | -------- | -------------------------------------------------------------- |
| `totalCommits`  | integer | yes      | Number of commit entries in the `commits` array.              |
| `totalWords`    | integer | yes      | Total character count across all `content` fields in all perspectives. This gives a rough measure of content volume. |

---

## Narrative Object

The `narrative` field is an **optional** top-level object that tells the project's development story as a coherent narrative — not a commit-by-commit changelog, but a human-readable story with origin, chapters, and current state.

```json
{
  "narrative": {
    "tagline": "一键像素化你的创作灵感",
    "origin": "KKD 在开发独立游戏时，饱受逐帧绘制像素动作的苦。市面上的工具要么太重，要么太丑，要么根本没有序列帧导出。于是他决定自己写一个。",
    "chapters": [
      {
        "title": "像素梦的起点",
        "story": "项目从一行 Canvas 像素化代码开始。那时候连调色盘都没有，但当测试图第一次在视口里变成 8-bit 复古小人的瞬间，所有的熬夜都觉得值了。这是 PixelMotion 的第一声啼哭。",
        "commitIds": [1]
      },
      {
        "title": "被用户催出来的功能",
        "story": "群里的游戏开发者天天催更序列帧导出，有人甚至开玩笑说"不做就寄刀片"。四天熬夜重写拼图算法，终于实现了 Unity 可用的 Sprite Sheet 打包。这个功能不是产品经理规划的，是用户用吐槽投票催出来的。",
        "commitIds": [2, 3]
      },
      {
        "title": "给像素小人安个家",
        "story": "看着用户晒出的上千张像素作品，KKD 觉得不能让它们散养在乱糟糟的文件夹里。角色橱窗功能上线，每个像素角色有了自己的展示单间，强迫症表示极度舒适。",
        "commitIds": [4]
      }
    ],
    "current": "PixelMotion 已经拥有超过 12,000 名注册用户，服务器扛过了流量高峰，角色橱窗刚刚上线。下一步计划支持更多引擎格式和团队协作功能。",
    "tone": "真诚、温暖、带点强迫症的独立开发者"
  }
}
```

### Field Definitions

| Field       | Type   | Required | Description                                                                                                       |
| ----------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `tagline`   | string | yes      | One-line project description, punchy and memorable. ≤30 Chinese characters.                                       |
| `origin`    | string | yes      | How and why the project started. 2-3 sentences, warm and relatable. Should read like a good project README intro. |
| `chapters`  | array  | yes      | Array of narrative chapters, each representing a phase of development. 2-6 chapters is typical.                   |
| `current`   | string | yes      | Where the project is now, what's the current state, and what's next. 2-3 sentences.                               |
| `tone`      | string | yes      | The overall personality tag — a short phrase capturing the developer's voice. e.g. `"真诚、温暖、带点强迫症的独立开发者"`.  |

### Chapter Entry

Each element in the `chapters` array:

| Field        | Type           | Required | Description                                                                                                                   |
| ------------ | -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `title`      | string         | yes      | Chapter/phase title. ≤20 Chinese characters. Should evoke the feeling of this phase, not just describe it.                    |
| `story`      | string         | yes      | Narrative paragraph about this phase. 100-200 Chinese characters. Tell what happened, what was learned, what changed.        |
| `commitIds`  | array[integer] | yes      | References to commit `id` values in the `commits` array. Groups related commits into one narrative phase. Minimum 1 item.     |

### Narrative Rules

- **Optional field**: `narrative` can be omitted entirely. The frontend must handle absence gracefully.
- **Not a changelog**: The narrative should feel like reading a compelling blog post intro or a good project README — not a dry list of features shipped.
- **Human perspective**: Write from an outsider/user perspective. Emphasize the human story, the "why" behind changes, the evolution of thinking.
- **Chapter grouping**: Not every commit needs its own chapter. Group related commits that form a coherent phase. 2-6 chapters is the sweet spot.
- **commitIds referencing**: Each `commitIds` array references the `id` field of commits in the `commits` array. All referenced commits should exist.
- **Voice consistency**: The `tone` field and the writing style across `origin`, `chapters[].story`, and `current` should feel like the same person telling a story.

---

## Project Intelligence Object

The `projectIntelligence` field is an **optional** top-level object that captures the skill's accumulated understanding of where the project should go. Populated by Step 6c (反哺) when run count ≥ 3.

This is a SNAPSHOT of the config's `projectIntelligence` at the time of generation, so the web preview can display it without reading the config file.

Structure mirrors `chronicle.config.json → projectIntelligence` (see project-config.md Layer 0):

| Field | Type | Required | Description |
|---|---|---|---|
| `valueMap` | object | no | Core user values, unfulfilled promises, coverage assessment |
| `trajectory` | object | no | Project direction + evidence + last assessed date |
| `momentum` | object | no | Commit cadence + value density trend + last assessed date |
| `nextMoveSuggestions` | array | no | Suggested next moves with status lifecycle |

The web preview can use this data to display a "Project Intelligence" panel showing trajectory, momentum, and suggestions.

---

## Curation Object

The `curation` field captures the **editorial decisions** made during Step 2 — which commits were selected for storytelling, which were grouped, and which were skipped. This provides transparency into the curation process and allows the user to understand (and override) the agent's editorial judgment.

```json
{
  "curation": {
    "totalScanned": 8,
    "plan": [
      {
        "hashes": ["74d60c9"],
        "decision": "star",
        "reason": "项目首发上线，完整的用户痛点故事"
      },
      {
        "hashes": ["4b37ca4", "1031897"],
        "decision": "group",
        "reason": "框选功能 + 措辞微调 = 从抓一个到抓一片的完整故事"
      },
      {
        "hashes": ["5cae8da"],
        "decision": "skip",
        "reason": "专家预设是对三栏构建器的补充，不是独立故事"
      }
    ],
    "recommendedOrder": ["74d60c9", "692fcaa", "4b37ca4+1031897", "640242c", "9fc4ea0", "8c3a8bd"],
    "narrativeArc": "从痛点到第一行代码 → 抓一个到抓一片 → 从工具到工作台 → 像素灵魂注入 → 从附属品到通用桥梁"
  }
}
```

### Field Definitions

| Field              | Type           | Required | Description                                                        |
| ------------------ | -------------- | -------- | ------------------------------------------------------------------ |
| `totalScanned`     | integer        | yes      | Total number of commits scanned during curation.                   |
| `plan`             | array          | yes      | Array of curation decisions. Each entry covers one or more commits. |
| `plan[].hashes`    | array[string]  | yes      | Commit hashes covered by this decision.                            |
| `plan[].decision`  | string         | yes      | One of `"star"`, `"group"`, `"skip"`.                              |
| `plan[].reason`    | string         | yes      | Why this decision was made. 1-2 sentences.                         |
| `recommendedOrder` | array[string]  | yes      | Suggested reading order for posts. Grouped commits shown as `"hash+hash"`. |
| `narrativeArc`     | string         | no       | One-line summary of the overall story arc across selected posts.   |

### Curation Rules

- **Not every commit appears in the final output.** Skipped commits still exist in the `commits` array (for completeness), but with minimal content (`userInsight: null`, empty perspectives).
- **Grouped commits are translated as ONE story.** One Value Chain, one set of perspectives, one `story` field — with `commitIds` referencing all grouped commits.
- **The user can override.** The curation plan is a recommendation. If the user says "I want to tell commit X too", adjust accordingly.

---

## Development Guidance Object

The `developmentGuidance` field provides **strategic direction** for what to build next, based on what stories are missing from the current commit history. This is the "forward-looking" counterpart to `projectIntelligence` (which is backward-looking analysis).

```json
{
  "developmentGuidance": {
    "storyGaps": [
      "Expert presets are a feature, but the story of HOW they were designed is untold",
      "Community features keep getting promised in cocreate but never shipped"
    ],
    "nextMilestone": "A community-driven feature (custom preset sharing) would create the strongest cocreate story and invite real user participation",
    "suggestedCommitType": "community-driven feature — cocreate perspectives keep asking users what they want, but nothing they asked for has shipped yet",
    "generatedAt": "2026-06-05T22:30:00+08:00"
  }
}
```

### Field Definitions

| Field                 | Type          | Required | Description                                                             |
| --------------------- | ------------- | -------- | ----------------------------------------------------------------------- |
| `storyGaps`           | array[string] | yes      | What user needs or stories are missing from the current commit history. |
| `nextMilestone`       | string        | yes      | What to build next to create the strongest social media story.          |
| `suggestedCommitType` | string        | yes      | What kind of commit would be most compelling next (feature/design/community). |
| `generatedAt`         | string        | yes      | ISO 8601 timestamp of when this guidance was generated.                 |

### Guidance Rules

- **Evidence-based**: Every `storyGap` should reference something concrete (a cocreate promise, a README claim, a feature in the codebase that hasn't been told).
- **Not generic startup advice**: "Talk to your users" is not guidance. "Ship custom preset sharing — your cocreate posts keep asking what users want, and preset sharing is the most-requested feature in comments" is guidance.
- **One milestone**: Focus on ONE next step, not a roadmap. Solo developers do one thing at a time.
- **Can be empty**: If there's nothing genuinely insightful to say, omit `developmentGuidance` entirely.

---

## Commit Entry

Each element in the `commits` array follows this structure:

```json
{
  "id": 1,
  "hash": "a1c89f2",
  "branch": "main",
  "dateLabel": "03.10",
  "timestamp": "2026-03-10T14:32:00Z",
  "commitTitle": "像素渲染内核上线",
  "commitMessage": "feat: core pixelization algorithm & custom canvas viewport logic",
  "codeDiffSnippet": "+++ b/src/App.jsx\n+ const pixelate = (img) => {\n+   const ctx = canvas.getContext('2d');\n+   ctx.imageSmoothingEnabled = false;\n+ }",
  "userInsight": "用户想要快速将图片转化为像素风格，但现有工具要么太重要么效果差",
  "valueStatement": "一键将任意图片转化为8-bit像素画，零配置，拖入即转",
  "perspectives": {
    "authentic": { ... },
    "visual": { ... },
    "cocreate": { ... }
  },
  "activePerspective": "authentic",
  "isPublished": false,
  "socialMetrics": {
    "likes": 0,
    "bookmarks": 0
  }
}
```

### Field Definitions

| Field               | Type    | Required | Description                                                                       |
| -------------------- | ------- | -------- | --------------------------------------------------------------------------------- |
| `userInsight`        | string\|null | no  | The core user frustration or motivation this commit addresses. 1-2 sentences. Set to `null` if the commit has no user-facing impact (e.g., pure internal refactor). |
| `valueStatement`     | string  | no       | One sentence: the user transformation this commit delivers. Grounded in the Value Extraction Chain. E.g., "Users can now export pixel art in one click instead of manually aligning frames for 15 minutes." |
| `id`                 | integer | yes      | Sequential identifier (1, 2, 3...). Used for ordering and referencing.            |
| `hash`               | string  | yes      | Short Git commit hash (typically 7 characters from `%h`).                         |
| `branch`             | string  | yes      | Branch name where this commit was made.                                           |
| `dateLabel`          | string  | yes      | Human-readable date in `MM.DD` format (e.g., `"03.10"`, `"12.05"`).              |
| `timestamp`          | string  | yes      | Full ISO 8601 timestamp from Git `%aI` (author date, strict ISO).                 |
| `commitTitle`        | string  | yes      | Short descriptive title in Chinese, ≤25 characters. Articulates the USER OUTCOME, not the feature description. |
| `commitMessage`      | string  | yes      | The original Git commit message (subject line).                                   |
| `codeDiffSnippet`    | string  | yes      | Truncated code diff for context (≤1500 chars). Empty string if unavailable.       |
| `perspectives`       | object  | yes      | Three translated perspectives. See below.                                         |

**Display guidance**: `codeDiffSnippet` and `hash` are reference material. In the storybook web preview, they appear in a collapsible metadata drawer (expandable via ⋯), not as primary content.
| `activePerspective`  | string  | yes      | Currently selected perspective. One of `"authentic"`, `"visual"`, `"cocreate"`. Default `"authentic"`. |
| `story`              | string  | no       | Blended reader-facing narrative — the **one post** shown to the user. 80-150 Chinese chars. No "我", developer invisible. Follows beat: pain trigger (opt) → what changed → what it means → try/imagine (opt). Generated by blending the selected perspective. |
| `selectedPerspective`| object  | no       | Which perspective the agent selected and why. `{ "perspective": "visual", "reason": "Feature launch → user pain+relief" }`. |
| `isPublished`        | boolean | yes      | Whether this commit's content has been published. Default `false`.                |
| `socialMetrics`      | object  | yes      | Engagement metrics. See below.                                                    |

---

## Perspectives Object

Each commit contains exactly three perspectives, each with identical field structure:

```json
{
  "authentic": {
    "title": "第一行像素代码动起来的时候 👾",
    "content": "【📅 独立开发者日记 - a1c89f2】\n今天我把 PixelMotion 的第一行像素渲染代码合进了 main 分支。\n\n...",
    "brandVoiceTag": "🌱 真实不装",
    "visualHint": "📸 最佳配图：展示网页端拖拽卡片、外框按ID自动归类对齐的GIF动图"
  },
  "visual": {
    "title": "一键将图片转成 FC 游戏像素画！",
    "content": "【👾 一键像素转换器首发上线】\n\n💡 独立开发者第一款效率工具上线：\n- 支持 JPG/PNG 极速一键提取 8-bit 复古像素风。\n- 拒绝繁琐配置，拖入即转，秒回 FC 游戏机时代。\n\n...",
    "brandVoiceTag": "⚡ 极速获得",
    "visualHint": "📸 伴生视觉建议：10-12秒的功能高光点动态操作视频"
  },
  "cocreate": {
    "title": "为什么我要自己写一个像素转换器？",
    "content": "【💡 聊聊我的创造初衷】\n\n大家好，我是 KKD。因为在开发自己独立游戏的时候，饱受逐帧绘制像素动作的苦，所以我动手写了 PixelMotion。\n\n...",
    "brandVoiceTag": "💬 用户共创",
    "visualHint": "📸 伴生视觉建议：用户在群里吐槽与功能上线的对比截图"
  }
}
```

### Perspective Field Definitions

| Field            | Type   | Required | Description                                                                        |
| ---------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| `title`          | string | yes      | Post title. Should be punchy, include one relevant emoji, and be ≤25 characters.   |
| `content`        | string | yes      | Full post body text. 80-150 Chinese characters (3-4 sentences). Grounded in specific commit details. |
| `brandVoiceTag`  | string | yes      | Voice classification. Format: `emoji + tag text`. See standard tags below.         |
| `visualHint`     | string | yes      | Concrete suggestion for accompanying image or video. Should describe a specific visual format (e.g., "GIF of drag-and-drop UI", "screenshot comparison"). |

### Standard brandVoiceTag Values

Each perspective uses its emoji prefix as the fixed anchor. The tag text is free-form — generate whatever 2-4 Chinese characters best capture the PM intent of that specific post. The examples below are a starting vocabulary, NOT an exhaustive list:

**Authentic (🌱)**: 真实不装, 浪漫本我, 暴露脆弱, 听取吐槽, 建设者信念, 手艺坚守, 不服气的夜

**Visual (⚡)**: 极速获得, 直击痛点, 效率利器, 数据佐证, 告别XX, 一键XX

**Cocreate (💬)**: 用户共创, 温暖互助, 陪伴反馈, 极速迭代, 邀请共创

The rule: emoji prefix MUST match the perspective (🌱/⚡/💬). Tag text should be 2-4 Chinese characters, contextually appropriate to the specific content. Create new tags when the standard ones don't fit — freshness beats repetition.

---

## Social Metrics Object

```json
{
  "likes": 0,
  "bookmarks": 0
}
```

| Field       | Type    | Required | Description                                |
| ----------- | ------- | -------- | ------------------------------------------ |
| `likes`     | integer | yes      | Number of likes. Default `0`.              |
| `bookmarks` | integer | yes      | Number of bookmarks/saves. Default `0`.    |

---

## Incremental Update Rules

When an existing `chronicle.json` is found in the project's `output/` directory:

1. Read the existing file.
2. Find the maximum `id` value in the existing `commits` array.
3. For each new commit, check if its `hash` already exists in the file.
4. If the hash exists: skip it (the user may have edited that entry).
5. If the hash is new: append it with `id` = (max existing id) + 1, incrementing for each new commit.
6. Update `stats.totalCommits` and `stats.totalWords`.
7. Update `lastGeneratedAt` to the current timestamp.
8. Keep `repoName`, `activeBranch`, and `developerName` from the current git state (they may have changed).
9. `projectIntelligence` is refreshed from the latest 反哺 analysis (if Step 6c ran). If it didn't run, keep existing value.

---

## Full Example

This is a complete, valid `chronicle.json` with 4 commits:

```json
{
  "schemaVersion": "1.0.0",
  "repoName": "PixelMotion",
  "activeBranch": "main",
  "lastGeneratedAt": "2026-05-26T17:23:00Z",
  "developerName": "KKD",
  "stats": {
    "totalCommits": 4,
    "totalWords": 1420
  },
  "narrative": {
    "tagline": "一键像素化你的创作灵感",
    "origin": "KKD 在开发独立游戏时，饱受逐帧绘制像素动作的苦。市面上的工具要么太重，要么太丑，要么根本没有序列帧导出。于是他决定自己写一个。",
    "chapters": [
      {
        "title": "像素梦的起点",
        "story": "项目从一行 Canvas 像素化代码开始。那时候连调色盘都没有，但当测试图第一次在视口里变成 8-bit 复古小人的瞬间，所有的熬夜都觉得值了。这是 PixelMotion 的第一声啼哭。",
        "commitIds": [1]
      },
      {
        "title": "被用户催出来的功能",
        "story": "群里的游戏开发者天天催更序列帧导出，有人甚至开玩笑说"不做就寄刀片"。四天熬夜重写拼图算法，终于实现了 Unity 可用的 Sprite Sheet 打包。这个功能不是产品经理规划的，是用户用吐槽投票催出来的。",
        "commitIds": [2, 3]
      },
      {
        "title": "给像素小人安个家",
        "story": "看着用户晒出的上千张像素作品，KKD 觉得不能让它们散养在乱糟糟的文件夹里。角色橱窗功能上线，每个像素角色有了自己的展示单间，强迫症表示极度舒适。",
        "commitIds": [4]
      }
    ],
    "current": "PixelMotion 已经拥有超过 12,000 名注册用户，服务器扛过了流量高峰，角色橱窗刚刚上线。下一步计划支持更多引擎格式和团队协作功能。",
    "tone": "真诚、温暖、带点强迫症的独立开发者"
  },
  "projectIntelligence": {
    "valueMap": {
      "coreUserValues": ["消除用户和结果之间的障碍", "做自己不累"],
      "unfulfilledPromises": [],
      "valueCoverage": "high"
    },
    "trajectory": {
      "direction": "deepening",
      "evidence": "叙事章节持续深化核心价值",
      "lastAssessed": "2026-05-28T17:23:00Z"
    },
    "momentum": {
      "commitCadence": "steady",
      "userValueDensity": "increasing",
      "lastAssessed": "2026-05-28T17:23:00Z"
    },
    "nextMoveSuggestions": []
  },
  "commits": [
    {
      "id": 1,
      "hash": "a1c89f2",
      "branch": "main",
      "dateLabel": "03.10",
      "timestamp": "2026-03-10T14:32:00Z",
      "commitTitle": "像素渲染内核上线",
      "commitMessage": "feat: core pixelization algorithm & custom canvas viewport logic",
      "codeDiffSnippet": "+++ b/src/App.jsx\n+ const pixelate = (img) => {\n+   const ctx = canvas.getContext('2d');\n+   ctx.imageSmoothingEnabled = false;\n+ }",
      "perspectives": {
        "authentic": {
          "title": "第一行像素代码动起来的时候 👾",
          "content": "【📅 独立开发者日记 - a1c89f2】\n今天我把 PixelMotion 的第一行像素渲染代码合进了 main 分支。\n\n写算法的过程其实极其枯燥也充满卡点，甚至还没有做精细的调色盘限制。但当那张测试图在 Canvas 视口里一键变成 8-bit 复古小人并动起来的那一刻，我突然觉得，这些天为了"不服气"而自己造轮子熬的夜，都值得了。还很粗糙，求轻喷！",
          "brandVoiceTag": "🌱 真实不装",
          "visualHint": "📸 最佳配图：展示网页端拖拽卡片、外框按ID自动归类对齐的GIF动图"
        },
        "visual": {
          "title": "一键将图片转成 FC 游戏像素画！",
          "content": "【👾 一键像素转换器首发上线】\n\n💡 独立开发者第一款效率工具上线：\n- 支持 JPG/PNG 极速一键提取 8-bit 复古像素风。\n- 拒绝繁琐配置，拖入即转，秒回 FC 游戏机时代。\n\n主页直达体验，让你的创作多一种极具个性的像素表达！",
          "brandVoiceTag": "⚡ 极速获得",
          "visualHint": "📸 伴生视觉建议：10-12秒的功能高光点动态操作视频"
        },
        "cocreate": {
          "title": "为什么我要自己写一个像素转换器？",
          "content": "【💡 聊聊我的创造初衷】\n\n大家好，我是 KKD。因为在开发自己独立游戏的时候，饱受逐帧绘制像素动作的苦，所以我动手写了 PixelMotion。第一版终于上线了，很想听听同样喜欢像素风的你们的真实意见！评论区说说，下个功能你们想加点什么？",
          "brandVoiceTag": "💬 用户共创",
          "visualHint": "📸 伴生视觉建议：用户在群里吐槽与功能上线的对比截图"
        }
      },
      "activePerspective": "authentic",
      "isPublished": true,
      "socialMetrics": {
        "likes": 241,
        "bookmarks": 85
      }
    },
    {
      "id": 2,
      "hash": "f4e209a",
      "branch": "main",
      "dateLabel": "04.12",
      "timestamp": "2026-04-12T10:15:00Z",
      "commitTitle": "序列帧打包导出",
      "commitMessage": "feat(exporter): implement grid-aligned sprite-sheet packing algorithm for Unity integration",
      "codeDiffSnippet": "+++ b/src/Exporter.js\n+ export const packSpriteSheet = (frames) => {\n+   const cols = Math.ceil(Math.sqrt(frames.length));\n+   return { cols, width: cols * frameWidth };\n+ }",
      "perspectives": {
        "authentic": {
          "title": "Unity老哥们催更的SpriteSheet搞定了 🏡",
          "content": "【📅 独立开发者日记 - f4e209a】\n群里做游戏的老哥天天催我："KKD，我们要序列帧，要 Sprite Sheet，不然进 Unity 没法做动作啊。"\n\n好嘛，用户的催更就是我的开发指令。熬夜四天重写了拼图导出算法，现在支持一键打包 PNG 序列帧大图。调坐标锁的时候卡了半天，但想到能给同样做独立游戏的朋友省下大量对齐时间，手酸也值了。去体验下，不好用随时艾特我！",
          "brandVoiceTag": "🌱 听取吐槽",
          "visualHint": "📸 最佳配图：展示网页端拖拽卡片、外框按ID自动归类对齐的GIF动图"
        },
        "visual": {
          "title": "独立游戏开发提效10倍！一键SpriteSheet导出",
          "content": "【🎮 告别繁琐，一键对齐像素序列帧】\n\n你还在手动在 Photoshop 里一张张对齐像素帧序列吗？\nPixelMotion 极速上线【序列帧打包导出】：\n- 一键拼接生成标准的 Sprite Sheet。\n- 直接拖入 Unity / Godot 引擎即可运动。\n\n把枯燥的重复对齐交给我，留着精力去做好玩的关卡设计吧！",
          "brandVoiceTag": "⚡ 效率利器",
          "visualHint": "📸 伴生视觉建议：10-12秒的功能高光点动态操作视频"
        },
        "cocreate": {
          "title": "被群友逼着做出来的功能，终于交房了！",
          "content": "【🏡 感谢十几位群友深度测试】\n\n"不做序列帧导出就给你寄刀片！"—— 收到各位做游戏老哥的"核能暗示"后，拼图算法连夜赶工完成了。特别感谢群里老哥帮我定位 WebGL 渲染边界。你们才是这个功能的真正产品经理。快去体验，有bug继续群里砸向我！",
          "brandVoiceTag": "💬 陪伴反馈",
          "visualHint": "📸 伴生视觉建议：用户在群里吐槽与功能上线的对比截图"
        }
      },
      "activePerspective": "authentic",
      "isPublished": true,
      "socialMetrics": {
        "likes": 512,
        "bookmarks": 194
      }
    },
    {
      "id": 3,
      "hash": "c7b521d",
      "branch": "hotfix/traffic",
      "dateLabel": "05.10",
      "timestamp": "2026-05-10T08:12:00Z",
      "commitTitle": "扩容应对破万流量",
      "commitMessage": "hotfix(server): scale Redis bandwidth and cold start runtimes under heavy traffic surge",
      "codeDiffSnippet": "+++ b/server/handler.js\n- const client = new Redis();\n+ const client = new Redis({ connectTimeout: 10000, maxRetriesPerRequest: 1 });",
      "perspectives": {
        "authentic": {
          "title": "今天，我的"草台班子"服务器被挤爆了 📈",
          "content": "【📅 独立开发者日记 - c7b521d】\n今天经历了一场惊心动魄的"甜蜜危机"。\n\n因为某个博主大大自发安利，服务器带宽瞬间被挤爆，后台疯狂红屏告警。我一边优化 lambda 启动、给 Redis 扩容，一边狂流冷汗。等我把服务器拉回来，看后台数据，注册已经悄悄破了 12,000 人。谢谢大家包容我这个"草台班子"服务器！有你们在，我底气真足。",
          "brandVoiceTag": "🌱 暴露脆弱",
          "visualHint": "📸 最佳配图：展示网页端拖拽卡片、外框按ID自动归类对齐的GIF动图"
        },
        "visual": {
          "title": "1.2w像素画手都在用的一键像素站，今天服务器被挤爆了",
          "content": "【📈 PixelMotion 注册用户突破 12,000 人】\n\n承蒙厚爱，上线不久付费转化率悄悄达到 5%。虽然服务器一度承受了不该有的压力，但目前已扩容完毕：\n- 网页渲染响应速度提升 300%。\n- 高峰期生成序列帧零排队。\n\n极简免安装，点击主页链接一键像素化！",
          "brandVoiceTag": "⚡ 数据佐证",
          "visualHint": "📸 伴生视觉建议：10-12秒的功能高光点动态操作视频"
        },
        "cocreate": {
          "title": "谢谢 1.2w 位陪我一起"热重启服务器"的朋友",
          "content": "【💬 独立开发者最自豪的时刻】\n\n今天服务器红屏报警的时候，群里不仅没有催促和责备，大家反而一直在帮我截图测试网络延迟，还开玩笑说要给我众筹租高级服务器。作为回报，底层的冷启动优化已经全部合入，请大家尽情折腾！",
          "brandVoiceTag": "💬 温暖互助",
          "visualHint": "📸 伴生视觉建议：用户在群里吐槽与功能上线的对比截图"
        }
      },
      "activePerspective": "authentic",
      "isPublished": true,
      "socialMetrics": {
        "likes": 982,
        "bookmarks": 421
      }
    },
    {
      "id": 4,
      "hash": "e93ab5c",
      "branch": "feat/showcase",
      "dateLabel": "05.23",
      "timestamp": "2026-05-23T23:11:00Z",
      "commitTitle": "资产角色橱窗上线",
      "commitMessage": "feat(ui): add showcase card component & align pixel frames into clean collection slots",
      "codeDiffSnippet": "+++ b/src/components/Showcase.jsx\n+ export const ShowcaseGrid = ({ items }) => {\n+   return <div className=\"grid grid-cols-4 gap-4 p-4\">...</div>\n+ }",
      "perspectives": {
        "authentic": {
          "title": "不能让你们的像素宝贝散养了 🏡",
          "content": "【📅 独立开发者日记 - e93ab5c】\n看着用户们在群里晒出的上千张精美像素小人，我突然觉得，不能再让他们"散养"在电脑里乱糟糟的文件夹里了。\n\n今天【角色橱柜】功能合入了 main 分支。我们给每一个小像素人设计了专属的展示单间，按 ID 自动分类归档。为了把卡片布局调得精致，在电脑前磨 UI 到凌晨两点。肩膀很酸，但强迫症表示极度舒适。去试试，好用求夸！",
          "brandVoiceTag": "🌱 浪漫本我",
          "visualHint": "📸 最佳配图：展示网页端拖拽卡片、外框按ID自动归类对齐的GIF动图"
        },
        "visual": {
          "title": "别让你的像素宝贝在硬盘里吃灰了！角色橱柜正式交房",
          "content": "【👾 PixelMotion 极速上线资产管理卡片】\n\n之前生成了一堆动作，找图时手忙脚乱？\n- 自动按角色 ID 提取序列帧并分类归档。\n- 精致而复古的卡片展示间，一目了然。\n- 支持一键快捷预览任意动作帧。\n\n极简高效，去给你的像素小人安个家吧！主页链接即达。",
          "brandVoiceTag": "⚡ 直击痛点",
          "visualHint": "📸 伴生视觉建议：10-12秒的功能高光点动态操作视频"
        },
        "cocreate": {
          "title": "你们要的"像素单间"，我连夜盖好了！",
          "content": "【🏡 听取群友吐槽，橱窗功能正式交房】\n\n经常有群友发大段录屏吐槽找图太费劲。今天，你们的"监工"成果上线了。不仅实现了分类归档，还做了卡片列队特效。大家快去玩，有不满意的地方评论区继续呼叫我，明天接着改！",
          "brandVoiceTag": "💬 极速迭代",
          "visualHint": "📸 伴生视觉建议：用户在群里吐槽与功能上线的对比截图"
        }
      },
      "activePerspective": "authentic",
      "isPublished": false,
      "socialMetrics": {
        "likes": 0,
        "bookmarks": 0
      }
    }
  ]
}
```

---

## Validation Checklist

Before writing `chronicle.json`, verify:

- [ ] **The entire file is valid JSON** — run `JSON.parse()` on the assembled string. If it fails, the output is broken. Common cause: bare ASCII `"` (U+0022) used inside string values for Chinese quotation. Fix: replace with `「」` or `""` (smart quotes).
- [ ] No bare ASCII `"` inside string values — search for the pattern `中文字符"中文字符` (Chinese char → ASCII quote → Chinese char) and replace with `「」`
- [ ] `schemaVersion` is `"1.0.0"`
- [ ] All top-level required fields are present
- [ ] `commits` array is ordered by `id` (ascending)
- [ ] Each commit has all three perspectives: `authentic`, `visual`, `cocreate`
- [ ] Each perspective has all four fields: `title`, `content`, `brandVoiceTag`, `visualHint`
- [ ] `dateLabel` follows `MM.DD` format
- [ ] `timestamp` is valid ISO 8601
- [ ] `hash` is 7 characters
- [ ] `codeDiffSnippet` is ≤1500 characters
- [ ] `activePerspective` is one of the three valid values
- [ ] `stats.totalCommits` matches the length of `commits` array
- [ ] If `narrative` is present, it has all required fields: `tagline`, `origin`, `chapters`, `current`, `tone`
- [ ] Each narrative chapter has `title`, `story`, and `commitIds` with at least one valid commit ID
- [ ] All `narrative.chapters[].commitIds` reference existing commit `id` values
- [ ] `narrative.tagline` is ≤30 Chinese characters
- [ ] `narrative.chapters[].title` is ≤20 Chinese characters
- [ ] If `projectIntelligence` is present, it has valid `trajectory.direction` (one of: deepening, broadening, drifting, stuck)
- [ ] No banned words appear in any content field (绝绝子, 震惊, 保姆级, 哭晕, 炸裂, 逆天, yyds)
- [ ] No commit hash prefixes in perspective `content` fields (e.g., `【📅 xxx - hash】` — the hash is metadata, not storytelling)
- [ ] Perspective diversity: in batches of 5+ commits, no more than 50% share the same `selectedPerspective`
- [ ] Every perspective's first sentence references a user outcome, user pain, or user transformation — not a build action
- [ ] `commitTitle` articulates a user outcome, not a feature description (e.g., "砍掉中间层，Agent 直接翻译代码" not "scaffold agent skill")
- [ ] No generic abstractions like "节省时间" or "更好用" without specific before→after evidence

---

## Execution Log Protocol

> A structured audit trail that records every decision the skill made during a run. Written to `output/chronicle.log.json` alongside `output/chronicle.json`. Read-only — never affects skill execution.

### Purpose

| Without log | With log |
|---|---|
| "这条视角为什么这么水？" → 猜 | 看 Value Chain 每步推理，定位从哪步开始歪 |
| "userInsight 为什么是 null？" → 猜 | 看 agent 跳过了哪一步 + 跳过原因 |
| "narrative 为什么这么分章？" → 猜 | 看分章逻辑 + commit 归组决策 |
| "identity 沉淀了什么？" → 看 config diff | 看提取过程 + 原始对话片段 |
| "JSON 为什么挂了？" → 看报错猜 | 看验证步骤 + 具体失败字段 |

### Log Schema

```json
{
  "schemaVersion": "1.0.0",
  "type": "chronicle-execution-log",
  "runAt": "ISO 8601 timestamp of this run",
  "repoName": "project directory basename",
  "triggerCommand": "the user message that triggered this run",

  "coverage": {
    "totalInRepo": 47,
    "previouslyCovered": 12,
    "newlyProcessed": 8,
    "skipped": 2,
    "skippedReasons": ["internal refactor", "config change"]
  },

  "curation": {
    "totalScanned": 8,
    "starred": 4,
    "grouped": 1,
    "skipped": 2,
    "groupingLogic": "commits 3+4 within 8min, both about marquee mode",
    "narrativeArcDesign": "hook with launch → build with capabilities → climax with design moment → close with positioning shift"
  },

  "commits": [
    {
      "hash": "74d60c9",
      "valueChain": {
        "step1_feature": "What the code did (factual)",
        "step2_userCanDo": "What the user can now do that they couldn't before",
        "step3_painRemoved": "What frustration/fear/risk was eliminated",
        "step4_userTransformation": "How the user's feelings or identity changed",
        "skipped": false,
        "skipReason": null
      },
      "perspectiveDecisions": {
        "notes": "Only record ANOMALIES here. Normal generation (straightforward angle, standard tag) needs no log entry. Record when: angle felt forced, brandVoiceTag was unusual, perspective was hard to generate, or generationNotes already covers it."
      },
      "userInsightSource": "which value chain step the userInsight came from (or null)",
      "valueStatementSource": "which value chain step(s) the valueStatement came from (or null)",
      "generationNotes": "any observations about this commit's generation — e.g. 'small change, light treatment would be better'"
    }
  ],

  "narrative": {
    "chapterGroupingLogic": "Why commits were grouped into these chapters",
    "existingChaptersModified": false,
    "newChaptersAdded": 2,
    "originRefreshed": false,
    "toneUpdated": false,
    "taglineUpdated": false,
    "currentRefreshed": true
  },

  "identity": {
    "signalsDetected": [
      {
        "raw": "verbatim user quote from conversation",
        "extracted": "what was learned about their voice",
        "field": "identity.languageDNA.bannedPhrases",
        "deposited": true
      }
    ],
    "configFieldsUpdated": ["identity.languageDNA.bannedPhrases"],
    "configFieldsUnchanged": ["identity.origin", "identity.values"]
  },

  "validation": {
    "jsonParseOk": true,
    "quoteCheckPassed": true,
    "schemaValid": true,
    "bannedWordsClean": true,
    "errors": []
  }
}
```

### Log Writing Rules

1. **Written after chronicle.json** — the log captures what actually happened, not what was planned.
2. **Every commit that was processed gets a log entry** — even skipped commits (set `valueChain.skipped: true` with `skipReason`).
3. **The `generationNotes` field is freeform** — use it to flag anything unusual: "small commit got full treatment", "perspective angle felt forced", "couldn't find strong user value".
4. **Do NOT include the full generated content** — the log records decisions and reasoning, not the output itself (that's in chronicle.json).
5. **Incremental behavior** — if `chronicle.log.json` already exists, **overwrite** it with the latest run's log. Unlike chronicle.json (which accumulates), the log represents the latest run only.
6. **Optional fields** — `identity` section can be omitted if no identity signals were detected. `narrative` section can be omitted if no narrative was generated. `commits[].generationNotes` can be null.
