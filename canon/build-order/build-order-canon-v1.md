# CRM OS Build Order Canon Layer v1

## Status

BUILD_ORDER_CANON_LAYER_ADDED

## Purpose

This layer defines the single authoritative build sequence for CRM OS.

Cursor, agents, reviewers, QA, and humans must follow this order unless an explicit architecture decision overrides it.

## Non-Negotiable Rule

Do not ask Cursor to build the whole CRM OS at once.

Always build in this loop:

```text
Spec
→ Small Task
→ Source Code
→ Tests
→ Review
→ Fix
→ Commit
→ Next Task
```

## Source of Truth Priority

```text
1. /canon
2. /MASTER-SOURCE-OF-TRUTH-v8.md
3. /docs
4. /specs
5. /.cursor/rules
6. /.ai/agents
7. generated code
```

## Phase 0 — Workspace Readiness

Goal: make Cursor understand the product before code generation.

Required files:

```text
AGENTS.md
README.md
/canon
/.cursor/rules
/.ai/agents
/specs/quality-gates
/specs/release-gates
/specs/security-gates
```

Acceptance:

```text
Cursor reads AGENTS.md.
Cursor reads /canon.
Cursor only starts Sprint-1.
Cursor does not implement business modules yet.
```

## Phase 1 — Repository Bootstrap

Sprint:

```text
Sprint-01 Repository Bootstrap / Foundation
```

Build outputs:

```text
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
.env.example
.gitignore
apps/api
apps/web
apps/worker
apps/scheduler
packages/shared
packages/database
packages/ui
infra/docker
.github/workflows
```

Quality gates:

```text
pnpm install
pnpm lint
pnpm typecheck
pnpm test
docker compose config
```

## Phase 2 — Core Platform

Sprint:

```text
Sprint-02 Auth + Tenant + IAM
```

Build outputs:

```text
Tenant model
User model
Role model
Permission model
Session model
Tenant context middleware
JWT auth skeleton
Refresh token skeleton
PermissionGuard
RLS proof of concept
Audit log base
```

Quality gates:

```text
tenant isolation test
permission guard test
auth flow test
migration check
```

## Phase 3 — CRM Core

Sprints:

```text
Sprint-03 Customer Core
Sprint-04 Customer 360
```

Build outputs:

```text
Customer CRUD
Contact CRUD
Address CRUD
Customer notes
Customer tags
Customer files metadata
Customer timeline
Customer list UI
Customer detail UI
Customer 360 UI
```

Quality gates:

```text
customer API tests
RLS tests
permission tests
frontend state tests
empty/loading/error UI states
```

## Phase 4 — Lead and Pipeline Core

Sprints:

```text
Sprint-05 Lead
Sprint-06 Lead Conversion + Pipeline
Sprint-07 Opportunity Management
Sprint-08 Visual Pipeline
```

Build outputs:

```text
Lead CRUD
Lead source
Lead scoring placeholder
Lead assignment
Lead conversion
Pipeline CRUD
Stage CRUD
Opportunity CRUD
Opportunity stage history
Kanban pipeline UI
```

Quality gates:

```text
lead conversion test
opportunity stage transition test
pipeline permission test
audit event test
```

## Phase 5 — Quote Core

Sprints:

```text
Sprint-09 Quote Core
Sprint-10 Quote PDF + Approval
```

Build outputs:

```text
Quote CRUD
Quote items
Discounts
Tax
Quote approval
Quote PDF generation
Quote send status
Quote builder UI
```

Quality gates:

```text
quote totals test
discount approval test
PDF generation test
quote permission test
```

## Phase 6 — Task, Activity, Dashboard

Sprints:

```text
Sprint-11 Task & Activity
Sprint-12 Dashboard & Notification
```

Build outputs:

```text
Tasks
Activities
Reminders
Notifications
Dashboard metrics
Basic analytics cards
```

Quality gates:

```text
task assignment test
notification dispatch test
dashboard query test
```

## Phase 7 — Order and Inventory

Sprints:

```text
Sprint-13 Order Core
Sprint-14 Order Operations
Sprint-15 Product Catalog
Sprint-16 Inventory Core
Sprint-17 Stock Reservation
```

Build outputs:

```text
Order CRUD
Order items
Order status history
Product catalog
Product variants
Warehouses
Stocks
Stock movements
Stock reservations
```

Quality gates:

```text
quote-to-order test
stock reservation test
order status transition test
inventory RLS test
```

## Phase 8 — Finance Lite

Sprints:

```text
Sprint-18 Finance Lite Core
Sprint-19 Payments & Receivables
```

