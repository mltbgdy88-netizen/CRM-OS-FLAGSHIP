# CRM OS Master Source of Truth v6

## Source Priority

1. `docs/source/customer-operating-system-technical-blueprint-v1.pdf`
2. `docs/source/customer-operating-system-technical-blueprint-v1.extracted.md`
3. Workspace v5 documents and Cursor rules
4. Existing sprint/factory/UX packs from v5

## v6 Merge Decision

The uploaded 378-page technical blueprint becomes the highest-level product and architecture authority for:

- Product objective
- Modular Monolith + Event-Driven Architecture
- Technology stack
- Multi-tenant model
- PostgreSQL RLS standard
- Domain module boundaries
- Event Catalog v1
- API standard and OpenAPI contract
- Permission model
- Roadmap
- ERD
- Data Dictionary
- DevOps, CI/CD, Observability, Security and QA sections

## Cursor Usage Rule

Cursor must read these files before Sprint-1 generation:

1. `AGENTS.md`
2. `.cursor/rules/*`
3. `docs/source/customer-operating-system-technical-blueprint-v1.extracted.md`
4. `docs/architecture/final-architecture-pack-v1.md`
5. `docs/database/erd-v1.md`
6. `docs/database/data-dictionary-v1.md`
7. `docs/api/openapi-contract-v1.md`
8. `docs/security/permission-matrix-v1.md`

## Important Note

v6 is not a historical word-for-word archive of every chat message. It is a merged Cursor workspace where Workspace v5 is enriched with the uploaded master technical blueprint.
