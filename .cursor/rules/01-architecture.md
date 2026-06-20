# 01 Architecture Rules v8

- CRM OS starts as a modular monolith with event-driven boundaries.
- Modules remain isolated through folder ownership, public contracts and events.
- Service extraction is allowed later for notification, file, integration, AI, reporting and workflow.
- Keep business rules inside domain services, not controllers or UI.
- Use shared contracts for events, permissions, DTOs and formatting.
