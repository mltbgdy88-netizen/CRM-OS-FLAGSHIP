# Tenant vs Workspace Naming Canon

Source Status: CANON_FIXED_FOR_CURSOR_READY_v1.1

## Decision

```text
Database isolation key: tenant_id
Product/UI language: workspace
Mapping: workspace represents the customer business account; tenant_id is the isolation key.
```

## Cursor Rule

Cursor must not create parallel inconsistent concepts such as both unrelated `tenants` and unrelated `workspaces`.

If both names appear:

```text
workspace = product-facing tenant
tenant_id = database isolation column
```

## Sprint Boundary

Sprint-01 does not implement tenant/workspace business tables.

Sprint-02 implements the canonical tenant/workspace foundation.
