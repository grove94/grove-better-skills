# React Update Loops

Use this reference when evidence suggests CPU overload comes from repeated React renders, commits, effects, subscriptions, or parent-child feedback rather than a standalone JS hot path.

## Evidence To Collect

- React Profiler: commit count, commit duration, which component renders repeatedly, and why it rendered when available.
- Performance profile: repeated React stack frames, effect callbacks, scheduler work, subscription callbacks, or state setters.
- Render counters: temporary `console.count`, `useRef` counters, or local instrumentation on the suspected component path.
- Dependency comparison: whether props, callbacks, arrays, objects, selector results, or context values change identity every render.
- Scope check: whether the loop stops after disabling one effect, subscription, context provider, query hook, or parent callback.

## Common Loop Shapes

| Shape | Signal | What to inspect |
| --- | --- | --- |
| Effect dependency cycle | `useEffect` runs after every commit and calls `setState` | Dependency array, derived state, fetch/update callbacks, object/function dependencies |
| Render-time update | React warning or immediate repeated renders | `setState`, store writes, navigation, or dispatch during render |
| Unstable identity churn | Child/effect reruns despite same visible data | Inline objects, arrays, callbacks, context values, selector return objects |
| Store subscription loop | Store update triggers selector/subscriber which writes back | Selector equality, subscription cleanup, derived store writes, external store hooks |
| Parent-child feedback | Child effect calls parent setter; parent passes changed props back | Callback ownership, derived props, controlled component sync |
| Context churn | Broad subtree commits every provider render | Provider `value` identity, provider placement, splitting contexts |
| Query/router loop | Fetch/navigation invalidates state and retriggers itself | Query keys, enabled flags, route effects, cache invalidation |

## Minimal Experiments

- Disable one suspected effect or subscription; if CPU drops, inspect its trigger and dependency chain.
- Stabilize one dependency with existing stable state, `useMemo`, or `useCallback`; only keep it if the loop evidence disappears.
- Replace selector results with primitives or add equality checks to test identity churn.
- Move a parent update out of child feedback, or guard it with an equality check.
- Temporarily freeze the data source, query invalidation, or route update to see whether commits stop.

## Diagnosis Wording

When reporting React loops, include the loop shape and evidence:

```text
Anomaly class: React render/update loop
Evidence: React Profiler shows <component> committing <count> times after <action>; Performance stack repeats <effect/subscription/setter>.
Root-cause chain: <action> -> <effect/subscription/render path> -> <state/store/context update> -> <dependency/prop identity changes> -> repeat commits -> CPU overload.
Minimal verification: <one disabled effect/subscription or stabilized dependency experiment>.
Fix direction: break the feedback loop at the owner; do not blanket-memoize unrelated components.
```

## Avoid

- Do not call it a React loop just because React appears in the stack; prove repeated commits or a feedback chain.
- Do not default to `memo`, `useMemo`, or `useCallback` everywhere. Use them only when identity churn is the proven trigger.
- Do not ignore non-React work inside effects, selectors, render helpers, or subscription callbacks; it may be the real hot path.
