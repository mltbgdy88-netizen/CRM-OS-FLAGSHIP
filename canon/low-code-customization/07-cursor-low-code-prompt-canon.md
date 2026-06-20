# CRM OS Cursor Low-Code Prompt Canon

Use this prompt when implementing low-code features:

Create CRM OS low-code customization components and backend contracts.

Rules:
- Do not allow arbitrary code execution.
- Do not allow raw SQL execution.
- Use tenant-scoped metadata.
- Enforce RBAC and audit logging.
- Build custom fields, custom forms, custom views, and custom modules as controlled metadata.
- Include tests for tenant isolation, permission restrictions, validation, and audit trail.
- Do not bypass core domain modules.
