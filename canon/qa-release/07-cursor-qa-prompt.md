# Cursor QA Prompt Canon

Use this prompt after every generated task:

```text
Review the generated CRM OS changes.

Check:
- lint/typecheck readiness
- reusable architecture
- no unrelated file changes
- tenant isolation
- RLS requirements
- PermissionGuard usage
- audit logging
- domain events
- OpenAPI alignment
- migration safety
- loading/empty/error UI states
- Storybook coverage if UI changed
- tests for happy and failure paths
- no secrets
- no placeholder content

Return:
1. Issues found
2. Files to fix
3. Risk level
4. Required fixes before merge
5. Final PASS/FAIL
```
