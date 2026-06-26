# Heap And DOM Leaks

Use this reference when JS heap, DOM nodes, documents, event listeners, or detached DOM grow after repeated actions or route changes.

## Evidence To Collect

- Heap snapshots before action, after action, and after forced GC.
- Counter trend for JS heap, DOM nodes, documents, listeners, and memory footprint across repeated actions.
- Retained size and retainer paths for growing object groups.
- Detached DOM nodes: class/tag names, count, retained size, and retaining owners.
- Lifecycle boundary: modal close, tab close, route change, component unmount, or worker termination.

## Common Shapes

| Shape | Signal | Inspect |
| --- | --- | --- |
| Cache/store leak | Objects retained from global store, Map, array, query cache | Eviction, key growth, route/user scoping, stale entries |
| Closure retention | Large data retained by function/handler | Captured props/data, callbacks, timers, promises |
| Listener leak | Listener count grows; detached nodes retained | `addEventListener`/cleanup symmetry, framework effects, passive listeners |
| Observer leak | Mutation/Resize/Intersection observers retain DOM | disconnect paths, observed targets, unmount cleanup |
| Detached DOM | Removed nodes remain after GC | Retainer path to listener, closure, widget, portal, framework instance |
| Document/iframe leak | documents count grows | iframe teardown, object URLs, external widgets, references to `contentWindow` |

## Minimal Experiments

- Repeat the same mount/unmount or route switch N times and force GC after each cycle.
- Disable one cache, listener, observer, portal, iframe, or third-party widget.
- Add temporary cleanup logging to prove whether teardown runs.
- Clear the suspected store/cache after unmount; if baseline drops, inspect ownership and eviction.
- Replace the failing page with a tiny fixture to separate lifecycle leak from data-size pressure.

## Diagnosis Wording

```text
Anomaly class: JS heap leak | DOM leak | detached DOM
Evidence: Post-GC baseline grows from <A> to <B>; snapshot retains <object/node group> via <retainer path>.
Root-cause chain: <action/lifecycle> -> <objects/nodes created> -> <owner fails to release> -> retained growth -> OOM/slowdown.
Minimal verification: <repeat cycle plus disabled owner or cleanup experiment>.
Fix direction: release the owner at lifecycle boundary, add bounded cache eviction, remove listeners, disconnect observers, or dispose third-party/widget resources.
```

## Avoid

- Do not call high heap a leak if forced GC returns to baseline.
- Do not stop at "Detached HTMLDivElement"; follow the retainer path to the owner.
- Do not clear all caches blindly; identify which cache grows without bound and why.
