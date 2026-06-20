# Queue Runtime Canon — BullMQ First

Source Status: CANON_FIXED_FOR_CURSOR_READY_v1.1

## Decision

For Sprint-01 through MVP foundation:

```text
Redis + BullMQ is the default queue/runtime choice.
RabbitMQ is not mandatory for Sprint-01.
```

## Rationale

```text
- BullMQ uses Redis, which is already required.
- It keeps local development and CI simpler.
- It fits a NestJS modular monolith.
- RabbitMQ can be introduced later only if integration/event throughput requires it.
```

## Cursor Rule

Cursor must not add RabbitMQ in Sprint-01 unless a later canon document explicitly overrides this decision.
