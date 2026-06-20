# CRM OS Ask CRM Canon

## Purpose

Ask CRM allows users to query business data in natural language.

## Scope

Ask CRM can answer questions such as:

- Which opportunities are at risk?
- Which customers have no activity?
- Which quotes are expiring this week?
- Which tickets may breach SLA?
- Which products are low stock?
- What caused revenue drop this month?

## Rules

- Ask CRM must respect permissions.
- Restricted records must not appear in answer or source list.
- Answers must cite source records when possible.
- Queries that imply mutations must turn into reviewable actions.
- Export-like outputs must require export permission.
- Financial answers must respect finance permissions.

## Query Flow

```text
User question
→ intent classification
→ permission validation
→ data retrieval
→ answer generation
→ source list
→ optional suggested actions
```
