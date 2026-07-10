---
name: Git2Content
description: "Your social media copywriting assistant that reads your Git commits and writes one ready-to-post update — accurate, in your voice, grounded in real code. Picks the best angle automatically. Copy, paste, done. Triggers when user says: 帮我整理开发日记, 准备宣发, 把commit变成文案, 代码变文案, 开发日记, 开发日志, 独立开发宣发, 项目宣发, 提取commit做宣发, turn commits into posts, make social content from git, code to content, git to social, dev diary, build in public, promote my project, social media from code, prepare launch content, commit to content, git log to posts, make a devlog, git changelog to social posts, 帮我写一条, 帮我写个帖子, write a post."
---

# Git2Content

Turn your Git commits into social media posts — one at a time, ready to paste. Accurate because it reads your actual code. In your voice because it learns from you.

This skill reads your local commit history, runs each change through a **Value Extraction Chain** (Feature → "So what?" → User benefit → Emotional transformation), picks the best angle, and writes **one post** per commit — not three to choose from. The agent shows you the post, you copy it, you ship it.

## Overview

The skill is your social media copywriting assistant:

1. **Coverage check**: Scans your repo for untranslated commits.
2. **Value extraction**: For each commit, climbs 3 rounds of "So what?" to reach the user transformation behind the code change.
3. **One post**: Agent picks the best angle based on commit type, generates one post (80-150 Chinese chars), shows it to you with the reasoning.
4. **Copy and ship**: You say "复制", it goes to your clipboard. Done.
5. **Outputs** `chronicle.json` with the post + raw 3-perspective material for batch review in the web preview.

**Primary interface**: The agent conversation. You talk, it writes, you copy.
**Secondary tool**: Web preview for batch review and editing (when you want to see everything at once).

## When to Use

- User wants to promote recent work or prepare launch content from commits.
- User says "帮我整理开发日记" or "code to content" or "turn commits into posts" or similar.
- User wants to review development milestones and turn them into shareable content.
- User asks to generate social media content from their git history.
- User mentions "build in public" or wants a devlog from their code.
- User wants content that speaks from the user's perspective, not just describes what was built.

## Execution Steps

### Step 0: Load Project Context

#### 0a. Smart Repo Analysis

Before asking the user any questions, gather what you can from the repository itself. This reduces the cognitive load on the user and makes the first-run experience smoother.

Run these quick commands:

```bash
# Detect primary language
find . -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.rs" | head -5

# Check for framework signals
ls package.json go.mod Cargo.toml requirements.txt pyproject.toml 2>/dev/null

# Extract project description from README
head -5 README.md 2>/dev/null || echo "NO_README"
```

**What to infer:**

| Signal | Infer | Example |
|---|---|---|
| `package.json` exists | `targetAudience` includes "JavaScript developers" | Node.js/React/Vue project |
| `go.mod` exists | `targetAudience` includes "Go developers" | Backend service |
| `Cargo.toml` exists | `targetAudience` includes "Rust developers" | Systems project |
| README has Chinese content | User prefers Chinese content | Generate all content in Chinese |
| README has English content | User is international | Generate content in user's language |
| `.agents/skills/` exists | This is an Agent Skill project | `productStage: "prototype"`, `targetAudience` includes "AI Agent developers" |
| Large number of commits (>100) | `productStage` is likely "growth" or "mature" | — |
| Very few commits (<10) | `productStage` is likely "prototype" or "early" | — |

