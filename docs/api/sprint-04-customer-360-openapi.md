# Sprint-04 Customer 360 API Contract (OpenAPI-style)

Source: integration branch `agent/sprint-04-customer-360` @ `4bd8e8a` (Backend PR #18, CORS PR #20).

Base URL (local): `http://localhost:3001`  
API prefix: `/api/v1`  
Authentication: Bearer JWT (Sprint-02 access token).

## Shared envelopes

Reuses Sprint-02 `ApiDataEnvelope` and `ErrorResponse` from [sprint-02-iam-openapi.md](./sprint-02-iam-openapi.md).

## Permissions

| Endpoint | Permission | Notes |
|----------|------------|-------|
| `GET /customers/{id}/360` | `customer.read` | Same as Sprint-03 customer detail read |
| `GET /customers/{id}/timeline` | `customer.timeline.read` | Separate timeline permission |
| — | `customer.export` | Seeded and registered in `@crm-os/permissions`; **no export endpoint in Sprint-04** |

See [sprint-04-customer-360-permissions.md](../security/sprint-04-customer-360-permissions.md).

## Schemas

```yaml
components:
  schemas:
    Customer360View:
      allOf:
        - $ref: './sprint-03-customer-openapi.md#/components/schemas/CustomerSummary'
        - type: object
          required: [scores, riskScore, lifetimeValue, notes, files, timelinePreview]
          properties:
            scores:
              type: array
              items:
                $ref: '#/components/schemas/CustomerScoreView'
            riskScore:
              nullable: true
              allOf:
                - $ref: '#/components/schemas/CustomerRiskScoreView'
            lifetimeValue:
              nullable: true
              allOf:
                - $ref: '#/components/schemas/CustomerLifetimeValueView'
            notes:
              type: array
              items:
                $ref: '#/components/schemas/CustomerNoteView'
            files:
              type: array
              description: Metadata only — no upload, download, or signed URL in Sprint-04
              items:
                $ref: '#/components/schemas/CustomerFileView'
            timelinePreview:
              type: array
              description: Latest timeline events (preview slice, not paginated list)
              items:
                $ref: '#/components/schemas/CustomerTimelineEventView'

    CustomerScoreView:
      type: object
      properties:
        id: { type: string, format: uuid }
        metricCode: { type: string, example: engagement }
        scoreValue: { type: number, example: 82.5 }
        recordedAt: { type: string, format: date-time }

    CustomerRiskScoreView:
      type: object
      properties:
        id: { type: string, format: uuid }
        riskLevel: { type: string, example: low }
        riskScore: { type: number, example: 12.5 }
        assessedAt: { type: string, format: date-time }

    CustomerLifetimeValueView:
      type: object
      properties:
        id: { type: string, format: uuid }
        currency: { type: string, example: TRY }
        ltvValue: { type: number, example: 125000 }
        calculatedAt: { type: string, format: date-time }

    CustomerNoteView:
      type: object
      properties:
        id: { type: string, format: uuid }
        title: { type: string, nullable: true }
        body: { type: string }
        createdAt: { type: string, format: date-time }

    CustomerFileView:
      type: object
      properties:
        id: { type: string, format: uuid }
        fileName: { type: string }
        mimeType: { type: string, nullable: true }
        byteSize: { type: integer, nullable: true }
        createdAt: { type: string, format: date-time }

    CustomerTimelineEventView:
      type: object
      properties:
        id: { type: string, format: uuid }
        eventType: { type: string, example: customer.created }
        title: { type: string }
        summary: { type: string, nullable: true }
        occurredAt: { type: string, format: date-time }
        createdAt: { type: string, format: date-time }

    CustomerTimelineListData:
      type: object
      required: [items, page, pageSize, total]
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/CustomerTimelineEventView'
        page:
          type: integer
          minimum: 1
        pageSize:
          type: integer
          minimum: 1
          maximum: 100
        total:
          type: integer
          minimum: 0
```

## Endpoints

### GET /api/v1/customers/{id}/360

**Permission:** `customer.read`  
**Controller:** `Customer360Controller.get360` (does not modify Sprint-03 `CustomersController`)

Returns aggregated Customer 360 view for a tenant-scoped customer:

- Customer summary fields (from `customers`)
- `scores[]` — latest row per `metricCode`
- `riskScore` — latest risk row or `null`
- `lifetimeValue` — latest LTV row or `null`
- `notes[]`, `files[]` — from Sprint-03 tables (metadata only)
- `timelinePreview[]` — recent timeline events (preview, not full paginated list)

**Responses**

| Status | Meaning |
|--------|---------|
| 200 | `ApiDataEnvelope<Customer360View>` |
| 401 | Missing/invalid JWT |
| 403 | Missing `customer.read` |
| 404 | Customer not found in tenant scope |

**Example (seeded customer)**

```http
GET /api/v1/customers/40000000-0000-4000-8000-000000000001/360
Authorization: Bearer <accessToken>
```

### GET /api/v1/customers/{id}/timeline

**Permission:** `customer.timeline.read`

**Query parameters**

| Name | Type | Default | Constraints |
|------|------|---------|-------------|
| `page` | integer | 1 | min 1 |
| `pageSize` | integer | 20 | min 1, max 100 |

**Responses**

| Status | Meaning |
|--------|---------|
| 200 | `ApiDataEnvelope<CustomerTimelineListData>` |
| 401 | Missing/invalid JWT |
| 403 | Missing `customer.timeline.read` |
| 404 | Customer not found in tenant scope |

**Example**

```http
GET /api/v1/customers/40000000-0000-4000-8000-000000000001/timeline?page=1&pageSize=10
Authorization: Bearer <accessToken>
```

## Local browser proof and CORS

The Next.js web app (`http://localhost:3000`) calls the API (`http://localhost:3001`) cross-origin.

- Set `CORS_ORIGIN=http://localhost:3000` on the API (see `.env.example`, `apps/api/src/common/http/cors.config.ts`).
- Set `NEXT_PUBLIC_API_URL=http://localhost:3001` on the web app.
- Manual proof customer: `40000000-0000-4000-8000-000000000001` after login `admin@default.local` / tenant `default`.

## Out of scope (Sprint-04)

| Item | Status |
|------|--------|
| Export endpoint/UI | **Not implemented** (`customer.export` registered only) |
| File upload/storage/CDN/signed URLs | **Not implemented** |
| Customer merge API/UI | **Not implemented** |
| DELETE customer route/UI | **Not implemented** |
| Related-entity CRUD | **Not implemented** |
| Sprint-05 Lead | **Not started** |

## Regression

Sprint-03 customer endpoints (`GET/POST/GET/PATCH /customers`) remain frozen and unchanged in behavior.
