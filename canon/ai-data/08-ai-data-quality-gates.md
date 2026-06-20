# CRM OS AI & Data Quality Gates

## AI Gateway Gate

- [ ] All AI calls go through gateway.
- [ ] Provider adapters are isolated.
- [ ] Mock adapter exists for tests.
- [ ] Tenant/user context is mandatory.
- [ ] Usage logging exists.

## Security Gate

- [ ] AI tools check permissions.
- [ ] AI cannot bypass RLS.
- [ ] Restricted records are excluded.
- [ ] AI mutations require approval.
- [ ] AI outputs are audit-ready.

## Data Quality Gate

- [ ] Duplicate detection is represented.
- [ ] Merge requires human approval.
- [ ] Import validation exists.
- [ ] Data quality issues are trackable.

## Analytics Gate

- [ ] AI insights are source-grounded.
- [ ] KPI explanations include source context.
- [ ] Export respects permissions.
