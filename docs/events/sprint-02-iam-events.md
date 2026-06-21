# Sprint-02 IAM Event Catalog

Canonical source: `packages/events/src/index.ts`

Sprint-02 uses an **in-memory** `DomainEventPublisher` in the API (`apps/api/src/modules/iam/services/audit.service.ts`). Events are defined and emitted in-process only — **no RabbitMQ**, no BullMQ wiring in this phase.

## Envelope shape

```typescript
interface DomainEventEnvelope {
  tenantId: string;
  actorId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}
```

## Events

### UserLoggedIn

| Field | Value |
|-------|-------|
| `eventType` | `UserLoggedIn` |
| `aggregateType` | `user` |
| `aggregateId` | User ID |
| Emitted when | Successful `POST /api/v1/auth/login` |
| Payload | `{ email: string }` |
| Factory | `createUserLoggedInEvent()` |

### RoleChanged

| Field | Value |
|-------|-------|
| `eventType` | `RoleChanged` |
| `aggregateType` | `role` |
| `aggregateId` | Role ID |
| Emitted when | Successful `POST /api/v1/roles` (create) |
| Payload | `{ change: "created" }` |
| Factory | `createRoleChangedEvent()` |

### UserInvited — defined only

| Field | Value |
|-------|-------|
| `eventType` | `UserInvited` |
| Factory | `createUserInvitedEvent()` |
| Status | **Defined in `@crm-os/events` but not emitted** |

No invite endpoint exists in Sprint-02 Phase 2. Frontend and downstream consumers must not assume `UserInvited` is published until a future invite flow is implemented.

## Event rules (Sprint-02)

- Events include `tenantId` and `actorId` from request/tenant context.
- Publishing does not bypass `PermissionGuard` (events fire only after authorized service actions).
- Failed delivery / retry queue is **out of scope** for Sprint-02 skeleton.

See `packages/events/README.md`.
