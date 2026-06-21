# Sprint-03 Customer Permission Registry

Registered in `@crm-os/permissions` and seeded via `SEED_CUSTOMER_PERMISSIONS`.

| Permission | Description | Sprint-03 HTTP |
|------------|-------------|----------------|
| `customer.read` | View customer list and detail | GET `/api/v1/customers`, GET `/api/v1/customers/{id}` |
| `customer.create` | Create customer | POST `/api/v1/customers` |
| `customer.update` | Update customer core fields | PATCH `/api/v1/customers/{id}` |
| `customer.delete` | Registered for future use | **No DELETE endpoint** |

Guard stack (unchanged from Sprint-02): `JwtAuthGuard` → `PermissionGuard` → `401` / `403` semantics preserved.

Default admin role receives all four permissions in CRM seed; member role receives read-only unless customized.
