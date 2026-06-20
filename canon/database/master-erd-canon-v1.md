# CRM OS Master ERD Canon v1

## Purpose

This document defines the stable entity relationship backbone for CRM OS.

## Primary Flow

```text
Tenant
→ Users / Roles / Permissions
→ Customer
→ Lead
→ Opportunity
→ Quote
→ Order
→ Shipment
→ Invoice
→ Payment
→ Support
→ Retention
```

## Main Relationships

```text
tenants 1 ── N users
tenants 1 ── N customers
tenants 1 ── N leads
tenants 1 ── N products
tenants 1 ── N workflows

customers 1 ── N customer_contacts
customers 1 ── N customer_addresses
customers 1 ── N opportunities
customers 1 ── N quotes
customers 1 ── N orders
customers 1 ── N tickets
customers 1 ── N payments
customers 1 ── N conversations

leads 0..1 ── 1 customers
leads 0..1 ── 1 opportunities

pipelines 1 ── N pipeline_stages
pipeline_stages 1 ── N opportunities
opportunities 1 ── N quotes

quotes 1 ── N quote_items
quotes 0..1 ── 1 orders

orders 1 ── N order_items
orders 1 ── N order_shipments
orders 1 ── N payments

products 1 ── N product_variants
product_variants 1 ── N stocks
product_variants 1 ── N quote_items
product_variants 1 ── N order_items

warehouses 1 ── N stocks
stocks 1 ── N stock_movements

accounts 1 ── N account_transactions
invoices 1 ── N payments via payment_allocations

conversations 1 ── N messages
tickets 1 ── N ticket_messages
workflows 1 ── N workflow_versions
workflow_versions 1 ── N workflow_nodes
approval_requests 1 ── N approval_steps
```

## ERD Rule

The ERD must support CRM, ERP Lite, Omnichannel, B2B Portal, Workflow Engine, AI Platform, Low-Code Customization, and Enterprise SaaS Admin without breaking tenant isolation.
