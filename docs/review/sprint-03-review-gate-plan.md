# Sprint-03 Review Gate Plan

**Integration branch:** `agent/sprint-03-customer-core` @ `db4e9ba`  
**Agent:** Review Team F  
**Date:** 2026-06-21  
**Final approval:** BLOCKED until all gates green

## PR tracker

| PR | Branch | Team | Allowed paths | Scope check | CI |
|----|--------|------|---------------|-------------|-----|
| #8 | `agent/sprint-03-frontend-customer` | A Frontend | `apps/web/**` | Pending merge review | Pending |
| #9 | `agent/sprint-03-docs-customer-contract` | B Docs | `docs/**`, package READMEs | Docs only | Pending |
| #10 | `agent/sprint-03-qa-matrix` | C QA | `docs/qa/**`, `docs/sprints/**` | Planning only | Pending |
| #11 | `agent/sprint-03-security-review` | D Security | `docs/security/**`, `docs/release/**` | Planning only | Pending |
| #12 | `agent/sprint-03-devops-verify` | E DevOps | `.github/**`, `package.json`, `docs/release/**` | Preparatory CI | Pending |
| TBD | `agent/sprint-03-review-gate` | F Review | `docs/review/**`, `docs/release/**` | This document | Pending |
| TBD | `agent/sprint-03-release-prep` | G Release | `docs/release/**`, `docs/sprints/**` | Skeleton only | Pending |

## Path ownership verification

| Team | Forbidden touch | Status |
|------|-----------------|--------|
| All | `packages/database/migrations/002_iam/**` | No PR modifies |
| All | `003_crm/migration.sql` unless bug | No PR modifies |
| All | Sprint-02 auth/guards semantics | No PR modifies IAM routes |
| A | DELETE UI, upload UI, IAM Slice B | Code review on #8 |
| B–G | Application code | Docs/CI only |

## Forbidden scope checklist

| Item | Any PR? |
|------|---------|
| Merge to `main` | **No** |
| Sprint-04 (leads, pipeline, etc.) | **No** |
| RabbitMQ / AI Gateway / workflow | **No** |
| DELETE `/customers` | **No** |
| Related-entity CRUD endpoints/UI | **No** |
| File upload/storage/CDN | **No** |
| Customer analytics (LTV, scores) | **No** |

## Gate sequence (Phase 4)

1. Merge Frontend #8 → integration
2. Merge Docs #9, QA #10, Security #11
3. Merge DevOps #12 after frontend (or confirm preparatory CI green)
4. Execute QA matrix → PASS
5. Security sign-off → PASS with WARN
6. Release acceptance report → PASS (Team G)
7. Review final integration PR to `main` — **not in Sprint-03 swarm scope**

## Review gate verdict

**OPEN** — Do not approve final release until Frontend merged and `sprint:03:verify` CI green on integration.
