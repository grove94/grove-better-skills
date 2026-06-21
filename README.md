# grove-better-skills

个人沉淀的好用 skills 仓库。

这里主要收集一些可以反复复用的 Agent / Codex / ChatGPT 工作流。每个 skill 尽量不只是一段 prompt，而是包含触发场景、输入要求、执行流程、检查清单、输出格式和质量标准，方便在真实工作里稳定复用。

## 一键安装

这个仓库提供了两种一键安装方式：

1. `npx skills add`：适合 Cloud、Codex 或任意 Node.js 环境，直接安装当前 npm 包内置的所有 skills。
2. [`install.sh`](install.sh)：适合已经 clone 当前仓库后的本地安装，或 shell-only 环境。

### 使用 npx 安装当前包内置 skills

安装当前包里的所有可安装 skills：

```bash
npx skills add
```

只安装某一个 skill：

```bash
npx skills add risk-oriented-code-review
```

覆盖已安装版本：

```bash
npx skills add --force
```

安装到自定义目录：

```bash
npx skills add --dir /path/to/skills
```

`skills add` 默认安装当前 npm 包里随包发布的 skills，并优先读取包内 `skills.json`；如果没有该文件，则扫描 `skills/*/SKILL.md`。默认安装位置与 `install.sh` 一致：优先使用 `SKILLS_DIR`，其次是 `CODEX_HOME/skills`，最后是 `~/.codex/skills`。

如果以后需要调试其他仓库，也可以显式传入 `--repo`：

```bash
npx skills add --repo jimliu/baoyu-skills risk-oriented-code-review
```

### 使用 install.sh 从本地仓库安装

[`install.sh`](install.sh) 可以把指定 skill 安装到 Codex / Cloud 兼容的 skills 目录中。

```bash
./install.sh risk-oriented-code-review
```

默认安装位置：

1. 如果设置了 `SKILLS_DIR`，安装到 `$SKILLS_DIR/<skill-name>`
2. 否则如果设置了 `CODEX_HOME`，安装到 `$CODEX_HOME/skills/<skill-name>`
3. 否则安装到 `~/.codex/skills/<skill-name>`

#### 安装到自定义目录

```bash
SKILLS_DIR=/path/to/skills ./install.sh risk-oriented-code-review
```

#### 覆盖已安装版本

如果目标目录已经存在，安装脚本会停止，避免误删本地修改。确认要覆盖时使用 `--force`：

```bash
./install.sh risk-oriented-code-review --force
```

#### 从 Cloud / 远程环境一键安装

在 Cloud 或其他临时环境中，可以直接下载并执行安装脚本。把 `<raw-install-url>` 替换成当前仓库 `install.sh` 的 Raw URL：

```bash
curl -fsSL <raw-install-url> | SKILLS_REPO_URL=<git-repo-url> bash -s -- risk-oriented-code-review
```

如需指定安装目录：

```bash
curl -fsSL <raw-install-url> | SKILLS_REPO_URL=<git-repo-url> SKILLS_DIR=/path/to/skills bash -s -- risk-oriented-code-review
```

`SKILLS_REPO_URL` 可以是 Git 仓库地址，也可以是当前机器上的本地仓库路径。它用于在 `curl | bash` 场景下临时拉取仓库内容，然后只安装你指定的 skill。

### 卸载

删除目标 skills 目录中的对应文件夹即可：

```bash
rm -rf ~/.codex/skills/risk-oriented-code-review
```

## 机器可读索引

仓库根目录的 [`skills.json`](skills.json) 记录了当前可安装 skill 的名称、描述、路径、入口文件、版本、标签和是否可安装。后续新增 skill 时，请同步更新这个索引，方便 Cloud / Codex 或其他自动化工具发现可安装项。

## Skills

### 1. Risk-Oriented Code Review

路径：[`skills/risk-oriented-code-review`](skills/risk-oriented-code-review)

一键安装：

```bash
npx skills add risk-oriented-code-review
```

本地安装：

```bash
./install.sh risk-oriented-code-review
```

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

它会重点检查：

- 隐藏副作用
- 破坏兼容性
- 边界情况
- 性能风险
- 安全风险
- 命名误导
- 测试不足
- 未来维护成本

输出会按严重程度排序：

- P0 / Blocker：合并前必须修
- P1 / High：建议合并前修
- P2 / Medium：可接受但需要 follow-up
- P3 / Low：轻量优化、命名、文档或测试补充

## 推荐目录结构

```text
skills/
└── skill-name/
    ├── SKILL.md
    └── README.md
```

## Skill 编写原则

一个好的 skill 不应该只是 prompt 片段，而应该尽量包含：

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

- 已添加：`risk-oriented-code-review`
- 已支持：通过 `npx skills add` 一键安装当前包内置 skill 到 Cloud / Codex 兼容目录
- 已支持：通过 `install.sh` 从本地仓库一键安装指定 skill
- 后续可以继续沉淀更多日常高频工作流，例如 PR 评论处理、CI 失败排查、产品方案 review、技术方案 review 等。
