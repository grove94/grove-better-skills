# reverse-skill

来源：<https://github.com/zhaoxuya520/reverse-skill>

## 适用场景

用于已授权的逆向工程、安全研究、渗透测试、CTF、APK / 二进制 / 前端 JS / 抓包 / 固件 / 攻击链分析等任务。它不是单个分析工具，而是一套面向代码 Agent 的 Skill Router + Tool Orchestration 系统。

适合问题包括：

- 需要先判断任务类型，再路由到 APK、JS、二进制、固件、CTF、渗透工具链等子 skill
- 需要检查本机逆向、安全工具链是否可用，并按需 bootstrap
- 需要把 jadx、apktool、Frida、radare2、IDA、BurpSuite、浏览器自动化等工具纳入 Agent 工作流
- 需要输出逆向报告、渗透报告、攻击路径图、CTF writeup 或可复用经验记录
- 需要让安全任务少猜命令，先按规则和路由矩阵进入对应工作流

## 为什么值得记录

`reverse-skill` 的价值在于把安全和逆向任务拆成“规则入口 -> 路由判断 -> 子 skill -> 工具链 -> 报告 / field journal”的执行链。它覆盖面很宽，适合做安全类任务的总控入口，而不是只作为某个工具的 prompt。

## 主要模块

- `skills/SKILL.md`：主控制入口。
- `skills/routing.md`：按目标类型、用户意图和工具链需求做路由。
- `skills/apk-reverse/`：APK / Android 分析。
- `skills/js-reverse/`：前端 JS 参数、签名和补环境分析。
- `skills/reverse-engineering/`：通用逆向方法论。
- `skills/ida-reverse/`、`skills/radare2/`：二进制分析工具链。
- `skills/pentest-tools/`：渗透测试工具链。
- `skills/docs-generator/`、`skills/diagram-generator/`：报告和图表生成。
- `CTF-Sandbox-Orchestrator/`：CTF 场景子技能库。

## 使用边界

仅记录为授权环境下的安全研究、教学实验、内部测试、CTF 和防护验证候选。不要用于未授权访问、真实目标攻击、破坏性操作或规避合法安全边界。

## 与本仓库自研 Skills 的关系

- 与 `skill-recommender` 互补：当用户任务明显属于安全研究、逆向、CTF、抓包、APK、二进制或工具链编排时，可作为第三方候选推荐。
- 不替代 `risk-oriented-code-review`：`reverse-skill` 是安全任务路由和工具执行入口，`risk-oriented-code-review` 是普通代码 diff 的风险审查。

## 安装方式

上游推荐将整个包放到本地任意目录，并让 AI Agent 从 README / RULES / `skills/SKILL.md` 执行 bootstrap。基础获取方式：

```bash
git clone https://github.com/zhaoxuya520/reverse-skill.git
```

首次使用前，需要按上游 README 的平台说明刷新工具索引，例如 Linux / macOS：

```bash
bash skills/scripts/refresh-tool-index.sh
```

Windows 环境使用：

```powershell
powershell -ExecutionPolicy Bypass -File skills/scripts/refresh-tool-index.ps1
```

## 记录状态

- `installable: true`
- 已确认来源仓库包含 `skills/SKILL.md`
- 已确认仓库包含 `skills/routing.md` 和多个安全 / 逆向子 skill
- 适合作为第三方推荐候选，不放入本仓库 `skills/` 目录
