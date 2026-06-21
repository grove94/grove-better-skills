---
name: risk-oriented-code-review
description: Use this skill to perform a second-layer code review on the current diff. It focuses on changes that appear to work now but may create future problems: hidden side effects, compatibility breaks, boundary cases, performance risks, security risks, misleading naming, insufficient tests, and long-term maintenance cost.
---

# Risk-Oriented Code Review

## Purpose

This skill is for reviewing code that already appears to work.

The goal is not to repeat a normal syntax or obvious-bug review. The goal is to find places where the current diff may be correct on the happy path but risky in production, risky for old users, risky at scale, or risky for future maintainers.

Use this skill to answer the question:

> 这段代码现在能跑，但以后会不会坑我？

## Trigger examples

Use this skill when the user says things like:

```text
请 review 当前 diff。不要只看语法和明显 bug，请重点检查：隐藏副作用、破坏兼容性、边界情况、性能风险、安全风险、命名误导、测试不足和未来维护成本。最后按严重程度排序。
```

Also use it for similar requests:

- “帮我看这个 diff 有没有埋雷”
- “功能看起来是对的，但我想做一次更深入的 review”
- “不要只看能不能跑，帮我看未来维护风险”
- “帮我找现在没报错但以后可能会出问题的地方”
- “做一次第二层 code review”

## Do not use this skill for

Do not use this skill as the primary workflow when the user mainly wants:

- formatting or style-only review
- pure syntax checking
- explaining unfamiliar code without a diff
- implementing a requested feature
- fixing CI failures from logs
- resolving existing PR comments

If the user asks for one of those, use the more specific workflow first. You may still apply this skill after the main task is complete.

## Inputs to collect

Before reviewing, identify the best available evidence. Prefer concrete diff and surrounding context over assumptions.

Required or preferred inputs:

1. Current diff or PR patch
2. Changed file list
3. Relevant surrounding code for changed functions/classes/modules
4. Existing tests touched by the diff
5. Public API, config, schema, CLI, or persisted data contracts affected by the diff
6. Runtime context: browser, Node, Python, server, desktop, mobile, extension, CLI, platform constraints
7. User-stated intent of the change, if available

If the diff is available, proceed directly. Do not ask for clarification unless the review would be impossible without it.

## Review mindset

A normal review asks:

> 现在有没有报错？

This skill asks:

> 它现在为什么能跑？这个“能跑”依赖了哪些隐含前提？这些前提以后会不会被破坏？

Keep asking:

- Does this change silently alter old behavior?
- Does it change a shared assumption used by other code?
- Does it add state, timing, ordering, caching, lifecycle, or permission side effects?
- Does it work only because the current input is small, clean, or perfectly ordered?
- Does it preserve old callers, old configs, old data, old UI flows, and old platform behavior?
- Does the name make future maintainers believe something false?
- Do tests lock down the risky behavior or only the happy path?
- Is the fix local, or does it require a contract/migration/design decision?

## Workflow

### Step 1: Understand the change intent

Summarize what the diff appears to do in 1-3 sentences.

Classify the change type:

- behavior change
- API or schema change
- config/default change
- persistence or migration change
- performance-sensitive path
- security-sensitive path
- UI interaction change
- infrastructure/build/runtime change
- test-only change

If the intent is unclear, infer it from the diff and mark uncertain assumptions as “需要确认”.

### Step 2: Map the blast radius

List what may be affected beyond the edited lines:

- callers
- downstream consumers
- old data
- config files
- cache/state
- background jobs
- retries/timers/listeners
- platform-specific paths
- external services
- permissions/secrets
- tests and fixtures

Look for code that is not changed but depends on changed behavior.

### Step 3: Review by risk dimension

Review the diff across the dimensions below. Do not force every dimension to have findings. Only report issues grounded in the diff or clearly missing evidence.

#### A. Hidden side effects

Look for unexpected changes to:

- global state
- shared cache
- singleton instances
- mutable module-level variables
- environment variables
- feature flags
- event listeners
- timers and intervals
- retry behavior
- cleanup and disposal
- logging and telemetry
- local storage or persisted state
- async ordering
- transaction boundaries

Typical smells:

- new side effect inside a function that looks like a pure helper
- initialization code that now runs earlier, later, or more than once
- cleanup path removed or made conditional
- mutation of input objects
- retries that can duplicate writes
- event listeners added without removal

