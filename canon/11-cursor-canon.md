# CRM OS Cursor Canon v1

## Cursor Role

Cursor is the production assistant, not the uncontrolled owner of architecture.

## First Cursor Command

```text
Read AGENTS.md.
Read /canon.
Read .cursor/rules.
Read specs/sprints/sprint-01-repository-bootstrap.yaml.

Start Sprint-1 Repository Bootstrap only.

Generate root workspace files and skeleton apps.
Do not implement business modules yet.
Run validation commands.
Return changed files, validation result and next recommended task.
```

## Cursor Rules

- Read canon before code.
- Use sprint specs.
- Implement one small task at a time.
- Do not invent undocumented modules.
- Do not bypass tests.
- Do not use backend calls in UI-only phase.
- Do not hardcode tenant context.
- Do not hardcode secrets.
- Do not create raw SQL without migration review.
- Do not create endpoints without permissions.
