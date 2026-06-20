# 06 Event Rules v8

- Domain events describe business facts that already happened.
- Events include tenantId, actorId, aggregateType, aggregateId, eventType, payload and createdAt.
- Events must be emitted after permission and validation checks.
- Event handlers must be idempotent.
- Failed event delivery requires retry or visible failure log.
