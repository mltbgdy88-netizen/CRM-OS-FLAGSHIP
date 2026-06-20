# Cursor Security Prompt Canon v1

Use this prompt before security-sensitive implementation tasks.

```text
You are implementing CRM OS security-sensitive code.

Read:
- /canon/security-compliance
- /canon/database
- /canon/api
- .cursor/rules/04-security.md
- .cursor/rules/05-permissions.md

Rules:
- Do not bypass tenant isolation.
- Do not create protected endpoints without PermissionGuard.
- Do not create tenant-owned tables without tenant_id and RLS.
- Add audit log for critical actions.
- Add tests for tenant isolation and permission denial.
- Do not expose secrets.
- Do not introduce real credentials.
- Do not weaken existing security rules.

Return:
1. Files changed
2. Security controls added
3. Tests added
4. Remaining risks
```
