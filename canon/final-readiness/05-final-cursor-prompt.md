# CRM OS Final Cursor Prompt

Use this prompt when opening the workspace in Cursor.

```text
You are building CRM OS, an enterprise multi-tenant SaaS Customer Operating System.

Before writing code, read:
- README.md
- AGENTS.md
- /canon
- .cursor/rules
- specs/sprints
- specs/quality-gates
- FINAL-MANIFEST.md
- VERIFICATION-REPORT.md

Rules:
- Canon wins over docs if there is conflict.
- Generate only Sprint-01 Repository Bootstrap first.
- Do not implement business modules yet.
- Do not invent architecture.
- Do not skip tests.
- Do not create real secrets.
- Use TypeScript.
- Use Next.js App Router for web.
- Use NestJS for API.
- Use PostgreSQL with tenant_id and RLS standards.
- Use Docker baseline.
- Prepare CI skeleton.
- Keep generated code small, reviewable, and commit-ready.

Return:
1. Understanding summary
2. Sprint-01 task breakdown
3. Files to create
4. Verification commands
5. Stop condition
```
