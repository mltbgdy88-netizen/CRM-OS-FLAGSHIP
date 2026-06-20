# CRM OS Acceptance Canon

## Feature Acceptance

A feature is accepted only if:

- business scenario passes
- permission behavior is correct
- tenant isolation is correct
- audit log is generated for critical actions
- events are emitted where required
- UI loading, empty, error, and permission states exist
- tests cover happy path and failure path

## MVP Acceptance Journey

1. Tenant is created.
2. Admin logs in.
3. User and role are created.
4. Customer is created.
5. Lead is created.
6. Lead converts to opportunity.
7. Opportunity moves in pipeline.
8. Quote is created.
9. Quote PDF is generated.
10. Quote is sent or marked sent.
11. Dashboard shows lead, opportunity, and quote metrics.
12. Audit log records critical actions.
13. Tenant A cannot see Tenant B data.

## AI Acceptance

- AI output is labeled.
- AI source/context is visible where relevant.
- AI does not mutate data silently.
- Apply/edit/reject flow exists.
- AI actions are auditable.
