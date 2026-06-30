# Sprint-04 Customer 360 Permissions

Integration: `agent/sprint-04-customer-360` @ `4bd8e8a`

## Registry (`@crm-os/permissions`)

| Constant | Slug | Sprint-04 usage |
|----------|------|-----------------|
| `CUSTOMER_READ` | `customer.read` | `GET /customers/{id}/360` |
| `CUSTOMER_TIMELINE_READ` | `customer.timeline.read` | `GET /customers/{id}/timeline` |
| `CUSTOMER_EXPORT` | `customer.export` | Seeded on admin role; **no API route** |

Sprint-03 permissions (`customer.create`, `customer.update`, `customer.delete`) unchanged. `customer.delete` remains unused.

## Controller mapping

```text
Customer360Controller
  GET :id/360      → @RequirePermissions(CUSTOMER_READ)
  GET :id/timeline → @RequirePermissions(CUSTOMER_TIMELINE_READ)
```

`CustomersController` (Sprint-03) is not modified.

## Seed

`packages/database/src/seed/crm-360.ts` grants `customer.timeline.read` and `customer.export` to the default admin role alongside existing CRM permissions.
