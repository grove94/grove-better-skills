# Text And Binary Memory

Use this reference when heap snapshots or memory counters show huge strings, text nodes, JSON, base64/data URLs, ArrayBuffer, Blob, images, files, WASM, or native memory growth.

## Evidence To Collect

- Heap snapshot object groups for `string`, concatenated strings, text nodes, `ArrayBuffer`, Blob wrappers, and typed arrays.
- Memory footprint versus JavaScript memory; a large gap can indicate native, image, GPU, or browser-managed memory.
- Payload sizes from network, WebSocket, file input, clipboard, logs, rich text, Markdown, diff, or error reporting.
- Object URL creation count and whether `URL.revokeObjectURL` is called.
- Retainer paths from large strings/buffers to UI state, logs, caches, stores, workers, or previews.

## Common Shapes

| Shape | Signal | Inspect |
| --- | --- | --- |
| Log or console panel growth | Strings/text nodes grow with time | Append-only logs, max line count, virtualized log view |
| JSON/string duplication | Same payload retained as raw string and parsed objects | Fetch pipeline, caching layers, stringify/parse loops |
| Base64/data URL blowup | Large strings with image/file previews | Prefer Blob/object URL, revoke lifecycle, avoid duplicating base64 |
| Rich text/diff expansion | DOM text nodes and strings dominate | Syntax highlighting, Markdown AST, hidden old documents |
| ArrayBuffer leak | Buffers retained after preview/upload/worker | typed arrays, transfer ownership, stream buffers, protobuf/WASM |
| Native/image memory | Memory footprint grows more than JS heap | image decode cache, canvas, video, GPU texture, object URLs |

## Minimal Experiments

- Cap log lines, text length, diff size, or message retention and compare post-GC baseline.
- Disable preview/rendering while still loading the data to separate data retention from DOM rendering.
- Revoke object URLs at lifecycle boundary and repeat the preview flow.
- Replace base64/data URLs with Blob URLs in a local experiment.
- Transfer or release ArrayBuffers between worker and main thread; verify which side retains them.

## Diagnosis Wording

```text
Anomaly class: text/string growth | ArrayBuffer/native memory
Evidence: Snapshot/memory counters show <strings/text nodes/buffers/native footprint> growing after <action>; retained by <owner>.
Root-cause chain: <data source> -> <large text/binary representation> -> <duplicate/cache/preview/log retains it> -> memory growth/OOM.
Minimal verification: <cap/disable/revoke/replace experiment>.
Fix direction: bound retention, avoid duplicate representations, stream large data, revoke object URLs, dispose previews, or move binary ownership deliberately.
```

## Avoid

- Do not ignore strings just because they are "data"; text can dominate heap.
- Do not rely only on JS heap when images, canvas, video, Blob, or GPU resources may live outside it.
- Do not keep raw payload, parsed payload, rendered DOM, and preview copy unless each owner is intentional and bounded.
