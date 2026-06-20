# CRM OS Master Database Canon v1

## Status

`CANONICAL_DATABASE_LAYER`

This document is the master database source of truth for CRM OS. If older ERD, migration, sprint, or module documents conflict with this canon, this canon wins.

## Core Decision

CRM OS uses:

```text
Shared PostgreSQL Database
+ tenant_id on every tenant-owned table
+ PostgreSQL Row Level Security
+ modular schema ownership
+ event-driven audit trail
```

The first production architecture is a modular monolith. Database ownership is modular, but deployment starts as one PostgreSQL cluster.

## Global Table Standard

Every tenant-owned business table must include:

```sql
id uuid primary key,
tenant_id uuid not null references tenants(id),
created_at timestamptz not null default now(),
created_by uuid references users(id),
updated_at timestamptz,
updated_by uuid references users(id),
deleted_at timestamptz,
deleted_by uuid references users(id),
version integer not null default 1
```

Rules:

```text
- `tenant_id` is mandatory.
- Soft delete is standard.
- Optimistic locking uses `version`.
- All write actions must preserve actor context.
- Critical changes must also write audit_logs.
```

## RLS Standard

Every tenant-owned table must enable RLS.

```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_<table_name>
ON <table_name>
USING (
  tenant_id = current_setting('app.tenant_id')::uuid
);
```

Backend request context:

```sql
SET app.tenant_id = '<tenant_uuid>';
SET app.user_id = '<user_uuid>';
```

No service may query tenant-owned data before tenant context is set.

## Naming Standard

```text
Tables: snake_case plural
Columns: snake_case
Primary key: id
Foreign key: <entity>_id
Amounts: numeric(18,2)
Quantities: numeric(18,3)
Currency: varchar(3)
Date/time: timestamptz
Date only: date
JSON: jsonb
Status fields: varchar(30) or varchar(40)
```

## Index Standard

Mandatory indexes:

```sql
CREATE INDEX idx_<table>_tenant_id
ON <table>(tenant_id);

CREATE INDEX idx_<table>_tenant_deleted
ON <table>(tenant_id, deleted_at);
```

Status tables:

```sql
CREATE INDEX idx_<table>_tenant_status
ON <table>(tenant_id, status);
```

Owner/assignment tables:

```sql
CREATE INDEX idx_<table>_assigned_user
ON <table>(tenant_id, assigned_user_id);
```

Time-series tables:

```sql
CREATE INDEX idx_<table>_tenant_created_at
ON <table>(tenant_id, created_at DESC);
```

## Partition Candidates

Use partitioning later for large tables:

```text
audit_logs
domain_events
timeline_events
messages
notifications
activity_logs
workflow_logs
ai_usage_logs
api_logs
```

Preferred strategy:

```text
tenant_id hash partition
+
created_at monthly partition
```

## Core Migration Order

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

## Master Domain Tables

### CORE

```text
tenants
tenant_settings
tenant_domains
tenant_modules
tenant_feature_flags
tenant_usage_quotas
plans
plan_features
subscriptions
subscription_items
audit_logs
system_settings
```

### IAM

```text
users
user_profiles
roles
permissions
role_permissions
user_roles
teams
team_members
departments
branches
dealers
sessions
devices
login_history
user_2fa_methods
```

### CRM / Customer 360

```text
customers
customer_contacts
customer_addresses
customer_segments
customer_tags
customer_notes
customer_files
customer_locations
customer_relationships
customer_scores
customer_risk_scores
customer_lifetime_values
customer_preferences
customer_consents
customer_merge_logs
customer_timeline_events
```

### LEAD

```text
leads
lead_sources
lead_tags
lead_scores
lead_assignments
lead_activities
lead_notes
lead_files
lead_conversion_logs
lead_loss_reasons
lead_enrichment_data
```

### SALES

```text
pipelines
pipeline_stages
pipeline_stage_rules
opportunities
opportunity_products
opportunity_contacts
opportunity_activities
opportunity_notes
opportunity_files
opportunity_competitors
opportunity_stage_history
opportunity_loss_reasons
opportunity_forecasts
```

### QUOTE

```text
quotes
quote_versions
quote_items
quote_item_discounts
quote_taxes
quote_approvals
quote_approval_steps
quote_files
quote_view_logs
quote_signatures
quote_status_history
quote_payment_terms
quote_delivery_terms
quote_loss_reasons
```

### ORDER

```text
orders
order_items
order_status_history
order_reservations
order_shipments
order_shipment_items
order_deliveries
order_delivery_confirmations
order_returns
order_return_items
order_payments
order_files
order_notes
```

### PRODUCT / CATALOG

```text
products
product_variants
product_categories
product_brands
product_collections
product_images
product_files
product_attributes
product_attribute_values
product_barcodes
product_supplier_links
product_prices
product_price_lists
product_related_items
product_ai_descriptions
```

### INVENTORY

```text
warehouses
warehouse_locations
warehouse_users
stocks
stock_movements
stock_reservations
stock_counts
stock_count_items
stock_adjustments
stock_transfers
stock_transfer_items
stock_alerts
stock_lots
```

### PROCUREMENT

