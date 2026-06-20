# CRM OS Agent Orchestration Canon v1

## Purpose

CRM OS will be produced through a controlled multi-agent workflow, not by a single uncontrolled autonomous generation pass.

The agent system exists to:

- keep architecture consistent,
- prevent cross-tenant security regressions,
- preserve sprint scope,
- enforce quality gates,
- reduce Cursor hallucination,
- make each generated change reviewable.

## Canonical Agent Order

```text
Architect Agent
↓
Spec Agent
↓
Backend Agent
↓
Database Agent
↓
Frontend Agent
↓
UI Agent
↓
QA Agent
↓
Security Agent
↓
Review Agent
↓
Release Agent
```

## Non-Negotiable Rule

No agent may generate production code without reading:

```text
AGENTS.md
.cursor/rules/*
canon/*
specs/sprints/current-sprint.yaml
docs/sprints/current-sprint.md
```

## Sprint Agent Flow

For every sprint:

```text
1. Architect Agent reads sprint scope.
2. Spec Agent confirms entities, API, permissions, events and tests.
3. Database Agent creates migrations/RLS/indexes.
4. Backend Agent creates NestJS modules/controllers/services.
5. Frontend/UI Agent creates Next.js screens/components.
6. QA Agent creates tests and acceptance checks.
7. Security Agent validates tenant/RBAC/audit/secrets.
8. Review Agent checks diffs and anti-patterns.
9. Release Agent confirms CI readiness.
```

## Stop Conditions

The production line must stop if any of these occur:

- unclear sprint scope,
- missing tenant isolation,
- missing RLS on tenant-owned table,
- endpoint without permission guard,
- migration without rollback/safety note,
- domain event not emitted for critical action,
- audit log missing for critical action,
- tests absent,
- secret detected,
- Cursor modifies unrelated modules.

## Output Contract

Every agent handoff must include:

```text
Task:
Files created:
Files modified:
Components/modules created:
Tests created:
Permissions added:
Events added:
Known gaps:
Quality gate result:
Next recommended task:
```
