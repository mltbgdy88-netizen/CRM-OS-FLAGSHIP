# CRM OS Migration Canon v1

## Migration Order

```text
001_core
002_iam
003_crm
004_lead
005_sales
006_quote
007_task_activity
008_notification
009_product_catalog
010_inventory
011_order
012_finance
013_workflow
014_communication
015_support
016_ai
017_reporting
018_integration
019_security_hardening
020_data_quality
```

## Migration Rules

```text
- One migration must belong to one bounded context unless explicitly approved.
- Every tenant-owned table must include tenant_id.
- RLS must be enabled in the same sprint as table creation.
- Indexes must be created with the table when usage is known.
- Destructive migrations require backup and rollback notes.
- Seeds must be deterministic.
- Production migrations must be backward-compatible where possible.
```

## Migration Review Checklist

```text
[ ] Tables have global fields.
[ ] tenant_id exists where required.
[ ] FK relationships are correct.
[ ] RLS policy exists.
[ ] Indexes exist.
[ ] Soft delete exists where required.
[ ] Audit-sensitive fields are identified.
[ ] Migration rollback plan exists.
[ ] Tenant isolation tests exist.
```
