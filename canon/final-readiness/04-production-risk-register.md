# CRM OS Production Risk Register

## R1: Scope Explosion

Risk: CRM OS includes CRM, ERP Lite, AI, portals, integrations, mobile, and low-code.

Mitigation:

- Sprint-based build order.
- MVP freeze.
- Change control.
- Canon priority rules.

## R2: Tenant Isolation Failure

Risk: One tenant may access another tenant's data.

Mitigation:

- Mandatory tenant_id.
- PostgreSQL RLS.
- Tenant context middleware.
- Tenant isolation tests.
- Security review gate.

## R3: Permission Drift

Risk: UI and API permissions diverge.

Mitigation:

- Central permission matrix.
- Backend authorization as source of enforcement.
- Permission-aware UI.
- Permission tests.

## R4: Data Model Drift

Risk: Cursor generates tables inconsistent with ERD and Data Dictionary.

Mitigation:

- Database canon.
- Migration review.
- Data dictionary alignment.
- Schema validation.

## R5: AI Unsafe Actions

Risk: AI mutates records without review.

Mitigation:

- AI review controls.
- Audit trace.
- Permission checks.
- No silent mutation rule.

## R6: Integration Instability

Risk: Webhooks and external connectors cause failures.

Mitigation:

- Signed webhooks.
- Retry policy.
- Idempotency.
- Integration logs.

## R7: Deployment Failure

Risk: Release breaks production.

Mitigation:

- Staging validation.
- Migration backup.
- Smoke tests.
- Rollback plan.

## R8: Observability Gap

Risk: Failures occur without detection.

Mitigation:

- Metrics.
- Structured logs.
- Error tracking.
- Uptime monitoring.
- Queue monitoring.
