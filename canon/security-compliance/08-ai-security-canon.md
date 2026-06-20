# AI Security Canon v1

## Principle

AI is an auditable assistant layer. It is not an invisible autonomous actor.

## Rules

- AI must respect tenant scope.
- AI must respect RBAC and permissions.
- AI must show source context where relevant.
- AI must never silently create, update, approve, delete, assign, send, export, or message.
- AI-generated values must be visibly labeled.
- User approval is required before applying AI suggestions.
- AI-applied actions must appear in timeline/audit logs.
- AI usage must be logged for quota, cost, and audit.

## AI Safety States

```text
idle
generating
suggestion_ready
approval_required
approved
edited
rejected
failed
permission_restricted
insufficient_context
audit_required
```
