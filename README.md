# grove-better-skills

这是一个面向 Codex / Cloud / Agent 工作流的 Skills 仓库，主要有两个用途：

1. **维护我自己开发的 Skills**：放在 [`skills/`](skills)，可通过 `npx skills@latest add` 或 [`install.sh`](install.sh) 安装。
2. **记录好用的第三方 Skills**：放在 [`third-party-skills/`](third-party-skills)，并通过 [`third-party-skills.json`](third-party-skills.json) 建立机器可读索引，方便后续比较、推荐和安装。

除此之外，仓库还提供一个推荐型 Skill：[`skill-recommender`](skills/skill-recommender)。当你犹豫该选哪个 Skill 时，可以用 `/recommend` 描述当前场景，它会从自研 Skills 和记录的第三方 Skills 中推荐最适合的 3 个，并按“Skill 名称 / 具体作用 / 推荐理由”输出。

## 目录结构

```text
.
├── skills/                         # 自研、可安装的 Skills
│   ├── clone-website/
│   ├── debugging-webpage-anomalies/
│   ├── risk-oriented-code-review/
│   └── skill-recommender/
├── third-party-skills/              # 第三方 Skills 的记录、评测和安装说明
├── skills.json                      # 自研 Skills 的机器可读索引
├── third-party-skills.json          # 第三方 Skills 的机器可读索引
├── .codex/commands/recommend.md     # /recommend slash command
├── install.sh                       # 本地安装脚本
└── bin/skills.js                    # npx 安装入口
```

## 快速使用 `/recommend`

如果你的环境支持仓库内 slash commands，可以直接输入：

```text
/recommend 我想 review 当前 diff，功能已经跑通，但担心以后有隐藏风险
```

它会使用 `skill-recommender`，结合当前场景从以下候选中推荐：

- [`skills.json`](skills.json) 中记录的自研 Skills
- [`third-party-skills.json`](third-party-skills.json) 和 [`third-party-skills/`](third-party-skills) 中记录的第三方 Skills

如果环境没有自动加载 `.codex/commands/recommend.md`，也可以直接这样问：

```text
请使用 skill-recommender，帮我判断这个场景该用哪个 Skill：<描述你的任务、材料、约束和期望输出>
```

## 一键安装自研 Skills

这个仓库提供两种安装方式。

### 使用 npx 从 GitHub 安装

安装当前仓库里的所有可安装自研 Skills：

```bash
npx skills@latest add grove94/grove-better-skills
```

只安装某一个 Skill：

```bash
npx skills@latest add grove94/grove-better-skills clone-website
npx skills@latest add grove94/grove-better-skills risk-oriented-code-review
npx skills@latest add grove94/grove-better-skills debugging-webpage-anomalies
npx skills@latest add grove94/grove-better-skills skill-recommender
```

覆盖已安装版本：

```bash
npx skills@latest add grove94/grove-better-skills --force
```

安装到自定义目录：

```bash
npx skills@latest add grove94/grove-better-skills --dir /path/to/skills
```

`skills add` 会把 `owner/repo` 形式的参数解析为 GitHub 仓库，克隆后优先读取仓库根目录的 `skills.json`；如果没有该文件，则扫描 `skills/*/SKILL.md`。默认安装位置优先级：

1. `--dir <skills-dir>`
2. `SKILLS_DIR`
3. `CODEX_HOME/skills`
4. `~/.codex/skills`

### 使用 install.sh 从本地仓库安装

```bash
./install.sh clone-website
./install.sh risk-oriented-code-review
./install.sh debugging-webpage-anomalies
./install.sh skill-recommender
```

安装到自定义目录：

```bash
SKILLS_DIR=/path/to/skills ./install.sh skill-recommender
```

覆盖已安装版本：

```bash
./install.sh skill-recommender --force
```

在 Cloud 或其他临时环境中，可以直接下载并执行安装脚本。把 `<raw-install-url>` 替换成当前仓库 `install.sh` 的 Raw URL：

```bash
curl -fsSL <raw-install-url> | SKILLS_REPO_URL=<git-repo-url> bash -s -- skill-recommender
```

## 自研 Skills

### 1. Clone Website

路径：[`skills/clone-website`](skills/clone-website)

用途：反向分析一个或多个目标网站，抽取截图、真实资源、computed CSS、内容、交互行为和响应式规则，然后按组件规格重建成 Next.js / App Router 页面。

适合场景：

- 想把某个网页复刻成 pixel-perfect 版本
- 需要先做可审计的网站研究材料，再实现页面
- 需要下载真实图片、视频、SVG、favicon 和文案
- 需要检查 scroll / click / hover / responsive 等交互行为

推荐输入：

```text
Use $clone-website to rebuild https://example.com as a pixel-perfect Next.js clone.
```

### 2. Risk-Oriented Code Review

路径：[`skills/risk-oriented-code-review`](skills/risk-oriented-code-review)

用途：专门做“现在能跑，但以后可能会坑你”的第二层代码 review。

适合场景：

- 功能已经跑通
- happy path 看起来正确
- 普通 review 没发现明显 bug
- 但你担心隐藏副作用、兼容性、边界情况、性能、安全、测试和维护成本

