# CRM OS Low-Code Strategy Canon

## Purpose

CRM OS must support enterprise customization without allowing tenants to break platform integrity.

Low-code capabilities are allowed only inside controlled extension points.

## Canonical Principle

The platform owns:
- security
- tenant isolation
- auditability
- schema safety
- performance limits
- upgrade compatibility

The tenant may configure:
- fields
- forms
- views
- dashboards
- workflows
- validations
- labels
- module visibility

## Forbidden

- Arbitrary backend code execution
- Direct SQL by tenant users
- Tenant-owned database migrations
- Unsafe script injection
- Cross-tenant customization leakage
- Customization that bypasses RBAC or RLS
