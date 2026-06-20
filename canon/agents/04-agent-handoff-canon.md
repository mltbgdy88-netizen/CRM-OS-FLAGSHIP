# CRM OS Agent Handoff Canon v1

## Handoff Format

Every agent must produce the following handoff:

```yaml
task:
agent:
sprint:
module:
files_created:
files_modified:
tests_created:
permissions_added:
events_added:
migrations_added:
docs_updated:
quality_gates:
  lint:
  typecheck:
  unit_tests:
  integration_tests:
  security_review:
known_gaps:
next_recommended_task:
merge_blockers:
```

## Merge Blockers

```text
- missing tenant_id
- missing RLS
- missing PermissionGuard
- missing tests
- missing audit log for critical action
- missing domain event for critical action
- failing typecheck
- failing lint
- unrelated file changes
- secret leakage
```

## Review Severity

```text
P0: Security/data isolation blocker
P1: Broken core functionality
P2: Missing tests/docs/edge handling
P3: Style/minor improvement
```