推荐输入：

```text
请 review 当前 diff。
不要只看语法和明显 bug，请重点检查：隐藏副作用、破坏兼容性、边界情况、性能风险、安全风险、命名误导、测试不足和未来维护成本。
最后按严重程度排序。
```

### 3. Skill Recommender

路径：[`skills/skill-recommender`](skills/skill-recommender)

用途：当你犹豫该选哪个 Skill 时，根据当前场景推荐最合适的 3 个，并约定每个推荐都包含 Skill 名称、具体作用和推荐理由。

推荐输入：

```text
/recommend <描述你的任务、材料、约束和期望输出>
```

它会重点考虑：

- 任务目标和当前阶段
- 你已经有的输入材料
- 最大风险或成功标准
- 你希望得到的输出
- 自研 Skills 与第三方 Skills 的匹配度
- 每个推荐的 Skill 名称、具体作用和推荐理由

### 4. Debugging Webpage Anomalies

路径：[`skills/debugging-webpage-anomalies`](skills/debugging-webpage-anomalies)

用途：定位网页异常的根因，包括 OOM、CPU 打满、长任务、GC 抖动、React 重复渲染/更新循环、JS heap 增长、DOM 数量异常、detached DOM、长文本节点、大字符串、ArrayBuffer/Blob 内存、layout/paint 卡顿和 worker 异常。

适合场景：

- 页面卡死、崩溃、out of memory 或 CPU 长时间占满
- DevTools profile 或 heap snapshot 显示异常，但还不能确认根因
- 需要区分 JS 热路径、React update loop、内存泄漏、DOM 泄漏、文本膨胀、二进制内存和渲染瓶颈
- 希望输出带证据链的诊断结论，而不是泛泛性能优化建议

推荐输入：

```text
Use $debugging-webpage-anomalies to diagnose why this webpage hits OOM or maxes out CPU.
```

## 第三方 Skills 记录方式

第三方 Skills 不直接放进 `skills/`，避免和自研、可安装内容混在一起。建议记录到：

- [`third-party-skills.json`](third-party-skills.json)：机器可读索引
- [`third-party-skills/`](third-party-skills)：详细说明、评测、安装方式和使用建议

每个第三方 Skill 建议记录：

1. 名称
2. 来源链接或仓库
3. 适用场景
4. 为什么值得记录
5. 与自研 Skills 的关系或替代选择
6. 安装方式（如果已确认）
7. 是否可安装：`installable: true/false`

## 第三方 Skills 列表

| Skill | 来源 | 适用场景 | 安装方式 | 详情 |
| --- | --- | --- | --- | --- |
| `native-feel-cross-platform-desktop` | [`yetone/native-feel-skill`](https://github.com/yetone/native-feel-skill) | 跨平台桌面应用、系统 WebView、原生体验、typed IPC、Raycast 风格架构和发布前体验审计 | `npx skills add yetone/native-feel-skill -g` | [`third-party-skills/native-feel-cross-platform-desktop.md`](third-party-skills/native-feel-cross-platform-desktop.md) |
| `ponytail` | [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) | YAGNI、最小正确 diff、复用已有实现、标准库/平台原生优先、过度工程 review/audit | `codex plugin marketplace add DietrichGebert/ponytail` | [`third-party-skills/ponytail.md`](third-party-skills/ponytail.md) |
| `reverse-skill` | [`zhaoxuya520/reverse-skill`](https://github.com/zhaoxuya520/reverse-skill) | 授权逆向、安全研究、CTF、APK/二进制/JS 分析、工具链路由和报告生成 | `git clone https://github.com/zhaoxuya520/reverse-skill.git` | [`third-party-skills/reverse-skill.md`](third-party-skills/reverse-skill.md) |

## 机器可读索引

### `skills.json`

记录当前可安装的自研 Skills，包括名称、描述、路径、入口文件、版本、标签和是否可安装。新增自研 Skill 时，请同步更新该索引。

### `third-party-skills.json`

记录第三方 Skills。即使暂时没有第三方条目，也保留空索引，方便 `/recommend` 和其他自动化工具形成稳定的数据来源。

## Skill 编写原则

一个好的 Skill 不应该只是 prompt 片段，而应该尽量包含：

1. 它解决什么问题
2. 什么场景应该触发
3. 什么场景不应该触发
4. 需要收集哪些输入
5. 执行时的思考方式和工作流
6. 检查清单或判断维度
7. 输出格式
8. 好结果和坏结果的判断标准
9. 约束条件，避免 Agent 过度发挥

## 当前状态

- 已添加自研 Skill：`clone-website`
- 已添加自研 Skill：`risk-oriented-code-review`
- 已添加自研 Skill：`skill-recommender`
- 已添加 slash command：`/recommend`
- 已建立第三方 Skills 记录目录：`third-party-skills/`
- 已建立第三方 Skills 机器可读索引：`third-party-skills.json`
- 已记录第三方 Skill：`native-feel-cross-platform-desktop`
- 已支持通过 `npx skills@latest add grove94/grove-better-skills` 从 GitHub 一键安装自研 Skills
- 已支持通过 `install.sh` 从本地仓库一键安装指定自研 Skill
