# Sprint-03 Customer Core API Contract (OpenAPI-style)

Source: implemented backend on `agent/sprint-03-customer-core` (Phase 2 merge `db4e9ba`).

Base URL (local): `http://localhost:3001`  
API prefix: `/api/v1`  
Authentication: Bearer JWT (Sprint-02 access token).

## Shared envelopes

Reuses Sprint-02 `ApiDataEnvelope` and `ErrorResponse` from [sprint-02-iam-openapi.md](./sprint-02-iam-openapi.md).

List responses wrap pagination inside `data`:

```yaml
CustomerListData:
  type: object
  required: [items, page, pageSize, total]
  properties:
    items:
      type: array
      items:
        $ref: '#/components/schemas/CustomerSummary'
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

## Schemas

```yaml
components:
  schemas:
    CustomerSummary:
      type: object
      required: [id, displayName, status, createdAt, version]
      properties:
        id:
          type: string
          format: uuid
        displayName:
          type: string
        email:
          type: string
          format: email
          nullable: true
        phone:
          type: string
          nullable: true
        status:
          type: string
          example: active
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
          nullable: true
        version:
          type: integer

    CustomerDetail:
      allOf:
        - $ref: '#/components/schemas/CustomerSummary'
        - type: object
          required: [contacts, addresses, tags, notes, files]
          properties:
            contacts:
              type: array
              items:
                $ref: '#/components/schemas/CustomerContact'
            addresses:
              type: array
              items:
                $ref: '#/components/schemas/CustomerAddress'
            tags:
              type: array
              items:
                $ref: '#/components/schemas/CustomerTag'
            notes:
              type: array
              items:
                $ref: '#/components/schemas/CustomerNote'
            files:
              type: array
              description: Metadata only — no upload, download, or signed URL endpoints in Sprint-03
              items:
                $ref: '#/components/schemas/CustomerFileMetadata'

    CustomerContact:
      type: object
      properties:
        id: { type: string, format: uuid }
        firstName: { type: string }
        lastName: { type: string }
        email: { type: string, format: email, nullable: true }
        phone: { type: string, nullable: true }
        title: { type: string, nullable: true }
        isPrimary: { type: boolean }

    CustomerAddress:
      type: object
      properties:
        id: { type: string, format: uuid }
        label: { type: string, nullable: true }
        line1: { type: string }
        line2: { type: string, nullable: true }
        city: { type: string, nullable: true }
        region: { type: string, nullable: true }
        postalCode: { type: string, nullable: true }
        countryCode: { type: string, nullable: true }
        isPrimary: { type: boolean }

    CustomerTag:
      type: object
      properties:
        id: { type: string, format: uuid }
        name: { type: string }

    CustomerNote:
      type: object
      properties:
        id: { type: string, format: uuid }
        title: { type: string, nullable: true }
        body: { type: string }
        createdAt: { type: string, format: date-time }

    CustomerFileMetadata:
      type: object
      properties:
        id: { type: string, format: uuid }
        fileName: { type: string }
        mimeType: { type: string, nullable: true }
        byteSize: { type: integer, nullable: true }
        createdAt: { type: string, format: date-time }
```

## Permissions

| Permission | Route usage | Sprint-03 endpoint |
|------------|-------------|-------------------|
| `customer.read` | List + detail | GET `/customers`, GET `/customers/{id}` |
| `customer.create` | Create | POST `/customers` |
| `customer.update` | Patch core fields | PATCH `/customers/{id}` |
| `customer.delete` | Registered in seed/registry | **No DELETE route in Sprint-03** |

Missing bearer → `401`. Valid JWT without permission → `403`.

---

## GET /api/v1/customers

```yaml
/api/v1/customers:
  get:
    tags: [Customers]
    summary: List customers (paginated)
    security:
      - bearerAuth: []
    parameters:
      - name: page
        in: query
        schema:
          type: integer
          default: 1
          minimum: 1
      - name: pageSize
        in: query
        schema:
          type: integer
          default: 20
          minimum: 1
          maximum: 100
    responses:
      '200':
        description: Paginated customer summaries
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiDataEnvelope'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/CustomerListData'
      '401':
        description: Missing or invalid JWT
      '403':
        description: Missing customer.read
```

---

## POST /api/v1/customers

```yaml
/api/v1/customers:
  post:
    tags: [Customers]
    summary: Create customer (core fields only)
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [displayName]
            properties:
              displayName:
                type: string
                minLength: 1
              email:
                type: string
                format: email
              phone:
                type: string
              status:
                type: string
    responses:
      '201':
        description: Created customer summary
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiDataEnvelope'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/CustomerSummary'
      '401':
        description: Missing or invalid JWT
      '403':
        description: Missing customer.create
```

Side effects: audit `customer.created`, event `CustomerCreated` (see linked docs).

---

## GET /api/v1/customers/{id}

```yaml
/api/v1/customers/{id}:
  get:
    tags: [Customers]
    summary: Customer 360 detail (read-only aggregation)
    security:
      - bearerAuth: []
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      '200':
        description: Customer with contacts, addresses, tags, notes, files metadata
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiDataEnvelope'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/CustomerDetail'
      '401':
        description: Missing or invalid JWT
      '403':
        description: Missing customer.read
      '404':
        description: Customer not found in tenant scope
```

No nested CRUD routes for contacts, addresses, tags, notes, or files in Sprint-03.

---

## PATCH /api/v1/customers/{id}

```yaml
/api/v1/customers/{id}:
  patch:
    tags: [Customers]
    summary: Update customer core fields
    security:
      - bearerAuth: []
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              displayName:
                type: string
                minLength: 1
              email:
                type: string
                format: email
              phone:
                type: string
              status:
                type: string
    responses:
      '200':
        description: Updated customer summary
      '401':
        description: Missing or invalid JWT
      '403':
        description: Missing customer.update
      '404':
        description: Customer not found in tenant scope
```

Side effects: audit `customer.updated`, event `CustomerUpdated`.

---

## Explicitly out of scope (Sprint-03)

- `DELETE /api/v1/customers/{id}` (permission registered only)
- Separate CRUD for contacts, addresses, tags, notes, files
- File upload, storage, CDN, signed URLs, streaming
- Lead, pipeline, quote, order, inventory, finance modules
- RabbitMQ, AI Gateway, workflow engine

Related: [sprint-03-customer-events.md](../events/sprint-03-customer-events.md), [sprint-03-customer-audit.md](../audit/sprint-03-customer-audit.md), [sprint-03-customer-handoff.md](../frontend/sprint-03-customer-handoff.md)
