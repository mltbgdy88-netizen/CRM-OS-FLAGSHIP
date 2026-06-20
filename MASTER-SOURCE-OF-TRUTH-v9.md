# CRM OS Master Source of Truth v9

The canonical layer is now the highest authority.

## Source Order

1. `/canon`
2. `MASTER-SOURCE-OF-TRUTH-v9.md`
3. `docs/*`
4. `specs/*`
5. `.cursor/rules`
6. `.ai/agents`
7. generated source code

## v9 Purpose

v9 is a consolidation release. It does not replace v8 content. It adds a canonical specification layer to reduce ambiguity and documentation sprawl.

## Cursor Instruction

Before any code generation, Cursor must read:

- `AGENTS.md`
- `/canon/00-canonical-index.md`
- `/canon/13-build-order-canon.md`
- `.cursor/rules`
- target sprint spec

# v1.1 Canon Fix

The active root is this folder.

Sprint-01 is repository bootstrap only.

Queue runtime for initial foundation is Redis + BullMQ. RabbitMQ is deferred.

Prisma + PostgreSQL RLS requires tenant-aware repository boundaries and transaction-local tenant context for tenant-scoped operations.
