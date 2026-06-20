# CRM OS Cursor Agent Workflow Canon v1

## Cursor Task Size

Cursor tasks must be small.

Allowed task examples:

```text
Create Sprint-1 monorepo package files.
Create TenantContext middleware only.
Create customers table migration only.
Create CustomerController CRUD only.
Create CustomerList UI shell only.
```

Forbidden task examples:

```text
Build full CRM.
Implement all Sprint-1 to Sprint-40.
Create backend, frontend, database and CI at once.
```

## Branch Pattern

```text
agent/sprint-XX-module-task
```

Examples:

```text
agent/sprint-01-monorepo-bootstrap
agent/sprint-02-tenant-context
agent/sprint-03-customer-crud-api
```

## Commit Pattern

```text
type(scope): short description
```

Examples:

```text
feat(core): add monorepo bootstrap
feat(iam): add tenant context middleware
test(crm): add customer isolation tests
```

## Cursor Command Template

```text
Read AGENTS.md.
Read .cursor/rules.
Read canon.
Read specs/sprints/{sprint}.yaml.
Read docs/sprints/{sprint}.md.

Task:
{small task}

Constraints:
- only modify files required for this task
- do not implement next sprint
- update tests and docs
- run quality gates
```

## Production Line

```text
Plan
↓
Generate
↓
Test
↓
Review
↓
Fix
↓
Commit
↓
Next task
```
