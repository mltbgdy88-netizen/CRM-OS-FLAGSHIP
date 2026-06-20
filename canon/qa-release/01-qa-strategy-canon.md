# CRM OS QA Strategy Canon

## Mission

CRM OS quality assurance protects tenant isolation, business correctness, security, data integrity, and enterprise UX consistency.

## QA Layers

1. Static checks
2. Unit tests
3. Integration tests
4. Contract tests
5. Database migration tests
6. Tenant isolation tests
7. Permission tests
8. API tests
9. UI component tests
10. E2E journey tests
11. Security tests
12. Performance smoke tests

## Test Ownership

- Backend Agent writes backend unit and integration tests.
- Frontend Agent writes UI and component tests.
- QA Agent writes acceptance, regression, and E2E tests.
- Security Agent writes security abuse-case tests.
- Review Agent blocks merge on missing gates.

## Mandatory Regression Journeys

- Login → Customer Create → Customer Detail
- Lead Create → Lead Convert → Opportunity Create
- Opportunity → Quote Create → Quote Approval
- Quote Approved → Order Create
- Order → Stock Reservation
- Payment Received → Account Transaction
- Ticket Created → SLA Tracking
- AI Suggestion → Review → Apply/Reject
