# Risk-Oriented Code Review

这是一个用于“第二层代码 review”的 skill。

它不主要检查代码现在能不能跑，而是专门检查：

> 这段代码现在看起来没问题，但以后会不会变成坑？


## 安装

使用 npx 安装当前包内置 skill：

```bash
npx skills add risk-oriented-code-review
```

从仓库根目录执行：

```bash
./install.sh risk-oriented-code-review
```

默认会安装到 Codex / Cloud 兼容的 skills 目录：

1. 如果设置了 `SKILLS_DIR`，安装到 `$SKILLS_DIR/risk-oriented-code-review`
2. 否则如果设置了 `CODEX_HOME`，安装到 `$CODEX_HOME/skills/risk-oriented-code-review`
3. 否则安装到 `~/.codex/skills/risk-oriented-code-review`

安装到自定义目录：

```bash
SKILLS_DIR=/path/to/skills ./install.sh risk-oriented-code-review
```

覆盖已安装版本：

```bash
npx skills add risk-oriented-code-review --force
```

或在本地仓库中执行：

```bash
./install.sh risk-oriented-code-review --force
```

在 Cloud 或远程环境中，优先使用 `npx skills add risk-oriented-code-review` 安装当前包内置 skill。安装后，如果环境没有自动发现新 skill，请重启当前 Codex / Cloud session。

## 适用场景

适合在以下阶段使用：

- 功能已经跑通
- happy path 看起来正确
- 普通 review 没发现明显 bug
- 但你担心隐藏副作用、兼容性、边界情况、性能、安全、测试和维护成本

## 推荐输入

```text
请 review 当前 diff。
不要只看语法和明显 bug，请重点检查：隐藏副作用、破坏兼容性、边界情况、性能风险、安全风险、命名误导、测试不足和未来维护成本。
最后按严重程度排序。
```

## 它会重点检查什么

- 隐藏副作用：全局状态、缓存、事件监听、异步时序、清理逻辑
- 兼容性风险：旧调用方、旧数据、旧配置、旧 UI 流程是否还能工作
- 边界情况：空输入、重复数据、慢网络、失败重试、并发、平台差异
- 性能风险：热路径、重复扫描、阻塞 I/O、无界内存、缺少分页/缓存/节流
- 安全风险：命令注入、路径穿越、密钥泄露、越权、危险默认值
- 命名误导：名字、抽象、注释、配置是否让维护者形成错误理解
- 测试不足：是否只覆盖 happy path，是否缺少回归、失败、迁移、并发、安全测试
- 维护成本：隐式耦合、重复逻辑、职责混杂、难测试设计

## 输出形态

默认按严重程度排序：

- P0 / Blocker：合并前必须修
- P1 / High：建议合并前修，否则需要明确接受风险
- P2 / Medium：可以带 follow-up，但要记录风险
- P3 / Low：偏清晰度、命名、文档、轻量测试补充

每个问题会尽量包含：

- 位置
- 问题
- 为什么现在能跑
- 未来会坑在哪里
- 触发场景
- 建议修改
- 建议测试
- 置信度

## 设计原则

这个 skill 的重点不是“挑刺”，而是帮助你提前发现那些：

- 当下没报错
- 测试也可能过
- 但上线后、规模变大后、旧逻辑叠加后、下一个人维护时会爆炸

的地方。
