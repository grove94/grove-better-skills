# CPU Hot Paths And GC Churn

Use this reference when CPU is high, the page freezes, long tasks dominate, or Performance traces show heavy scripting or frequent GC.

## Evidence To Collect

- Performance recording around the slow action, with screenshots disabled if tracing overhead is too high.
- Main-thread breakdown: scripting, rendering, painting, idle, and GC slices.
- Long tasks: task duration, repeated stacks, initiator event, and whether user input is blocked.
- Allocation timeline: object allocation rate, short-lived objects, and whether GC runs repeatedly under memory pressure.
- Source map stack names: component, handler, parser, serializer, selector, formatter, or third-party library.

## Common Shapes

| Shape | Signal | Inspect |
| --- | --- | --- |
| Tight loop or recursion | One stack dominates scripting time | Loop bounds, termination, data size, recursion depth |
| Expensive parsing/serialization | `JSON.parse`, `JSON.stringify`, codecs, compression | Payload size, repeated parse/stringify, worker offload opportunity |
| Expensive search/sort/filter | Array methods dominate traces | Input size, repeated recomputation, selector memoization, indexes |
| Regex backtracking | Regex frame dominates CPU | Input length, nested quantifiers, worst-case text |
| Event storm | Many small handlers or long tasks after input/scroll/resize | Throttle/debounce, listener count, passive listeners |
| Allocation churn | CPU high with many GC slices but baseline may return | Temporary object creation, mapped arrays, string concatenation, cloning |

## Minimal Experiments

- Run the same action with tiny, normal, and failing data sizes; compare CPU growth curve.
- Disable one handler, parser, selector, formatter, or third-party plugin.
- Move or stub the heavy transform; if CPU drops, inspect ownership and call frequency.
- Replace repeated parse/stringify or clone paths with a counter to confirm frequency.
- For GC churn, reduce temporary allocations in one hot path and check whether GC slices shrink.

## Diagnosis Wording

```text
Anomaly class: CPU | GC churn
Evidence: Performance trace shows <function/component/library> consuming <duration/count>; GC slices <frequency> if relevant.
Root-cause chain: <action/event> -> <hot path or allocation churn> -> <repeated work/data size amplification> -> CPU overload/freeze.
Minimal verification: <one disabled path, smaller data, or reduced allocation experiment>.
Fix direction: reduce call frequency, bound data size, cache proven repeated pure work, move background-safe work off main thread, or fix the algorithmic hot path.
```

## Avoid

- Do not conclude "CPU problem" from Task Manager alone; use Performance stacks.
- Do not confuse GC churn with a leak; check post-GC baseline before calling it retained memory.
- Do not prescribe debouncing or memoization until the hot path and trigger frequency are known.
