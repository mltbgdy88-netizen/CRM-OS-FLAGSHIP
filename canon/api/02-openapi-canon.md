# CRM OS OpenAPI Canon v1

## 1. OpenAPI Standard

CRM OS API contract OpenAPI 3.1.0 formatında tutulur.

```yaml
openapi: 3.1.0
info:
  title: CRM OS API
  version: 1.0.0
  description: Multi-tenant SaaS CRM OS API
servers:
  - url: https://api.crm-os.com/api/v1
security:
  - bearerAuth: []
```

## 2. Required Tags

```txt
Auth
Tenants
Users
Roles
Permissions
Customers
Contacts
Leads
Pipelines
Opportunities
Quotes
Orders
Products
Inventory
Tasks
Activities
Notifications
Inbox
Tickets
Workflows
Approvals
AI
Reports
Audit
Files
Webhooks
Public API
```

## 3. Shared Components

Zorunlu shared schemas:

```txt
ApiResponse
ErrorResponse
PaginationMeta
AuditMeta
PermissionDeniedError
ValidationError
TenantContext
```

## 4. Security Schemes

```yaml
bearerAuth:
  type: http
  scheme: bearer
  bearerFormat: JWT
```

## 5. Tenant Header

```yaml
TenantId:
  name: X-Tenant-Id
  in: header
  required: true
  schema:
    type: string
    format: uuid
```

## 6. Schema Naming

```txt
Customer
CreateCustomerRequest
UpdateCustomerRequest
CustomerListResponse
CustomerDetailResponse
Lead
LeadConvertRequest
QuoteSendRequest
ApprovalDecisionRequest
```

## 7. OperationId Rule

```txt
module.action
```

Examples:

```txt
customers.list
customers.create
customers.get
customers.update
customers.delete
leads.convert
quotes.send
quotes.approve
orders.reserveStock
```

## 8. Required Endpoint Coverage Per Module

Her modül minimum:

```txt
list
create
get
update
delete/soft-delete
```

Critical business action varsa ayrıca:

```txt
approve
reject
convert
send
assign
reserve
release
export
import
```

## 9. OpenAPI Quality Gate

```txt
[ ] Every endpoint has operationId.
[ ] Every endpoint has tags.
[ ] Every endpoint declares auth requirement.
[ ] Every tenant endpoint requires X-Tenant-Id.
[ ] Every request body uses typed schema.
[ ] Every response uses ApiResponse or list response.
[ ] Every error response references ErrorResponse.
[ ] Permission requirement documented in description or extension.
```

## 10. x-crm-os Extensions

CRM OS özel alanları:

```yaml
x-crm-os:
  permission: customer.read
  audit: true
  emits:
    - CustomerCreated
  tenantScoped: true
```

Cursor bu alanları okuyarak backend guard, audit ve event üretmelidir.