```text
suppliers
supplier_contacts
supplier_addresses
supplier_price_lists
supplier_products
supplier_performance_scores
purchase_requests
purchase_request_items
purchase_request_approvals
purchase_orders
purchase_order_items
purchase_order_status_history
purchase_receipts
purchase_receipt_items
purchase_files
```

### FINANCE

```text
accounts
account_transactions
account_balances
credit_limits
risk_limits
payments
payment_allocations
payment_methods
payment_receipts
installments
installment_payments
invoices
invoice_items
invoice_taxes
invoice_files
bank_accounts
bank_transactions
bank_reconciliation_logs
```

### TASK / ACTIVITY

```text
tasks
task_assignees
task_comments
task_files
task_checklist_items
task_reminders
task_recurrence_rules
activities
activity_participants
activity_files
activity_comments
```

### COMMUNICATION

```text
channels
channel_accounts
channel_settings
conversations
conversation_participants
conversation_assignments
conversation_tags
conversation_status_history
messages
message_attachments
message_delivery_logs
message_ai_summaries
email_logs
sms_logs
whatsapp_logs
call_logs
meeting_logs
```

### SUPPORT

```text
tickets
ticket_categories
ticket_priorities
ticket_statuses
ticket_messages
ticket_files
ticket_assignments
ticket_sla_logs
ticket_satisfaction_surveys
ticket_root_causes
ticket_resolution_notes
knowledge_base_articles
knowledge_base_categories
knowledge_base_feedback
```

### WORKFLOW / APPROVAL

```text
workflows
workflow_versions
workflow_triggers
workflow_nodes
workflow_edges
workflow_conditions
workflow_actions
workflow_runs
workflow_run_steps
workflow_logs
workflow_errors
approval_requests
approval_steps
approval_actions
approval_delegations
approval_logs
```

### AI PLATFORM

```text
ai_agents
ai_agent_tools
ai_agent_permissions
ai_agent_runs
ai_prompts
ai_prompt_versions
ai_conversations
ai_conversation_messages
ai_documents
ai_document_chunks
ai_embeddings
ai_predictions
ai_summaries
ai_classifications
ai_recommendations
ai_usage_logs
ai_feedback
```

### REPORTING

```text
dashboards
dashboard_widgets
dashboard_filters
dashboard_permissions
reports
report_columns
report_filters
report_schedules
report_exports
metrics
metric_snapshots
kpi_targets
```

### INTEGRATION

```text
api_keys
oauth_clients
oauth_tokens
webhooks
webhook_events
webhook_logs
connectors
connector_accounts
connector_mappings
integration_runs
integration_errors
marketplace_apps
marketplace_app_installs
```

### NOTIFICATION

```text
notifications
notification_recipients
notification_channels
notification_templates
notification_delivery_logs
notification_preferences
notification_rules
```

### LOW-CODE / CUSTOMIZATION

```text
custom_modules
custom_module_fields
custom_module_records
custom_module_record_values
custom_fields
custom_field_options
custom_field_values
custom_views
custom_forms
custom_pages
custom_dashboards
custom_validations
custom_business_rules
```

### COMMON PLATFORM

```text
files
file_versions
file_permissions
comments
mentions
tags
entity_tags
timeline_events
domain_events
search_index
saved_searches
import_jobs
import_job_rows
export_jobs
data_quality_rules
data_quality_issues
merge_requests
merge_logs
```

## Polymorphic Entity Link Standard

Allowed where cross-domain linking is required:

```text
entity_type varchar(50)
entity_id uuid
```

Used by:

```text
files
comments
tags
timeline_events
activities
tasks
approval_requests
workflow_runs
ai_summaries
```

Rules:

```text
- Do not use polymorphic links where a strict FK is required.
- Use strict FK for critical financial, order, inventory, and tenant ownership paths.
- Polymorphic entities must still include tenant_id.
```

## Critical Foreign Key Rules

```text
tenant_id → tenants.id
created_by → users.id
updated_by → users.id
deleted_by → users.id
customer_id → customers.id
assigned_user_id → users.id
branch_id → branches.id
dealer_id → dealers.id
lead_id → leads.id
opportunity_id → opportunities.id
quote_id → quotes.id
order_id → orders.id
invoice_id → invoices.id
payment_id → payments.id
product_id → products.id
product_variant_id → product_variants.id
warehouse_id → warehouses.id
stock_id → stocks.id
```

## Build Priority

First production database slice:

```text
CORE
IAM
CRM
LEAD
SALES
QUOTE
TASK
NOTIFICATION
AUDIT
```

Then:

```text
ORDER
PRODUCT
INVENTORY
FINANCE
WORKFLOW
COMMUNICATION
SUPPORT
AI
REPORTING
INTEGRATION
DATA QUALITY
```

## Definition of Done for Any Migration

```text
- Table created with global fields.
- tenant_id present where required.
- RLS enabled where required.
- Tenant isolation policy exists.
- Required indexes exist.
- FK names are consistent.
- Soft delete fields exist where needed.
- Audit-critical actions identified.
- Seed data added where required.
- Migration rollback reviewed.
- Tenant isolation tests added.
```
