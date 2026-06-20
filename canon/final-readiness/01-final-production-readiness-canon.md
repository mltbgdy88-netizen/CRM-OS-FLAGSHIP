# CRM OS Final Production Readiness Canon

## Purpose

This canon defines the final production readiness standard for CRM OS before Cursor-based source generation and before any production deployment.

CRM OS is considered production-ready only when architecture, database, API, UI, security, DevOps, AI, integration, QA, release, and operations gates are aligned.

## Readiness Principle

No sprint is accepted only because code compiles.

A sprint is accepted only when:

- Source code is generated from approved canon.
- Database changes are migration-safe.
- Tenant isolation is verified.
- Permission checks are enforced.
- API contracts are documented.
- UI states are complete.
- Tests pass.
- Security gates pass.
- Observability is present.
- Rollback is possible.
- Documentation is updated.

## Production Readiness Status Levels

```text
NOT_READY
BOOTSTRAP_READY
SPRINT_READY
MVP_READY
PILOT_READY
PRODUCTION_READY
ENTERPRISE_READY
```

## Current Intended Status

```text
PRODUCTION_READY_FOR_CURSOR_BOOTSTRAP
```

This means the repository is ready to be opened in Cursor and used to generate Sprint-01 in a controlled, gated workflow.

It does not mean the SaaS product is already production deployed.

## Canon Priority

If a conflict exists, apply this order:

1. `/canon/final-readiness`
2. `/canon/build-order`
3. `/canon/security-compliance`
4. `/canon/database`
5. `/canon/api`
6. `/canon/events`
7. `/canon/ui`
8. `/canon/agents`
9. `/docs`
10. generated code

## Final Rule

Cursor must not skip gates to accelerate delivery.
