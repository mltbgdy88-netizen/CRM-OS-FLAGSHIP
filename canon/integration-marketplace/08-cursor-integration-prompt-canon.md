# CRM OS Cursor Integration Prompt Canon

Use this prompt when generating integration features:

Generate CRM OS integration code for `{integration_name}`.

Rules:
- Use existing API, security, event and tenant canons.
- Do not bypass RBAC, RLS or audit logs.
- Create typed DTOs.
- Create OpenAPI contract updates.
- Create webhook payload schemas if needed.
- Add tests for signature, permission, tenant isolation, retries and failure states.
- Do not add real provider secrets.
- Use mock credentials and documented environment variables only.