#### B. Compatibility and contract risk

Check whether old users and old callers still work.

Review:

- public function signatures
- return value shape
- error shape
- config names and defaults
- CLI flags
- request/response schemas
- database schema and migrations
- serialized data and persisted state
- feature flags
- browser/runtime/platform support
- backward compatibility of user-visible behavior

Typical smells:

- default value changed without migration or release note
- optional field becomes required
- old enum value removed
- error type/message changed while callers depend on it
- persisted data read path only supports the new format
- Windows/macOS/Linux path behavior differs

#### C. Boundary cases

Search for cases outside the clean path:

- empty input
- null/undefined/missing fields
- duplicate items
- invalid enum values
- very large input
- slow network
- failed dependency
- permission denied
- stale data
- partial success
- retry after failure
- concurrent calls
- out-of-order async completion
- non-ASCII/i18n content
- timezone/date boundary
- filesystem path edge cases

Typical smells:

- code assumes first item exists
- code assumes only one match
- code assumes stable ordering
- code assumes network call always succeeds
- code handles success but not partial failure
- code handles create path but not update/migration path

#### D. Performance and scalability risk

Check whether the code is fine in a demo but risky at scale.

Review:

- hot paths
- render loops
- startup path
- request path
- background polling
- filesystem scans
- database queries
- network calls
- serialization/deserialization
- memory ownership
- batching/debounce/cache behavior

Typical smells:

- repeated full scans
- nested loops over growing collections
- repeated network calls inside loops
- blocking I/O in latency-sensitive paths
- unbounded memory growth
- missing pagination
- missing debounce/throttle
- expensive recomputation on every render/event

#### E. Security and privacy risk

Check for:

- command injection
- path traversal
- unsafe shell execution
- SSRF or unsafe URL fetch
- unsafe HTML/script injection
- token/secret leakage
- overly broad permissions
- unsafe file writes/deletes
- missing authorization checks
- insecure defaults
- logging sensitive data
- trusting client-side state
- unsafe deserialization

Typical smells:

- user input reaches shell/file/network without validation
- path join without containment check
- logs include tokens, cookies, headers, or personal data
- permission check exists in UI but not backend/tool layer
- new fallback weakens a security boundary

#### F. Naming and abstraction risk

Check whether names and abstractions will mislead future maintainers.

Review:

- function names
- class names
- boolean flags
- config keys
- comments
- helper boundaries
- module ownership
- responsibility split

Typical smells:

- name implies generic behavior but implementation is special-case
- boolean flag hides multiple modes
- comment explains old behavior
- helper mutates state despite looking read-only
- config name implies safety/validation but only changes display
- abstraction mixes orchestration, I/O, validation, and rendering

#### G. Test coverage risk

Do not simply say “add tests”. Identify which risk is unprotected.

Check for tests covering:

- old behavior regression
- edge cases
- failure paths
- migration path
- authorization/security path
- concurrency/timing
- platform differences
- large input/performance-sensitive behavior
- public API contract

Typical smells:

- tests only cover the successful path
- snapshot updated without assertion of behavior
- test mocks hide real integration risk
- no regression test for changed old behavior
- migration code has no old-data fixture

#### H. Maintenance cost

Check whether future changes will become harder because of this diff.

Review:

- duplicated logic
- hidden coupling
- unclear ownership
- implicit invariants
- missing comments for non-obvious tradeoffs
- config explosion
- feature flag lifecycle
- difficult-to-test design
- one-off special cases leaking into generic layers

Typical smells:

- same condition copied across files
- business rule embedded inside low-level utility
- new mode added without explicit state model
- workaround lacks comment or removal plan
- tests depend on implementation details rather than behavior

### Step 4: Assign severity

Use the following severity levels.

#### P0 / Blocker

Must fix before merge.

Use when the issue can cause:

- data loss or corruption
- security vulnerability
- serious compatibility break
- production outage
- irreversible migration problem
- destructive action without guardrail

#### P1 / High

Should fix before merge unless there is a conscious tradeoff.

Use when the issue can cause:

- common user flow breakage
- major hidden side effect
- likely regression in old behavior
- significant performance degradation
- missing test for a risky path
- hard-to-debug production failure

#### P2 / Medium

Can merge with follow-up only if risk is accepted.

Use when the issue can cause:

- edge-case bug
- moderate maintenance burden
- confusing abstraction
- incomplete but non-critical test coverage
- scalability issue under higher load but not immediate usage

