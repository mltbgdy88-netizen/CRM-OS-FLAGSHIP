# CRM OS Cursor AI & Data Prompt Canon

## Cursor Prompt

Generate CRM OS AI & Data Intelligence components and backend scaffolding.

Rules:

- Do not call real LLM providers in initial scaffold.
- Create AI Gateway interfaces and mock adapters first.
- Add tenant/user/request context to every AI request.
- Enforce permission validation before AI tools.
- Store AI usage logs.
- Add typed DTOs and domain events.
- AI actions must require review before mutation.
- Add tests for permission denial, tenant isolation, and usage metering.
- Do not leak restricted records in Ask CRM responses.

Required modules:

```text
apps/api/src/modules/ai
apps/api/src/modules/analytics
apps/api/src/modules/data-quality
packages/ai
packages/analytics
packages/data-quality
```