Build outputs:

```text
Accounts
Account transactions
Payments
Installments
Receivables
Credit limits
```

Quality gates:

```text
balance update test
payment allocation test
finance permission test
```

## Phase 9 — Workflow and Portal

Sprint:

```text
Sprint-20 Workflow + Customer Portal
```

Build outputs:

```text
Workflow models
Workflow trigger skeleton
Approval requests
Customer portal shell
Portal quote/order visibility
```

Quality gates:

```text
workflow run test
approval flow test
portal tenant isolation test
```

## Phase 10 — Communication and Support

Sprints:

```text
Sprint-21 Communication Core
Sprint-22 Inbox Operations
Sprint-23 Ticket Core
Sprint-24 SLA & Support Management
```

Build outputs:

```text
Channels
Channel accounts
Conversations
Messages
Inbox UI
Tickets
SLA rules
Knowledge base base
```

Quality gates:

```text
message permission test
ticket SLA test
conversation assignment test
```

## Phase 11 — Dealer and Procurement

Sprints:

```text
Sprint-25 Dealer Portal Core
Sprint-26 Dealer Orders
Sprint-27 Approval Engine
Sprint-28 Procurement Core
```

Build outputs:

```text
Dealer portal
Dealer order flow
Approval engine
Supplier
Purchase request
Purchase order
```

Quality gates:

```text
dealer scope test
approval policy test
purchase order test
```

## Phase 12 — API and Webhook Platform

Sprints:

```text
Sprint-29 Public API
Sprint-30 Webhook Platform
```

Build outputs:

```text
API keys
OAuth clients skeleton
Public API
Webhook subscriptions
Webhook events
Webhook logs
Webhook signature verification
```

Quality gates:

```text
rate limit test
API scope test
webhook signature test
```

## Phase 13 — Enterprise Security

Sprints:

```text
Sprint-31 Enterprise Security
Sprint-32 Enterprise Hardening
```

Build outputs:

```text
2FA
SSO/SAML placeholders
IP allowlist
Audit hardening
Security headers
Rate limits
File upload security
Backup/DR runbooks
```

Quality gates:

```text
security scan
secret scan
permission matrix test
audit completeness test
```

## Phase 14 — AI Platform

Sprints:

```text
Sprint-33 AI Gateway
Sprint-34 Ask CRM
Sprint-35 Summaries & Recommendations
Sprint-36 Prediction
```

Build outputs:

```text
AI Gateway
Provider adapter
Prompt registry
AI usage logs
Ask CRM interface
Summaries
Recommendations
Prediction placeholder
pgvector base
```

Quality gates:

```text
AI permission test
AI audit test
AI no-auto-mutation test
usage quota test
```

## Phase 15 — Analytics and Data Quality

Sprints:

```text
Sprint-37 Analytics Core
Sprint-38 Dashboard Builder
Sprint-39 Report Builder
Sprint-40 Data Quality
```

Build outputs:

```text
Analytics metrics
Dashboard builder
Report builder
Data quality rules
Duplicate detection
Import/export quality checks
```

Quality gates:

```text
analytics query test
report permission test
export permission test
data quality rule test
```

## Cursor Task Pattern

Every Cursor task must include:

```text
Read:
- AGENTS.md
- /canon
- relevant sprint spec
- relevant module spec
- .cursor/rules

Generate:
- code
- migration if needed
- tests
- docs update
- Storybook if UI component
- OpenAPI update if API

Do not:
- implement unrelated module
- skip tenant isolation
- skip permission checks
- skip tests
- create hidden backend assumptions
```

## Commit Pattern

```text
feat(sprint-01): bootstrap monorepo
feat(sprint-02): add tenant iam foundation
feat(sprint-03): add customer core
```

## Branch Pattern

```text
agent/sprint-01-repository-bootstrap
agent/sprint-02-auth-tenant-iam
agent/sprint-03-customer-core
```

## Stop Conditions

Cursor must stop and ask for review if:

```text
migration is destructive
permission model is unclear
tenant isolation cannot be proven
API contract conflicts with canon
test fails repeatedly
dependency requires product decision
```

## Final Definition of Production-Ready Sprint

```text
[ ] Code generated
[ ] Migration generated
[ ] Tests generated
[ ] Tenant isolation enforced
[ ] PermissionGuard applied
[ ] RLS policy present
[ ] Audit event present where needed
[ ] Domain events emitted where needed
[ ] OpenAPI updated
[ ] UI states implemented
[ ] CI passes
[ ] Review agent passes
```