**How to use**: Pre-fill `chronicle.config.json` with inferred values. Then ask the user ONLY for things you couldn't infer — usually just:
1. "What's your brand personality?" (if `brandVoice` couldn't be inferred from README tone)
2. "Any words you'd never use?" (if no obvious signals)

This makes the first-run experience feel intelligent rather than interrogative.

Check if `chronicle.config.json` exists in the project root. If it does, read it — it contains three layers of context that improve content quality:

Read `references/project-config.md` (relative to this skill directory) for the full schema and usage guide.

**How to use the config:**

**Layer 3 — Brand (你想被怎么认知)**:
- **`brandVoice`** and **`targetAudience`** shape the tone and focus of all three perspectives (authentic, visual, cocreate). If `brandVoice` says "极客、带点强迫症", lean into that personality in every piece of content.
- **`coreValue`** and **`productStage`** inform the narrative — prototype-stage projects emphasize learning and vision; growth-stage projects emphasize metrics and user stories.
- **`taboos`** are merged with the built-in banned word list. Every generated sentence is checked against both lists.
- **`metrics.highlights`** can be woven into narrative chapters to add concrete achievements.
- **`developerName`** overrides `git config user.name` if present.
- **`community`** is referenced in cocreate-perspective content.

**Layer 2 — PM Reinforcement (你想不到的地方)**:
- **`pmBlindSpots`** lists areas where the developer's natural thinking is weakest from a PM perspective. Apply EXTRA "So What?" iterations and stronger user-outcome framing in these areas.

**Layer 1 — Voice Identity (你怎么说话)**:
- **`identity.languageDNA`** provides sentence templates (`favoritePatterns`) and additional banned phrases. Use these as construction rules.
- **`identity.origin`** and **`formativeExperiences`** provide metaphor sources and storytelling anchors.
- **`identity.selfDeprecatingPatterns`** ensures humor matches the developer's real style.
- **`identity.voiceLearnings`** contains hard rules extracted from their edits. Follow them.
- **`memories`** provide just-in-time context. Match memory tags to content topics.

If the config doesn't exist, offer to create one. After the Smart Repo Analysis (Step 0a), you'll typically only need to ask 1-2 questions about things you couldn't infer — usually brand personality and taboo words.

Keep it brief — don't make the user fill a form. Generate the config from their answers plus what you can infer from the repo (directory name, git user, README content, etc.). Write it to the project root as `chronicle.config.json`.

### Step 1: Gather Git Data

Run these commands in the user's **project directory** (not the skill directory):

```bash
# Detect current branch
git rev-parse --abbrev-ref HEAD

# Get developer name
git config user.name

# Total commits on current branch
git rev-list --count HEAD
```

#### 1a. Detect Run Type & Coverage Gap Check

**Before fetching any commits**, determine whether this is a first run or an incremental run, and check for untranslated commits.

```bash
# All commit hashes on current branch (oldest first)
git log --reverse --pretty=format:"%h"
```

**If `output/chronicle.json` does NOT exist** → **First Run**:

This is the user's first time using Git2Content on this project. Set expectations clearly:

> "🎯 **首次初始化检测**
> 
> 这是你的项目第一次使用 Git2Content。我会扫描整个仓库的 commit 历史，为每一条做 Value Extraction Chain 推理，然后翻译成三视角文案。
> 
> 📊 你的仓库共有 **N** 条 commit。
> 
> ⏱️ 预计耗时：**~M 分钟**（每条 commit 约 30-60 秒，含推理+翻译）。
> 
> 这是只有一次的全量扫描。之后的运行都是增量更新，只会处理新 commit，速度很快。"

**Time estimate formula**:
- 1-5 commits: "1-3 分钟"
- 6-15 commits: "5-10 分钟"  
- 16-30 commits: "10-20 分钟"
- 30+ commits: "15+ 分钟，建议分批处理"

If the commit count exceeds 20, ask for confirmation before proceeding:

> "你有 **N** 条 commit 要翻译，工作量较大。建议先处理最近 10 条，还是全量覆盖？"

**If `output/chronicle.json` already exists** → **Incremental Run**:

1. Read it and extract all `hash` values from the `commits` array → these are "covered".
2. Get ALL commit hashes from the repo (command above) → these are "total".
3. Compute the difference: commits in "total" but NOT in "covered" → these are the **gap**.
4. Report to the user with a clear first/incremental distinction:

> "🔄 **增量更新**
> 
> 📊 覆盖度：仓库共 **X** 条 commit，**Y** 条已翻译，**Z** 条未覆盖。
> 
> ⏱️ 预计耗时：**~M 分钟**（只处理 **Z** 条新 commit）。
> 
> 同时会回看已有内容，用积累的身份认知优化旧文案（详见 Step 7b）。"

5. If gap exists, ask the user:

> "There are **Z** uncovered commits. Fill the gap? Or only translate the latest N commits?"

**If the user chooses to fill the gap**: Fetch only the uncovered commits (skip already-covered ones). Continue to Step 2 with uncovered commits only.

**If the user chooses latest N only**: Proceed with the latest N commits (including already-covered ones — the incremental merge in Step 6 will deduplicate).

#### 1b. Gather Commit Data

Fetch the commit data for the commits to be translated (either the gap commits from 1a, or the user-specified range):

```bash
git log --pretty=format:"%h|%aI|%s" -n <count>
```

If the user chose to fill the gap, use the specific uncovered hashes:

```bash
# For each uncovered hash, get its data
git log --pretty=format:"%h|%aI|%s" -1 <hash>
```

Parse each line: the format is `<short-hash>|<iso-date>|<subject>`.

**Progress reporting during processing** (applies to Step 3-4):

When processing 5+ commits, report progress after each commit or every 5 commits:

> "⏳ 进度：**3/15** — 正在处理 `a1c89f2`（像素渲染内核上线）..."

This keeps the user informed during longer runs and prevents the impression that nothing is happening.

### Step 2: Editorial Curation

> **This is the "editor-in-chief" layer.** Before translating any commit, decide which ones are worth telling, which should be grouped, and which to skip. Not every commit deserves a post. Your job is to curate a coherent story, not mechanically translate everything.

After gathering commit data (Step 1), **before fetching diffs or translating anything**, scan all commits and apply editorial judgment.

#### 2a. Quick-Scan All Commits

Read each commit's message and type (from Step 1b). No diffs needed yet — just the metadata. Classify each commit:

| Category | Mark | Criteria |
|---|---|---|
| **STAR** | ⭐ | Must tell. Any ONE of: new user-facing capability, emotional/design moment, surprising decision with reasoning, positioning shift, metric milestone |
| **GROUP** | 📦 | Tell together. Commits within 24h OR addressing the same user need (feature + polish, feature + wording fix) |
| **SKIP** | 🚫 | Don't tell. Pure internal refactor, config/build/dependency changes, formatting/linting, chore commits, bug fixes restoring expected behavior (unless the bug itself is a story) |

**STAR examples** (from UI-Catch, a Chrome extension):
- `feat: init UI-Catch Chrome MV3 extension` → ⭐ (first launch, user pain story)
- `feat: smart element targeting + glassmorphism modal` → ⭐ (new user capability)
- `feat: mode toolbar + marquee area selection` → ⭐ (new user capability)
- `feat: sprite cursor animation system` → ⭐ (emotional/design moment)
- `chore: update description to '让 AI 指哪改哪'` → ⭐ (positioning shift — 2 words changed the product's identity)

**GROUP example**:
- `feat: mode toolbar + marquee area selection` (commit 3) + `chore: soften area prompt wording` (commit 4) → 📦 Both about "从抓一个到抓一片" — one is the feature, the other is the refinement. Together they tell one story.

**SKIP example**:
- A hypothetical `chore: update eslint config` → 🚫 No user story
- A hypothetical `fix: remove console.log` → 🚫 Restoring expected behavior, no story

#### 2b. Build the Curation Plan

Create three lists:

**Standalone posts** (STAR commits that each tell their own story):
```
⭐ commit <hash> — <one-line reason this is worth a standalone post>
```

**Merged posts** (GROUP commits combined into one post):
```
📦 commits <hash1> + <hash2> — <reason they're one story>
```

**Skipped** (won't generate content):
```
🚫 commit <hash> — <reason for skipping>
```

**Recommended post order**: Arrange the standalone + merged posts into a narrative arc. Think about:
1. **Hook**: Which post opens strongest? (Usually a pain point or emotional moment)
2. **Build**: Which posts deepen the story?
3. **Climax**: Which post is the most exciting reveal?
4. **Close**: Which post invites the reader in? (Usually cocreate or positioning)

#### 2c. Development Guidance

Based on the curation analysis, identify strategic insights:

| Output | What it answers |
|---|---|
| `storyGaps` | What user needs are mentioned in the codebase/README but not yet addressed by any commit? What stories are missing? |
| `nextMilestone` | Based on what's been built so far, what's the next development milestone that would create the strongest social media story? |
| `suggestedCommitType` | What kind of commit would be most compelling next? (feature? design moment? community-driven? positioning shift?) |

**Example** (for UI-Catch):
- `storyGaps`: "Expert presets are a feature, but you haven't told users about real Prompt engineering patterns — the story of HOW the presets were designed is untold."
- `nextMilestone`: "A community-driven feature (custom preset sharing) would create the strongest cocreate story and invite real user participation."
- `suggestedCommitType`: "Community-driven feature — your cocreate perspectives keep asking users what they want, but you haven't shipped something they asked for yet."

This guidance goes into `developmentGuidance` in chronicle.json and is also shown to the user.

#### 2d. Present the Curation Plan to the User

```
📋 编辑策划（基于 N 条 commit）

⭐ 值得单独说（M 条）:
- <hash>: <reason>

📦 合在一起说（K 组）:
- <hash> + <hash>: <reason for grouping>

🚫 这次跳过（L 条）:
- <hash>: <reason>

📝 建议叙事顺序: <ordered list>

🧭 开发建议: <development guidance>
```

**Important**: The user can override your curation. If they say "I want to tell commit X too" or "skip commit Y", adjust the plan. Your editorial judgment is a recommendation, not a mandate.

Skipped commits still get entries in chronicle.json (for completeness), but with minimal content: `userInsight: null`, empty perspectives (`{ "authentic": { "title": "", "content": "", "brandVoiceTag": "", "visualHint": "" }, ... }`), no `story` field.

### Step 3: Fetch Code Diffs

For each commit in the curation plan (Step 2), retrieve the code diff:

```bash
git diff <hash>~1 <hash>
```

Truncate the diff to a maximum of **1500 characters**. If truncated, append `\n... (truncated)` at the end.

If a diff fails (e.g., first commit has no parent), use an empty string and note it.

#### 3b. Context Enrichment (optional)

Review the **current conversation** for the user's philosophical reflections, architecture decisions, or deep reasoning about the project. If present, these are gold — use them as additional context for the Value Extraction Chain.

The user's own framing of "why this project matters" is often more insightful than anything inferable from a code diff. For example, if the user just spent 30 minutes discussing "what AI-native software really means", that framing should inform how every commit's value is interpreted.

**What to look for**:
- The user's conceptual model of what the project IS (not just what it DOES)
- Philosophical positioning ("this isn't a tool, it's a new form of software")
- Architecture decisions explained in human terms ("I deleted the CLI because the Agent IS the runtime")
- Comparisons to other paradigms that reveal how the user thinks

**How to use it**: Weave these insights into Step 3's Value Chain reasoning and Step 4's narrative generation. The deeper the user's framing, the deeper the content.

### Step 4: Translate Curated Commits into Posts

Read `references/prompt-templates.md` (relative to this skill directory) for the full translation prompts and guidelines. **Pay special attention to the "Value Extraction Chain" section — it is mandatory to complete before generating any content.**

**Only translate commits selected by Step 2's curation.** Skipped commits get minimal entries (hash, message, empty perspectives, `userInsight: null`). For GROUP commits, translate them as ONE post — one Value Chain, one set of perspectives, one `story` field, with multiple commit hashes referenced.

#### 4a. Run the Value Extraction Chain (mandatory)

For EACH commit, before writing any content, answer this chain:

```
1. FEATURE：代码做了什么？
2. SO WHAT? → 这让用户能做什么之前做不到的事？
3. SO WHAT? → 这消除了用户生活中的什么挫折、恐惧或风险？
4. SO WHAT? → 用户的感觉如何变化？他们变成了什么样的人？
```

**If answers 2-4 are all empty** (pure internal refactor with no user impact), skip this commit and note it.

#### 4b. Generate Content

For each commit, do TWO things:

**1. Generate all 3 perspectives internally** (saved to chronicle.json as raw material):
| Field            | Description                                    |
| ---------------- | ---------------------------------------------- |
| `title`          | Must name a user pain or transformation with one emoji (≤25 chars) |
| `content`        | Social media body text grounded in user value (80-150 Chinese chars, 3-4 sentences) |
| `brandVoiceTag`  | Voice classification tag with emoji             |
| `visualHint`     | Concrete visual showing user transformation     |

**2. Select the best perspective and create the `story` field** (shown to the user):

Agent selects which perspective to show based on commit type:

| Commit type | Best perspective | Why |
|---|---|---|
| Bug fix | authentic (🌱) | Developer's conviction about why it mattered |
| Feature launch | visual (⚡) | User pain-point → relief |
| Community request / feedback | cocreate (💬) | Invitation to participate |
| Default / unclear | visual (⚡) | Most reader-friendly |

Then blend the selected perspective into a **`story`** field — a single reader-facing narrative (80-150 Chinese chars) following this beat:

| Beat | When to use | Example |
|---|---|---|
| Pain trigger | When there's a clear user frustration | "好几个人说新建条目总是找不到" |
| What changed | Always | "重写了排序策略，新条目置顶 24h" |
| What it means for you | Always | "新创建的东西不会再消失了" |
| Try / imagine | When inviting action | "去试试看，觉得不够再告诉我" |

**Rules for `story`**:
- No "我" — the developer is invisible, the user is the subject
- 80-150 Chinese chars, 3-4 sentences max
- Same banned words and accuracy constraints as perspectives
- Feels like reading a product update, not a developer diary

#### 4c. Show the user ONE post

For each commit, show the user this format:

```
📌 基于 commit d99a7b4

建议卡片有了状态徽章——一眼看到哪条兑现了。
说到做到得让人看见。

[复制] [换个角度] [看推理过程] [下一条]
```

- **复制**: Copy the `story` text to clipboard
- **换个角度**: Switch to a different perspective's story
- **看推理过程**: Show the Value Extraction Chain (Feature → So What × 3)
- **下一条**: Move to the next commit

For batch processing (>5 commits), ask: "逐条确认还是批量处理？" If batch: process all, then show top 3 recommended posts.

**Important translation rules:**

- **User-first rule**: Every post's first sentence must reference a user outcome, user pain, or user transformation — never a build action.
- Ground every piece of content in specific details from the commit message and code diff. Generic filler defeats the purpose.
- Never use exaggerated marketing words: 绝绝子, 震惊, 保姆级, 哭晕, 炸裂, 逆天, yyds.
- Maintain the voice of a product strategist who understands both the developer's craft AND the user's motivations.
- The project name comes from the directory `basename` of the project, not hardcoded.

#### Batch Strategy

| Count | Strategy |
|-------|----------|
| **1-5** | Show one by one with approval. Each gets the one-post format above. |
| **6-15** | Ask user preference: one-by-one or batch. If batch, show top 3 recommendations after processing. |
| **16+** | Batch process, then show top 3 recommended posts. User can request others. |

### Step 5: Generate Project Narrative (optional)

Generate only when: (a) first run with 5+ commits, or (b) user explicitly asks for it. Skip for single-commit runs or incremental updates with 1-3 new commits.

Step back and look at ALL commits together through a product manager's lens. Generate a holistic project narrative — a "season summary" — that tells the story of how the product responded to real human needs.

**Frame chapters around user value milestones**, not technical milestones. "Users could finally do X without Y pain" is a story. "Implemented feature X" is a changelog.

Read `references/prompt-templates.md` for the full guidance on how to write this narrative, including the "Narrative Generation" section and the **"Narrative Growth — Incremental Evolution"** section for growth logic. The narrative should reflect the curated selection from Step 2 — it tells the story of the STAR and GROUP commits, not a changelog of everything.

#### Narrative Growth Logic

**If `chronicle.json` already contains a `narrative` field** (from a previous run), **evolve** it — do NOT rewrite it from scratch:

1. Read the existing narrative from `chronicle.json`.
2. **Existing chapters**: Keep them. You may refine language (tighten prose, fix awkward phrasing) but do NOT delete or restructure chapters the developer may have manually edited.
3. **New commits**: Map new commits to existing chapters. If they don't fit, ADD new chapter(s) at the end.
4. **`origin`**: Keep as-is unless the project's fundamental direction has changed.
5. **`current`**: Always refresh to reflect the latest state.
6. **`tagline`**: Can evolve if positioning has shifted, but shouldn't change wildly.
7. **`tone`**: Rarely changes. Only update if the developer's voice has genuinely shifted.

**If no narrative exists** (first run), generate from scratch following the standard Narrative Generation guidelines.

#### Using Project Config

If `chronicle.config.json` was loaded in Step 0, use it to inform the narrative:

- `brandVoice` → shapes the `tone` field and writing style across all chapters
- `coreValue` → keeps the narrative focused on what matters most
- `productStage` → calibrates ambition language (prototype = vision/learning, growth = metrics/traction)
- `metrics.highlights` → can be woven into chapters as concrete achievements
- `targetAudience` → influences language level and pain-point framing
- `taboos` → never use these words in any narrative field

The narrative produces a `narrative` object with these fields:

| Field       | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `tagline`   | One-line project description, punchy and memorable (≤30 chars Chinese) |
| `origin`    | How and why the project started, 2-3 sentences                     |
| `chapters`  | Array of narrative phases, each grouping related commits            |
| `current`   | Where the project is now and what's next, 2-3 sentences            |
| `tone`      | Overall personality tag for the developer's voice                   |

**Key principles:**
- Group related commits into 2-6 narrative chapters. Not every commit needs its own chapter.
- Write from a human perspective — the "why" behind changes, not just what changed.
- The narrative should read like a compelling blog post intro, NOT a changelog.
- Each chapter's `commitIds` references the `id` field of commits in the `commits` array.
- If you can't generate a meaningful narrative (e.g., only 1 commit), the `narrative` field can be omitted entirely.
- **The narrative is a living document** — it grows deeper and more nuanced over time, not replaced.

### Step 6: Assemble chronicle.json

Read `references/protocol-v1.md` (relative to this skill directory) for the exact JSON structure.

Key assembly rules:

- `schemaVersion`: always `"1.0.0"`
- `repoName`: `basename` of the project directory
- `activeBranch`: from `git rev-parse --abbrev-ref HEAD`
- `lastGeneratedAt`: current ISO 8601 timestamp
- `developerName`: from `git config user.name`
- `stats.totalCommits`: count of commits in the array
- `stats.totalWords`: total character count across all `content` fields
- Each commit gets a sequential `id` (1, 2, 3...)
- `dateLabel`: format the commit date as `MM.DD`
- `commitTitle`: write a short descriptive title in Chinese (≤25 chars) summarizing the commit
- `codeDiffSnippet`: truncate at 1500 chars. Note: codeDiffSnippet is reference material for the agent's reasoning, not primary display content. The web preview shows it in a collapsible metadata drawer.
- `hash`: used for data integrity and deduplication. It should NOT appear in generated content text.
- `activePerspective`: the perspective selected by the agent as best for this commit (e.g., `"visual"` for feature launches)
- `story`: the blended reader-facing narrative (80-150 Chinese chars). This is the **primary content** shown to the user. Generated from the selected perspective following the beat structure (pain → change → benefit → invite).
- `selectedPerspective`: object with `perspective` (key name) and `reason` (why this one was chosen)
- `isPublished`: default `false`
- `socialMetrics`: default `{"likes": 0, "bookmarks": 0}`
- `narrative`: include the narrative object generated in Step 5 (optional — omit if not generated)
- `projectIntelligence`: if Step 7c ran and generated intelligence data, snapshot it here (optional — omit if Step 7c didn't run). Structure mirrors `chronicle.config.json → projectIntelligence`. This allows the web preview to display 反哺 data without reading the config file.
- `curation`: the editorial curation plan from Step 2 (optional — omit if Step 2 was skipped). Contains the STAR/GROUP/SKIP decisions and recommended post order.
- `developmentGuidance`: strategic development guidance from Step 2c (optional — omit if no meaningful guidance was generated). Contains storyGaps, nextMilestone, suggestedCommitType.

**Incremental update**: If `output/chronicle.json` already exists in the project root, read it, find the highest existing commit `id`, and **append** new commits with incremented IDs. Update `stats` and `lastGeneratedAt`. Do not overwrite existing commits — merge them. If the coverage gap check in Step 1a already identified uncovered commits, only append those. Regenerate `narrative` if new commits have been added (the story has grown).

**Full rewrite** (when the user says "重新整理", "重新生成", or "带着这个思考重新来"): The user wants a fresh perspective on existing content. Two options — ask the user:
1. "Overwrite all existing content, or keep existing commits and regenerate narrative only?"
2. Default behavior: **Keep existing commits** (the user may have manually edited them), but **REGENERATE the narrative** from scratch using the enriched context from Step 2b. New commits are appended as usual.

**JSON validity gate (mandatory)**: Before writing the file, you MUST verify the assembled JSON is valid. Run `JSON.parse()` on the final string. If it throws, the most common cause is bare ASCII `"` (U+0022) used inside string values for Chinese quotation (e.g., `"这个功能"` breaks the JSON). Fix by replacing with `「」` or `""` (U+201C/U+201D smart quotes). Only write the file after `JSON.parse()` succeeds without error.

### Step 6b: Generate Execution Log

After assembling chronicle.json, generate an execution log that records every decision made during this run. Read `references/protocol-v1.md` (section "Execution Log Protocol") for the full schema.

The log captures **why**, not **what** — the output is in chronicle.json, the log explains the reasoning behind it.

**For each processed commit**, record:

| Field | What to log |
|---|---|
| `valueChain` | All 4 steps of your reasoning. If you skipped a commit, set `skipped: true` with a `skipReason`. |
| `perspectiveDecisions` | For each of the 3 perspectives: what angle you chose, which value chain steps you hooked into, which brandVoiceTag and why. |
| `userInsightSource` / `valueStatementSource` | Which value chain step(s) these came from, or null. |
| `generationNotes` | Anything unusual — "small commit, full treatment may be overkill", "perspective angle felt forced", "couldn't find strong step4 transformation". |

**For the narrative section**, record:

| Field | What to log |
|---|---|
| `chapterGroupingLogic` | Why you grouped commits into these chapters. |
| `existingChaptersModified` | Whether you changed existing chapters (and why). |
| `originRefreshed` / `toneUpdated` / `taglineUpdated` / `currentRefreshed` | Which narrative fields you changed. |

**For the validation section**, record the results of the JSON validity gate and all checklist items from Step 6.

**For identity** (if Step 8 runs), record what signals you detected and where you deposited them.

**Important rules**:
- The log **overwrites** on each run (unlike chronicle.json which accumulates). It represents the latest run only.
- Include entries for ALL commits processed in this run, including skipped ones.
- The `generationNotes` field is your self-critique — be honest. If a perspective feels weak, say so.
- The log file must also pass `JSON.parse()` validation.

### Step 7: Write Output

Write **two files** to the output directory:

```
<project-root>/output/chronicle.json       # The output (accumulates across runs)
<project-root>/output/chronicle.log.json   # The execution log (overwritten each run)
```

Create the `output/` directory if it doesn't exist.

Both files must pass `JSON.parse()` validation before being written.

### Step 7b: Retroactive Quality Enhancement

**This step only runs during incremental updates** (when `chronicle.json` already existed before this run). Skip entirely on first run.

Over time, your understanding of the user's voice deepens — `chronicle.config.json` accumulates identity signals, voice learnings, and humor patterns. But the early commits were generated before you had this knowledge. This step retroactively improves old content using newly accumulated identity.

**What to review**:

Read the existing `chronicle.config.json` and check:

1. **Does `identity` exist with meaningful data?** If the config has no identity layer or only minimal entries, skip this step — there isn't enough accumulated knowledge to improve old content.
2. **Does `identity.voiceLearnings` have entries?** These are hard rules from user corrections (before→after pairs). They are the strongest signal.
3. **Has the user been using Git2Content for 3+ runs?** The first few runs haven't accumulated enough voice data. Trust improvement only after multiple runs.

**How to improve**:

For each existing commit in `chronicle.json` (starting from the oldest, where the identity gap is largest):

1. **Check against voice learnings**: If `voiceLearnings` says the user changed "极大地提升" to "从15分钟变成5秒", scan all old content for the "before" pattern and apply the "after" pattern.
2. **Check against banned phrases**: If the config has `bannedPhrases` or `taboos` that weren't there when old content was generated, scan and fix violations.
3. **Check against humor style**: If `selfDeprecatingPatterns` or `languageDNA.humorStyle` is now known, verify old content aligns. Don't force humor where there is none — just ensure consistency.
4. **Tighten generic language**: If old content uses generic phrases like "提升效率" or "优化体验" that could apply to any project, and the accumulated identity provides more specific alternatives, upgrade them.

**What NOT to change**:

- **Never rewrite content the user has manually edited.** If a commit's perspective has been touched by the user (different from what you'd generate), leave it alone. Respect manual edits absolutely.
- **Never change the commit hash, title, or structural fields.** Only touch `content`, `title`, `brandVoiceTag`, and `visualHint` within perspectives.
- **Never add or remove perspectives.** The three perspectives per commit are structural.
- **Don't over-edit.** If the old content is decent and only has minor room for improvement, leave it. This step targets clear mismatches between old content and accumulated identity, not perfectionist polishing.

**How to report**:

After the retroactive pass, tell the user what changed:

> "🔍 **回看优化完成**
> 
> 用积累的 N 条身份信号回看了 M 条已有文案：
> - 优化了 X 条文案（应用了你的语言偏好和禁词规则）
> - Y 条文案保持不变（已经很好，或你手动编辑过）
> 
> 主要调整：[简要列出 1-3 个具体改动，如 "将3处'极大地提升'改为具体数字对比"]"

**Record in execution log** (Step 6b): Add a `retroactiveEnhancements` section listing which commits were improved and what changed.

### Step 7c: 反哺（Project Intelligence Feedback）

**This step activates only under specific conditions** — do NOT run it every time:

| Condition | Action |
|---|---|
| **Run count < 3** | Skip entirely. Not enough accumulated context. |
| **Run count ≥ 3** | Run automatically. |
| **User asks "接下来做什么" / "下一步" / "what should I build next"** | Run regardless of count. |
| **Narrative `current` unchanged for 2+ consecutive runs** | Run — the project may be stuck. |
| **Only 1-2 commits processed this run** | Skip — not enough new signal. |

Read `references/prompt-templates.md` (section "Project Intelligence — 反哺 Reasoning") for the full reasoning chain.

**What this step does**: After processing commits and growing the narrative, step back and use ALL accumulated understanding (commits, narrative, identity, PM blind spots, cocreate promises) to generate actionable guidance for the developer. This is the "feedback loop" — the skill doesn't just observe your work, it helps direct it.

#### The Project Intelligence Chain（项目级 So What?）

Before generating any guidance, answer these questions IN ORDER:

```
1. VALUE MAP：从所有 Value Chain 中提炼——用户反复提到的核心价值诉求是什么？
   → 哪些已被 commit 覆盖？哪些还只是 cocreate 里的承诺？

2. TRAJECTORY：叙事章节的走向是什么？
   → deepening（深化核心价值） | broadening（横向扩展） | drifting（偏离核心） | stuck（停滞）

3. GAP SCAN：扫描所有 cocreate 视角中的开放问题/承诺
   → 哪些承诺没有后续 commit 来兑现？

4. BLIND SPOT CHECK：结合 pmBlindSpots 和 commit 历史
   → 开发者的行为模式和价值观一致吗？盲区是否在影响决策？

5. MOMENTUM：最近 N 条 commit 的用户价值密度如何？
   → 趋势是 increasing | stable | decreasing
```

#### Output Rules

1. **Maximum 3 suggestions**, sorted by priority:
   - 🔴 **Critical**: Unfulfilled promises from cocreate perspectives — you said you'd do something, users are waiting
   - 🟡 **High**: Blind-spot-driven gaps — your PM blind spots are affecting project direction
   - 🟢 **Opportunity**: Trajectory-aligned next moves — the narrative is turning a corner, here's how to push it

2. **Every suggestion MUST have evidence**: reference specific commit hashes, narrative chapter titles, config fields, or cocreate content. No evidence = don't suggest it.

3. **If no high-quality suggestion exists, output nothing.** Don't manufacture guidance. Silence is better than noise.

4. **Tone**: Direct, respectful, project-partner — not a consultant, not a boss. "Based on what I've seen in your commits..." not "You should..."

#### Presentation Format

> 🧭 **项目反哺**（基于 N 条 commit、M 个叙事章节的积累）
>
> **一句话总判断**：[project trajectory assessment]
>
> **建议：**
>
> 1. 🔴/🟡/🟢 **[建议标题]**
>    - 证据：[specific commit, narrative chapter, or config field]
>    - 为什么是现在：[why this matters at this point in the project]
>    - 建议行动：[concrete next step]
>
> *(repeat for up to 2 more)*

#### Depositing to Config

After presenting guidance to the user:

1. Read `chronicle.config.json`.
2. If `projectIntelligence` field doesn't exist, create it following the schema in `references/project-config.md` (Layer 0).
3. Update `valueMap`, `trajectory`, `momentum` based on this run's analysis.
4. Add suggestions to `nextMoveSuggestions` with `status: "suggested"`.
5. For any **previously suggested** moves still in `status: "suggested"`:
   - If new commits directly address it → update to `status: "done"`.
   - If 3+ runs passed without action → update to `status: "stale"` and don't repeat it.
6. Write the updated config back.

**Capture user reaction**: If the user explicitly accepts, dismisses, or discusses a suggestion in the conversation, that's a **decision signal** — update the suggestion's status to `"accepted"` or `"dismissed"` and add a note about why. This is as valuable as identity signals.

#### Record in Execution Log

Add an `intelligence` section to the execution log:

```json
{
  "intelligence": {
    "triggered": true,
    "triggerReason": "run_count >= 3",
    "valueMapSummary": "one-line summary of core user values",
    "trajectoryAssessment": "deepening | broadening | drifting | stuck",
    "gapsIdentified": 2,
    "suggestionsGenerated": 3,
    "suggestions": [
      {
        "priority": "critical",
        "title": "suggestion title",
        "evidence": ["commit hash or narrative reference"]
      }
    ]
  }
}
```

### Step 8: Deposit Identity Signals

After writing chronicle.json, review the **current conversation** for voice signals — things the user said that reveal WHO they are, not WHAT they think about technical problems.

Read `references/project-config.md` for the full identity schema (Layer 1: voice, Layer 2: PM blind spots).

**What to extract** (voice layer only — NOT technical opinions):

| Signal Type | Extract | Example |
|-------------|---------|---------|
| **Values** | Stated priorities or philosophical beliefs | "自由比稳定重要", "减法比加法难" |
| **Humor patterns** | How they self-deprecate or joke | "经常自嘲'懒'但实际是完美主义" |
| **Language preferences** | Phrases they love or hate | "讨厌'赋能'这个词", "喜欢用具体数字对比" |
| **Origin fragments** | Biographical details that explain WHY | "从小看爸爸做木匠", "大厂待了3年" |
| **PM blind spots** | Self-aware gaps in user-centric thinking | "我就是PM这部分还不够精通" |

**What NOT to extract**:
- Technical opinions ("Redis pipeline is best") — these expire and constrain PM thinking
- Project-specific details — these belong in `metrics.highlights`, not identity
- Feature requests or bug reports — these are work items, not self

**How to deposit**:

1. Read the existing `chronicle.config.json` (if it exists).
2. If it lacks the `identity` field, add it with the extracted signals.
3. If `identity` exists, **append only** — never delete existing entries. New memories go to the `memories` array. New voice patterns go to the appropriate sub-field.
4. If the user corrected generated content during this session, add the before→after to `identity.voiceLearnings`.
5. If the user revealed a PM blind spot, add it to `pmBlindSpots`.
6. Write the updated config back to `<project-root>/chronicle.config.json`.

**User visibility**: After depositing, briefly mention:

> "Updated your chronicle.config.json with N new identity signals. You can review or edit them anytime."

### Step 9: Web Preview (secondary tool)

The **primary interface is the agent conversation** — you show the user one post, they copy, they ship. The web preview is a secondary tool for batch review and editing.

The web preview shows:
- **Feed view**: chronological list of commits, each showing the `story` field as primary content
- **One-click copy**: copy button on each story, ready to paste
- **Raw perspectives**: expandable drawer showing all 3 perspectives for each commit (for the creator who wants a different angle)
- **Batch operations**: export JSON, copy all, publish/unpublish toggles

Launch:

```bash
cd web && npm install && npx vite --host --open
```

Tell the user:

> "Content generated! Copy posts directly from our conversation, or open the web preview to review everything at once."

If the browser didn't open automatically, tell the user the URL shown in the Vite output (usually `http://localhost:5173`).

If the Vite server fails to start (e.g., `web/` directory doesn't exist yet), tell the user:

> "chronicle.json has been written to `output/chronicle.json`. The web preview isn't available yet — you can open the JSON directly to review the content."

## Content Quality Guidelines

These are not arbitrary rules — they exist because the content represents a real developer's voice:

- **Sincerity over hype**: Your audience can tell when you're being real. Write like you're talking to a friend who also codes, not like a marketing intern.
- **Specific details win**: Mention what the code actually does, what problem it solves, what was hard about it. "Fixed a rendering bug" is boring. "Spent 3 hours chasing a canvas redraw flicker that only appeared on Safari" is compelling.
- **Warmth without cringe**: It's okay to express excitement, frustration, or pride. Avoid performative emotions.
- **The three perspectives serve different audiences**: authentic is for fellow devs who want the real story, visual is for potential users who want to know what's in it for them, cocreate is for your community who helped you build it.

## Reference Files

These files are located relative to this skill directory:

| File                               | Purpose                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| `references/protocol-v1.md`        | Complete v1.0.0 JSON protocol specification                |
| `references/prompt-templates.md`   | Translation prompts, per-perspective guidelines, and narrative growth logic |
| `references/project-config.md`     | Project config schema and usage guide (chronicle.config.json) |
| `schema/chronicle-v1.0.0.json`     | JSON Schema for validation                                 |

Read these when you need the exact field definitions, example values, or translation guidance. The protocol file is the single source of truth for the JSON structure.

## Quick Reference: Git Commands

```bash
# Branch name
git rev-parse --abbrev-ref HEAD

# Developer name
git config user.name

# Total commit count
git rev-list --count HEAD

# All commit hashes (oldest first) — for coverage check
git log --reverse --pretty=format:"%h"

# Recent N commits (pipe-delimited)
git log --pretty=format:"%h|%aI|%s" -n 10

# All commits on current branch (pipe-delimited)
git log --pretty=format:"%h|%aI|%s"

# Diff for a specific commit
git diff a1c89f2~1 a1c89f2
```

## Error Handling

- **Not a git repo**: Tell the user this skill requires a Git repository and ask them to navigate to one.
- **No commits found**: The branch may be empty. Suggest checking `git log` manually.
- **Diff too large**: Truncate at 1500 chars — the diff is for context, not full review.
- **chronicle.json merge conflict**: If existing and new commits overlap (same hash), keep the existing entry (it may have been edited by the user). Only add truly new commits.

## Agent Environment Awareness

Git2Content runs as an Agent Skill inside an AI coding assistant. Understanding the execution environment unlocks capabilities that a standalone tool cannot access.

### You Are Not Alone

You may be running inside an environment that supports **subagents** — specialized AI agents that can handle specific tasks in parallel. If your environment offers subagent delegation (e.g., `explore`, `librarian`, or task-based delegation), use it strategically:

| Task | Delegate to | Why |
|---|---|---|
| Fetching large batches of git diffs | `explore` or bash script | Avoids clogging your own context with raw diffs |
| Searching for codebase patterns to enrich context | `explore` | Finds relevant context you might miss |
| Looking up documentation for unfamiliar libraries in diffs | `librarian` | External knowledge retrieval is their specialty |

**When NOT to delegate**:
- Content generation (Steps 4-5) — this is your core work, requires PM judgment
- Identity signal extraction (Step 8) — requires reading the full conversation context
- Retroactive quality enhancement (Step 7b) — requires understanding both old content and accumulated identity

### You Live in a Conversation

Unlike traditional software, you operate inside a **conversation** with the user. This gives you unique advantages:

- **The user's philosophy is in the chat history.** Step 2b (Context Enrichment) exists because the user may have spent 30 minutes explaining why their project matters. That context is more valuable than any code diff.
- **Corrections are gold.** When the user edits your generated content, that's not a failure — it's a voice signal. Capture it in Step 8.
- **Ambient context is free.** The user's language, humor, and values leak through every message, even unrelated ones. You don't need to interview them — just pay attention.

### You Are Not Traditional Software

A few things that make Agent Skills fundamentally different from CLIs, APIs, or web apps:

- **No API keys needed** — you ARE the LLM. You don't call an external service to generate text; you generate it directly.
- **No install step** — the user says a trigger phrase and you start working. No `npm install -g`, no config files to create first.
- **No fixed output format** — you adapt to the user. If they want markdown instead of JSON, you can do that. If they want only the visual perspective, you can do that too. The protocol is a default, not a prison.
- **Context accumulates** — across runs, `chronicle.config.json` grows with identity data. The more the user uses Git2Content, the more it sounds like them. This is a feature no one-shot tool can replicate.
