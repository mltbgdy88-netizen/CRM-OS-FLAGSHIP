# CRM OS AI Canon v1

## AI Principle

AI is an auditable assistant layer. It must not silently mutate CRM records.

## AI Modules

- AI Gateway
- Ask CRM
- Summaries
- Recommendations
- Predictions
- Lead Scoring
- Opportunity Risk
- Quote Assistant
- Inbox Reply Suggestion
- Ticket Triage
- Dashboard Interpretation
- Data Quality Suggestions

## AI Safety Rules

- AI must never submit forms automatically.
- AI must never approve quotes/orders automatically.
- AI must never send messages without user approval.
- AI must show source context where relevant.
- AI output must be labeled.
- AI actions must respect tenant, RBAC, plan and feature flags.
- AI-applied actions must be visible in timeline/audit flows.

## AI States

- Idle
- Generating
- SuggestionReady
- ApprovalRequired
- Approved
- Edited
- Rejected
- Failed
- PermissionRestricted
- InsufficientContext
- AuditRequired
