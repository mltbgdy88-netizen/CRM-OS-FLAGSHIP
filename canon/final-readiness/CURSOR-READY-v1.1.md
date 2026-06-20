# Final Cursor Readiness v1.1

## Status

```text
CURSOR_READY_FOR_SPRINT_01_PLANNING_AND_BOOTSTRAP
```

## Fixed From v1

```text
1. Promoted CRM-OS-Master-Workspace-v24 content to workspace root.
2. Removed conflicting parent root stub folders from active root.
3. Moved conversation extraction archive under _archive/.
4. Narrowed Sprint-01 to repository bootstrap only.
5. Chose Redis + BullMQ as initial queue decision; RabbitMQ deferred.
6. Added Prisma + RLS tenant-context hardening rule.
7. Added .github/workflows/ci.yml target.
8. Added Cursor Sprint-01 hard guard.
```

## Cursor Opening Instruction

Open this folder directly as the workspace root.

## First Cursor Prompt

```text
Do not write code yet.

Read:
- README.md
- AGENTS.md
- MASTER-SOURCE-OF-TRUTH-v9.md
- /canon/final-readiness
- /canon/build-order
- /canon/00-canonical-index.md
- .cursor/rules
- docs/sprints/sprint-01.md
- specs/sprints/sprint-01-repository-bootstrap.yaml

Return:
1. canonical source order
2. exact Sprint-01 scope
3. files you will create/change
4. commands you will run
5. what you will explicitly not implement

Stop after the plan.
```
