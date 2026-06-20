# CRM OS AI Gateway Canon

## Goal

AI Gateway is the only approved entry point for LLM calls.

## Responsibilities

- Provider abstraction
- Prompt versioning
- Tool permission validation
- Tenant and user context injection
- Usage metering
- Cost tracking
- Request logging
- Safety checks
- Retry and timeout handling
- Response normalization

## Forbidden

- Direct LLM calls from domain modules
- Direct LLM calls from frontend
- AI actions without tenant context
- AI actions without permission check
- Unlogged AI mutations
- Prompt strings scattered across code

## Provider Adapter Pattern

```text
AI Gateway
├── OpenAI Adapter
├── Anthropic Adapter
├── Local Model Adapter
├── Embedding Adapter
└── Mock Adapter for tests
```

## Required Context

Every AI request must include:

```text
tenantId
userId
module
actionType
permissionScope
sourceRecords
requestId
```
