# CRM OS Cursor Product & SaaS Prompt Canon

Use this prompt when asking Cursor to implement SaaS product/business features.

```text
You are implementing CRM OS Product & SaaS Business features.

Follow:
/canon/product-saas
/canon/security-compliance
/canon/database
/canon/api
/canon/build-order

Rules:
- Do not create billing or quota logic without tenant isolation.
- Do not hardcode plan rules inside UI components.
- Use feature flags for paid modules.
- Use usage quota abstractions for AI, API, storage, messages, users, branches, dealers, and integrations.
- Do not delete tenant data during downgrade.
- Add audit logs for platform admin actions.
- Add tests for plan restrictions, quota checks, and permission boundaries.
- Keep MVP scope frozen unless explicitly instructed.
```
