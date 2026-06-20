# CRM OS Sprint Canon v1

## Rule

Sprint order is canonical. Cursor must not skip dependencies.

## Sprint-01: Repository Bootstrap

**Purpose:** Monorepo, Docker Compose, base NestJS, base Next.js, tenant context skeleton.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-02: Auth + Tenant + IAM

**Purpose:** Tenant, users, roles, permissions, login, refresh token, audit log, RLS proof.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-03: Customer Core

**Purpose:** Customer, contact, address, notes, tags, files, customer list/detail UI.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-04: Customer 360

**Purpose:** Timeline, related records, customer risk, customer insights, Customer 360 UI.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-05: Lead

**Purpose:** Lead CRUD, sources, scoring, assignment, lead UI.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-06: Lead Conversion + Pipeline

**Purpose:** Lead conversion, opportunity creation, pipeline foundation.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-07: Opportunity Management

**Purpose:** Opportunity CRUD, stage history, activities, win/loss.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-08: Visual Pipeline

**Purpose:** Kanban pipeline, drag/drop ready UI, stage summaries.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-09: Quote Core

**Purpose:** Quote, quote items, discounts, tax, quote status.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-10: Quote PDF + Approval

**Purpose:** PDF generation, approval flow, send/view lifecycle.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-11: Task & Activity

**Purpose:** Tasks, reminders, activities, calendar/list views.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-12: Dashboard & Notification

**Purpose:** Basic dashboard, notification center, alerts.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-13: Order Core

**Purpose:** Order CRUD, order items, quote-to-order.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-14: Order Operations

**Purpose:** Reservations, shipment, delivery, returns.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-15: Product Catalog

**Purpose:** Products, variants, categories, price lists.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-16: Inventory Core

**Purpose:** Warehouses, stocks, stock movements.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-17: Stock Reservation

**Purpose:** Reservations, release, critical stock, order allocation.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-18: Finance Lite Core

**Purpose:** Accounts, balances, transactions, invoices.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-19: Payments & Receivables

**Purpose:** Payments, installments, overdue receivables.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-20: Workflow + Customer Portal

**Purpose:** Workflow v1, portal foundation.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-21: Communication Core

**Purpose:** Channels, conversations, messages.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-22: Inbox Operations

**Purpose:** Omnichannel inbox, assignment, message states.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-23: Ticket Core

**Purpose:** Tickets, categories, priorities, ticket detail.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-24: SLA & Support Management

**Purpose:** SLA rules, escalations, support metrics.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-25: Dealer Portal Core

**Purpose:** Dealer users, dealer catalog, portal access.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-26: Dealer Orders

**Purpose:** Dealer order creation, pricing, balance visibility.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-27: Approval Engine

**Purpose:** Approval requests, steps, actions, delegation.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-28: Procurement Core

**Purpose:** Suppliers, purchase requests, purchase orders.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-29: Public API

**Purpose:** API keys, scopes, developer contract.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-30: Webhook Platform

**Purpose:** Webhooks, event delivery, logs, signatures.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-31: Enterprise Security

**Purpose:** 2FA, SSO-ready, IP restrictions, security logs.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-32: Enterprise Hardening

**Purpose:** Rate limits, DR, backups, observability hardening.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-33: AI Gateway

**Purpose:** LLM provider adapters, usage logs, AI permissions.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-34: Ask CRM

**Purpose:** Natural language CRM question answering.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-35: Summaries & Recommendations

**Purpose:** Customer, opportunity, ticket, inbox summaries.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-36: Prediction

**Purpose:** Lead score, win probability, churn risk.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-37: Analytics Core

**Purpose:** Metrics, dashboards, reporting data foundation.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-38: Dashboard Builder

**Purpose:** Custom dashboards and widgets.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-39: Report Builder

**Purpose:** Custom reports, filters, exports.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.

## Sprint-40: Data Quality

**Purpose:** Deduplication, enrichment, validation, merge workflows.

**Every sprint must include:** entities, migrations, RLS, permissions, events, API, UI if applicable, tests, documentation, quality gates and DoD.
