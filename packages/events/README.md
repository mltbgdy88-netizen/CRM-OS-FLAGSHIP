# @crm-os/events

Sprint-02 IAM domain event envelope definitions.

## Event types

| Type | Status |
|------|--------|
| `UserLoggedIn` | Emitted on login |
| `RoleChanged` | Emitted on role create |
| `UserInvited` | **Defined only** — not emitted in Phase 2 |

## Usage

```typescript
import {
  IAM_EVENT_TYPES,
  createUserLoggedInEvent,
  createRoleChangedEvent,
  createUserInvitedEvent,
  type DomainEventEnvelope,
} from '@crm-os/events';
```

Sprint-02 API uses in-memory `DomainEventPublisher` — no RabbitMQ.

## Documentation

Full catalog: `docs/events/sprint-02-iam-events.md`
