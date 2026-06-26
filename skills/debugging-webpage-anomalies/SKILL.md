---
name: debugging-webpage-anomalies
description: Use when investigating browser tabs or web apps with out-of-memory/OOM, high CPU/CPU spikes, page freezes, long tasks, excessive GC, JS heap growth, DOM node growth, detached DOM, huge strings/text nodes, React render/update loops, ArrayBuffer/Blob memory, layout/paint stalls, or Chrome DevTools traces.
---

# Debugging Webpage Anomalies

## Core Rule

Diagnose before optimizing. First classify the anomaly, then trace who creates or retains the resource, then propose a fix direction.

If there is no reproducible path, profile, heap snapshot, counter trend, or minimal experiment, report a hypothesis. Do not claim root cause.

## Evidence First

Collect the smallest evidence set that can distinguish CPU, memory, DOM, text, binary, rendering, and GC problems:

1. Reproduction: route/page, user actions, data size, duration before failure, browser/version, device memory, extensions disabled or not.
2. Chrome Task Manager: tab/worker/GPU process CPU, memory footprint, JavaScript memory.
3. DevTools Performance or Performance Monitor: long tasks, scripting/rendering/painting/GC time, JS heap, DOM nodes, documents, event listeners.
4. DevTools Memory: heap snapshot before action, after action, after forced GC; compare retained size and retainer paths.
5. Counters over time: repeat the same action or route switch and record whether JS heap, DOM nodes, listeners, strings, ArrayBuffer, or memory footprint returns to baseline.

## Classify The Anomaly

Use evidence trends, not one-off large numbers.

| Evidence pattern | Likely class | Inspect next |
| --- | --- | --- |
| CPU high, Performance shows Scripting | JS hot path or render/update loop | Function stacks, loops, recursive work, regex, sort/filter, JSON parse/stringify, React render loops, effect dependency cycles, state-update storms |
| CPU high, frequent GC slices | Allocation churn or memory pressure | Allocation timeline, object churn, growing baseline after GC |
| Heap baseline rises after forced GC | JS memory leak | Retained size, retainer path, stores, caches, closures, globals |
| DOM nodes/listeners/documents rise after repeated actions | DOM or lifecycle leak | Detached DOM, unremoved listeners, observers, portals, route/component unmount paths |
| Many Detached HTML* nodes | Removed DOM still retained | Retainer path to listener, closure, framework component, Map/cache, third-party widget |
| Strings/text nodes dominate retained size | Text expansion | Logs, JSON strings, base64/data URLs, Markdown/rich text, diffs, stack traces, search indexes, WebSocket buffers |
| ArrayBuffer/Blob/native footprint high | Binary or external memory | Images, file previews, video, WASM, protobuf, streams, object URLs, transfer buffers |
| Rendering/Layout high | Render tree or layout work | Large DOM, layout thrash, sync reads after writes, tables/lists without virtualization |
| Painting/compositing high | Visual work | Canvas, WebGL, filters, shadows, animations, large layers |
| Worker process high | Background work | Worker message volume, parsing, compression, indexing, WASM, transferable ownership |

## Reference Routing

Load only the reference matching the suspected anomaly class:

- React render/update loops: `references/react-update-loops.md`
- JS hot paths, long tasks, and GC churn: `references/cpu-and-gc.md`
- JS heap leaks, DOM leaks, and detached DOM: `references/heap-and-dom-leaks.md`
- Huge strings, text nodes, ArrayBuffer, Blob, and native memory: `references/text-and-binary-memory.md`
- Rendering, layout, paint, and compositing stalls: `references/rendering-layout-paint.md`
- Worker, WASM, and background processing spikes: `references/workers-and-background-work.md`

## Trace The Owner

For every suspected class, answer:

- Which user action, timer, network message, route change, or worker message creates the work/resource?
- Which component, store, cache, listener, observer, worker, global, or third-party library retains it?
- Does it survive component unmount, route change, modal close, or forced GC?
- Does it grow linearly with repeated actions or with data size?
- For React apps, do commit counts, render counters, React Profiler, or Performance stacks show a component repeatedly triggering `setState`, unstable dependency arrays, selector/store subscription loops, context churn, or parent-child update feedback?
- If a codebase is available, search from the evidence: stack function names, component names, event names, cache keys, worker files, object URL creation, and large-string construction.

## Minimal Verification

Before recommending a fix, propose the smallest experiment that would confirm or falsify the diagnosis:

- Disable one component, panel, worker, animation, log stream, or data source.
- Repeat the same interaction N times and compare post-GC baseline.
- Cap list size, log size, text length, cache size, or binary preview count.
- For React update loops, add a render/commit counter, disable one effect/subscription/context provider, or stabilize one dependency/callback/selector to see whether the loop stops.
- Comment out one listener/observer/timer path in a local reproduction.
- Replace real data with a tiny fixture and then with the failing data size.

## Required Output

Use this format:

```text
Conclusion: confirmed | likely | hypothesis
Anomaly class: CPU | React render/update loop | GC churn | JS heap leak | DOM leak | detached DOM | text/string growth | ArrayBuffer/native memory | layout | paint | worker | mixed
Reproduction: <short path and data size>
Key evidence: <profiles, snapshots, counters, stacks, retained objects>
Root-cause chain: <user action> -> <resource/work created> -> <owner retains/repeats it> -> <observable failure>
Minimal verification: <one experiment>
Fix direction: <targeted direction, not a broad rewrite>
Unknowns: <what evidence is missing>
```

## Common Mistakes

- Do not diagnose a leak from high memory alone; check whether forced GC returns to baseline.
- Do not diagnose CPU from Task Manager alone; inspect Performance for scripting, rendering, painting, and GC.
- Do not ignore huge strings, text nodes, base64, data URLs, logs, and JSON; they often hide outside ordinary object-centric thinking.
- Do not treat DOM count as bad by itself; prove growth, retention, or render/layout cost.
- Do not assume React CPU overload is solved by memoization; first prove whether it is an effect dependency loop, render feedback loop, context churn, subscription loop, or a non-React JS hot path.
- Do not prescribe virtualization, memoization, cache clearing, or debouncing until the anomaly class is supported by evidence.
