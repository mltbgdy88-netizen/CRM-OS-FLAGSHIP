# CRM OS Build Order Canon v1

## Absolute Build Rule

Do not ask Cursor to build the entire CRM OS at once.

Use:

```text
Spec → Small task → Cursor output → Validation → Review → Commit → Next task
```

## Build Sequence

1. Repository Bootstrap
2. Docker Compose
3. Base NestJS API
4. Base Next.js Web
5. Shared packages
6. Database migration system
7. Tenant context
8. Auth skeleton
9. IAM
10. RLS proof
11. Customer Core
12. Lead Core
13. Pipeline
14. Opportunity
15. Quote
16. Dashboard
17. Order
18. Inventory
19. Finance Lite
20. Workflow
21. Communication
22. Support
23. AI
24. Analytics
25. Hardening

## First Production Task

```text
Sprint-1 Repository Bootstrap only.
```

## Commit Discipline

- One task per branch.
- One module per PR.
- Tests before merge.
- Security review before production.
