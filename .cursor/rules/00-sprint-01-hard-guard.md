# 00 Cursor Sprint-01 Hard Guard

Source Status: CANON_FIXED_FOR_CURSOR_READY_v1.1

## Active Sprint

Only Sprint-01 Repository Bootstrap is active.

## Before Code

Cursor must first return a plan and stop.

The plan must include:

```text
1. canonical source order
2. exact Sprint-01 scope
3. files to create/change
4. commands to run
5. explicitly forbidden implementations
```

## Sprint-01 Allowed

```text
- monorepo foundation
- NestJS skeleton
- Next.js skeleton
- shared/database package skeletons
- Docker Compose PostgreSQL + Redis
- .env.example
- GitHub Actions CI skeleton
- health endpoint only
```

## Sprint-01 Forbidden

```text
- CRM business modules
- real auth
- tenant/user/audit implementation
- RLS business schema
- AI features
- quote/order/inventory/finance modules
- uncontrolled generator output
```

## Queue Decision

Use Redis + BullMQ for initial queue/runtime planning. Do not add RabbitMQ in Sprint-01.

## Prisma + RLS Decision

No tenant-scoped data access may bypass tenant-aware repository rules. Sprint-01 must not implement real tenant-owned tables.
