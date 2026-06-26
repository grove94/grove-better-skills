# Rendering Layout Paint

Use this reference when Performance traces show rendering, layout, style recalculation, paint, compositing, canvas, or animation work dominating the main thread.

## Evidence To Collect

- Performance trace with rendering categories visible: Recalculate Style, Layout, Update Layer Tree, Paint, Composite Layers.
- DOM size, affected nodes, layout invalidation source, and whether forced synchronous layout appears.
- Screenshots or paint flashing if needed to see repaint regions.
- Animation timeline: JS-driven animation, CSS animation, scroll handlers, canvas/WebGL frame work.
- Layer count, large surfaces, filters, shadows, sticky/fixed elements, and transformed regions.

## Common Shapes

| Shape | Signal | Inspect |
| --- | --- | --- |
| Layout thrash | Repeated layout after JS reads/writes | `getBoundingClientRect`, offset reads, style writes, measurement loops |
| Huge render tree | Layout cost scales with DOM count | Tables, lists, trees, hidden but mounted views, virtualization boundary |
| Style recalculation storm | Recalculate Style dominates | broad selectors, class toggles high in tree, CSS variables on root |
| Paint-heavy UI | Paint/composite dominates | filters, shadows, blend modes, large backgrounds, sticky headers |
| Canvas/WebGL frame cost | Frame work dominates outside DOM | draw calls, texture uploads, readbacks, resize loops |
| Animation jank | Long tasks align with frames | JS animation, scroll/resize handlers, layout-affecting properties |

## Minimal Experiments

- Hide or cap the suspected list/table/tree and compare layout time.
- Batch DOM reads and writes in one local experiment to test layout thrash.
- Disable one expensive visual effect, filter, shadow, animation, canvas layer, or sticky region.
- Use a tiny fixture and then the failing data size to identify scaling.
- Replace JS-driven animation with no-op or CSS transform-only movement to isolate the cause.

## Diagnosis Wording

```text
Anomaly class: layout | paint
Evidence: Performance trace shows <Layout/Paint/Recalculate Style/Composite> taking <duration> after <action>; affected by <DOM/visual owner>.
Root-cause chain: <action/data size/frame> -> <DOM/style/visual invalidation> -> <expensive rendering stage> -> long task/frame drops/CPU overload.
Minimal verification: <hide/cap/batch/disable experiment>.
Fix direction: reduce affected DOM, virtualize only if DOM scale is proven, batch reads/writes, remove expensive paint effects, or move frame work off the critical path.
```

## Avoid

- Do not prescribe virtualization unless layout or DOM scale is proven.
- Do not call it a React problem just because React rendered before layout; inspect the browser rendering stage.
- Do not optimize CSS blindly; use trace evidence to identify style, layout, paint, or compositing.
