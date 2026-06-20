# CRM OS Canonical Specification Layer v1

This folder is the highest-level source of truth for CRM OS.

## Source of Truth Order

1. `/canon`
2. `MASTER-SOURCE-OF-TRUTH-v8.md`
3. `docs/database`, `docs/api`, `docs/security`, `docs/ux`
4. `specs/sprints`
5. `.cursor/rules`
6. `.ai/agents`
7. Generated source code

If a conflict exists, `/canon` wins.

## Purpose

The goal of the canonical layer is to end documentation sprawl and give Cursor, agents, developers, QA and security reviewers one stable decision layer.


## Added in v11 — Master API Canon Layer

New canonical directory:

```txt
/canon/api
```

Files:
- 01-rest-api-canon.md
- 02-openapi-canon.md
- 03-webhook-canon.md
- 04-public-api-canon.md
- 05-error-response-canon.md
- 06-api-security-canon.md

Rule:
API-related contradictions are resolved by `/canon/api`.