#### P3 / Low

Nice to fix.

Use when the issue is mostly:

- clarity
- naming precision
- small refactor
- minor missing test
- documentation improvement

### Step 5: Produce the review

Output must be sorted by severity, highest first.

For each finding, include:

- concrete location or code area
- what changed
- why it is risky
- realistic trigger scenario
- suggested fix
- suggested test
- confidence level if uncertain

Avoid generic statements. A finding should be actionable enough that an engineer can make a change without asking what you meant.

## Output format

Use this format by default:

```markdown
## 总体判断

一句话说明这个 diff 最大的风险，以及是否建议直接合并。

## 我重点检查了什么

- 变更意图：...
- 主要影响面：...
- 最高风险维度：...

## 按严重程度排序的问题

### P0 / Blocker

如果没有，写：未发现明确 P0。

#### 1. 标题

- 位置：`path/to/file.ext` / function / module
- 问题：...
- 为什么现在能跑：...
- 未来会坑在哪里：...
- 触发场景：...
- 建议修改：...
- 建议测试：...
- 置信度：高 / 中 / 低；如为低，说明需要确认什么。

### P1 / High

如果没有，写：未发现明确 P1。

#### 1. 标题

- 位置：...
- 问题：...
- 为什么现在能跑：...
- 未来会坑在哪里：...
- 触发场景：...
- 建议修改：...
- 建议测试：...
- 置信度：...

### P2 / Medium

同上。

### P3 / Low

同上。

## 测试补充建议

按优先级列出最值得补的测试：

1. ...
2. ...
3. ...

## 可以接受的风险

列出看起来有风险但当前可以接受的点，并说明接受理由。

## 需要确认的问题

列出阻碍判断的上下文问题。不要用它替代 review 本身。
```

## Review quality bar

A good review from this skill should feel like:

- “这段代码为什么现在能跑”被解释清楚了
- “以后会在哪里坑你”被具体化了
- 每个严重问题都有触发场景
- 每个严重问题都有建议修改和建议测试
- 问题按严重程度排序，而不是按文件顺序排序
- 没有把风格偏好包装成高风险问题

A bad review looks like:

- 只说“建议增加测试”
- 只检查语法和明显 bug
- 只按文件逐行吐槽
- 找不到真实触发场景
- 把命名偏好说成 blocker
- 没有区分 P0/P1/P2/P3
- 没有说明哪些风险是推测、哪些风险是确定

## Constraints

- Do not invent issues that are not supported by the diff or nearby code.
- Do not require perfect architecture if the change is intentionally small.
- Do not over-focus on style nits unless the naming or abstraction creates real misunderstanding.
- Do not ask for more context before giving any review if the diff is available.
- If the diff is small and safe, say so clearly and explain why.
- If evidence is insufficient, mark the item as “需要确认” and describe the missing evidence.

## Example invocation

```text
请 review 当前 diff。
不要只看语法和明显 bug，请重点检查：隐藏副作用、破坏兼容性、边界情况、性能风险、安全风险、命名误导、测试不足和未来维护成本。
最后按严重程度排序。
```

## Example output skeleton

```markdown
## 总体判断

这个 diff 当前 happy path 大概率能跑，但最大风险是把原本局部的状态更新变成了全局副作用，可能影响旧流程；建议至少修复 P1 后再合并。

## 我重点检查了什么

- 变更意图：把 xxx 流程从同步改为异步缓存。
- 主要影响面：旧调用方、缓存失效、并发请求、失败重试。
- 最高风险维度：隐藏副作用、边界情况、测试不足。

## 按严重程度排序的问题

### P0 / Blocker

未发现明确 P0。

### P1 / High

#### 1. 缓存 key 缺少 userId，可能串用户状态

- 位置：`src/cache.ts#getCacheKey`
- 问题：新的缓存 key 只包含 resourceId，没有包含 userId。
- 为什么现在能跑：本地测试只有单用户、单资源路径。
- 未来会坑在哪里：多用户并发访问同一 resourceId 时，可能读到其他用户的缓存结果。
- 触发场景：A 用户和 B 用户同时访问同一个资源 ID，但权限不同。
- 建议修改：把 userId/tenantId 纳入缓存 key，或者在读取缓存前做权限校验。
- 建议测试：增加两个用户访问同一 resourceId 的隔离测试。
- 置信度：高。
```
