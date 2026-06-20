# CRM OS Public API Canon

## API Standard
Base path: `/api/v1`

## Required Controls
- Bearer authentication
- `X-Tenant-Id` header
- permission scope checks
- rate limits
- audit logging
- requestId propagation
- consistent error format

## Resource Groups
- Customers
- Leads
- Opportunities
- Quotes
- Orders
- Products
- Inventory
- Payments
- Tickets
- Conversations
- Reports
- Webhooks
- API Keys

## Cursor Rule
Cursor must generate API contracts before controllers, controllers before service implementations, and tests before production merge.
