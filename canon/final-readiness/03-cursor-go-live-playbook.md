# CRM OS Cursor Go-Live Playbook

## Step 1: Open Workspace

Open the latest CRM OS Master Workspace ZIP in Cursor.

## Step 2: Read Canon

First instruction to Cursor:

```text
Read AGENTS.md, README.md, /canon, .cursor/rules, specs/sprints, and specs/quality-gates.
Do not generate code yet.
Return the understood build order and Sprint-01 task plan.
```

## Step 3: Sprint-01 Only

Second instruction:

```text
Generate Sprint-01 Repository Bootstrap only.
Do not implement Sprint-02.
Do not create business modules yet.
Create root tooling, workspace config, apps/api, apps/web, packages, Docker baseline, and CI skeleton.
```

## Step 4: Verify

Run:

```text
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose config
```

## Step 5: Commit

Commit only if the gates pass.

Branch pattern:

```text
feat/sprint-01-bootstrap
```

Commit pattern:

```text
feat(sprint-01): bootstrap monorepo foundation
```

## Step 6: Stop

Do not continue to Sprint-02 until Sprint-01 is reviewed.

## Required Cursor Behavior

Cursor must work as an engineering assistant, not as an uncontrolled autonomous builder.

The production workflow is:

```text
Canon
→ Sprint Spec
→ Small Task
→ Code
→ Test
→ Review
→ Fix
→ Commit
```
