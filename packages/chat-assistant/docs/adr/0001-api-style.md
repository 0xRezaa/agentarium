---
status: proposed
date: 2026-06-03
---

# Use an OpenAPI-First Hybrid HTTP API

## Context and Problem Statement

The chat assistant server will be public-facing for the web app and may later be used by other HTTP clients.

The API needs to support state reads, such as loading conversations, and workflow actions, such as sending messages, branching conversations, regenerating answers, and streaming assistant output.

## Decision Drivers

- Keep the public API understandable for non-TypeScript HTTP clients.
- Keep schemas, docs, and generated client types aligned.
- Avoid awkward pure REST modeling for chat workflow actions.
- Use a streaming model that is simple to document, deploy, and operate.

## Considered Options

- OpenAPI-first hybrid HTTP API
- Pure REST API
- TypeScript-first RPC API

## Decision Outcome

Chosen option: "OpenAPI-first hybrid HTTP API", because it keeps the API mature as a public HTTP contract while allowing workflow actions to be named directly.

Use resource-style endpoints for reads, command-style endpoints for workflow mutations, SSE for assistant response streaming, and `/api/v1` as the versioned public API namespace.

Command-style endpoints should be modeled as resource-bound custom methods using a colon suffix:

```txt
<HTTP_METHOD> /api/v1/<RESOURCE_INSTANCE_PATH>:<RESOURCE_COMMAND>

<RESOURCE_INSTANCE_PATH> = <RESOURCE_INSTANCE><NESTED_RESOURCE_INSTANCE>*
<RESOURCE_INSTANCE> = <RESOURCE>/{<RESOURCE_ID>}
<NESTED_RESOURCE_INSTANCE> = /<RESOURCE>/{<RESOURCE_ID>}
```

The command applies to the resource instance path before the colon. The resource instance path must contain at least one identified resource and may contain nested resource instances. `*` means zero or more repetitions.

### Consequences

- Good, because OpenAPI remains the source of truth for schemas, docs, and generated client types.
- Good, because reads can stay predictable while chat workflows can be modeled as explicit commands.
- Good, because resource-bound custom methods make the target resource and workflow action explicit.
- Good, because SSE fits assistant generation over ordinary HTTP.
- Bad, because the API will use two endpoint styles instead of one uniform REST or RPC convention.

### Confirmation

Future public endpoints should be reviewed against this ADR before being added.

## Pros and Cons of the Options

### OpenAPI-First Hybrid HTTP API

- Good, because it supports public HTTP clients and generated web client types.
- Good, because it keeps chat workflow actions explicit.
- Good, because colon-suffixed custom methods avoid representing actions as subresources.
- Bad, because it requires clear naming conventions for both resources and commands.

### Pure REST API

- Good, because it is familiar for resource reads and standard CRUD.
- Bad, because chat workflows such as branching and regenerating can become awkward resource modeling exercises.

### TypeScript-First RPC API

- Good, because it can be very ergonomic for the local web client.
- Bad, because it is less mature as a public HTTP contract for non-TypeScript clients.

## More Information

SSE is the default streaming choice because assistant generation is mostly server-to-client output over a single request. WebSockets can be added later if the product needs bidirectional realtime features.
