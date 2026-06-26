# Workers And Background Work

Use this reference when Chrome Task Manager or traces show high CPU or memory in workers, WASM, background parsing, compression, indexing, or message passing.

## Evidence To Collect

- Chrome Task Manager process row: tab, dedicated worker, service worker, shared worker, GPU, or extension.
- Worker script names, message types, message frequency, payload size, and whether messages are transferable or cloned.
- Performance traces from main thread and worker when available.
- WASM, compression, parsing, search indexing, syntax highlighting, ML, image/video processing, or file handling stacks.
- Memory ownership for ArrayBuffer, typed arrays, caches, and worker-side stores.

## Common Shapes

| Shape | Signal | Inspect |
| --- | --- | --- |
| Message storm | Many postMessage calls or large payloads | Event source, batching, backpressure, structured clone cost |
| Clone instead of transfer | CPU/memory grows with binary payloads | Transferable ArrayBuffer, ownership expectations, duplicate buffers |
| Worker hot loop | Worker CPU high after one action | Loop bounds, cancellation, stale jobs, queue drain |
| WASM/native compute | WASM frames dominate | input size, memory growth, disposal API, thread pool |
| Background index/cache growth | Worker memory rises over time | index invalidation, cache eviction, route/project scope |
| Service worker issue | Work persists beyond page action | fetch handlers, cache storage, sync/push, update lifecycle |

## Minimal Experiments

- Disable the worker or one message type and compare tab/worker CPU.
- Batch or throttle messages in a local experiment to test message storm behavior.
- Transfer ArrayBuffers instead of cloning, or replace binary payload with tiny fixture.
- Add cancellation or job queue counters to verify stale work.
- Clear worker-side cache/index after route close and compare memory.

## Diagnosis Wording

```text
Anomaly class: worker
Evidence: Chrome Task Manager/trace shows <worker/script> consuming <CPU/memory>; messages/job type <name> repeat or retain <payload>.
Root-cause chain: <page action/data source> -> <worker message/job> -> <compute/clone/cache loop> -> worker or main-thread overload.
Minimal verification: <disable worker/message, transfer buffer, tiny fixture, cancellation experiment>.
Fix direction: add backpressure/cancellation, bound worker caches, transfer ownership, batch messages, or move only proven background-safe work to workers.
```

## Avoid

- Do not assume moving work to a worker fixes CPU; it can hide overload or increase clone cost.
- Do not ignore worker memory when the main JS heap looks stable.
- Do not miss service workers, shared workers, extensions, or GPU rows in Chrome Task Manager.
