# Sprint-04 OpenAPI Contract Sync (Local vs PR #21)

**Date:** 2026-06-30  
**Integration code:** `agent/sprint-04-customer-360` @ `4bd8e8a`  
**Contract PR:** [#21](https://github.com/mltbgdy88-netizen/CRM-OS-FLAGSHIP/pull/21) (not merged)

## Endpoints — implementation vs expected

| Endpoint | Controller | Permission (code) | PR #21 expected | Sync |
|----------|------------|-------------------|-----------------|------|
| `GET /api/v1/customers` | `CustomersController.list` | `customer.read` | Yes | **OK** |
| `POST /api/v1/customers` | `CustomersController.create` | `customer.create` | Yes | **OK** |
| `GET /api/v1/customers/:id` | `CustomersController.getById` | `customer.read` | Yes | **OK** |
| `PATCH /api/v1/customers/:id` | `CustomersController.update` | `customer.update` | Yes | **OK** |
| `GET /api/v1/customers/:id/360` | `Customer360Controller.get360` | `customer.read` | Yes | **OK** |
| `GET /api/v1/customers/:id/timeline` | `Customer360Controller.getTimeline` | `customer.timeline.read` | Yes | **OK** |

## Response envelope

| Aspect | Implementation | Canon / PR #21 | Sync |
|--------|----------------|----------------|------|
| Wrapper | `okEnvelope()` → `{ data, meta? }` | `{ data: T, meta? }` | **OK** |
| List field names | `displayName`, `email`, `phone`, `status`, `updatedAt` | Same (not `name`) | **OK** |

## Permissions matrix

| Code | Registered | Used on route |
|------|------------|---------------|
| `customer.read` | Yes | list, get, 360 |
| `customer.create` | Yes | POST |
| `customer.update` | Yes | PATCH |
| `customer.delete` | Yes (seed) | **No DELETE route** (by design) |
| `customer.timeline.read` | Yes | timeline |
| `customer.export` | Yes (seed) | **No export route** (deferred) |

## Gaps to resolve at #21 merge

1. **Merge PR #21** and diff `sprint-04-customer-360-openapi.md` against this table line-by-line
2. Confirm timeline/360 DTO field names in OpenAPI match `customer-360.mapper.ts`
3. Update `docs/sprints/sprint-04-contract-index.md` on integration after merge

## Verdict

**Pre-merge local sync: PASS (no contradictions found in live controllers vs locked canon permissions/endpoints).** Final sign-off requires merged OpenAPI doc from #21.
