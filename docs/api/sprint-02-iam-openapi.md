# Sprint-02 IAM API Contract (OpenAPI-style)

Source: implemented backend on `agent/sprint-02-auth-tenant-iam` (Phase 2 merge `7c3abb3`).

Base URL (local): `http://localhost:3001`  
API prefix: `/api/v1` (except health).

## Shared envelopes

### Success (IAM routes)

```yaml
ApiDataEnvelope:
  type: object
  required: [data, meta]
  properties:
    data:
      type: object
    meta:
      type: object
      required: [timestamp]
      properties:
        requestId:
          type: string
          format: uuid
        timestamp:
          type: string
          format: date-time
```

### Error (NestJS default)

```yaml
ErrorResponse:
  type: object
  properties:
    statusCode:
      type: integer
    message:
      oneOf:
        - type: string
        - type: array
          items:
            type: string
    error:
      type: string
```

## Security

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

Access token payload (JWT claims): `sub` (userId), `email`, `tenantId`.

---

## GET /health

No authentication. **Not** under `/api/v1`.

```yaml
/health:
  get:
    tags: [Health]
    summary: Service liveness
    security: []
    responses:
      '200':
        description: OK
        content:
          application/json:
            schema:
              type: object
              required: [status, service, version]
              properties:
                status:
                  type: string
                  enum: [ok]
                service:
                  type: string
                  example: crm-os
                version:
                  type: string
                  example: "0.1.0"
```

---

## POST /api/v1/auth/login

```yaml
/api/v1/auth/login:
  post:
    tags: [Auth]
    summary: Authenticate user and issue tokens
    security: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
                minLength: 1
              tenantSlug:
                type: string
                description: Defaults to `default` when omitted
    responses:
      '201':
        description: Login successful
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiDataEnvelope'
                - type: object
                  properties:
                    data:
                      type: object
                      required: [accessToken, refreshToken, tokenType, tenantId, user]
                      properties:
                        accessToken:
                          type: string
                        refreshToken:
                          type: string
                          description: Opaque base64url(userId:tenantId:nonce)
                        tokenType:
                          type: string
                          enum: [Bearer]
                        tenantId:
                          type: string
                          format: uuid
                        user:
                          type: object
                          properties:
                            id:
                              type: string
                              format: uuid
                            email:
                              type: string
                            firstName:
                              type: string
                            lastName:
                              type: string
      '400':
        description: Tenant not found
      '401':
        description: Invalid credentials or user not a tenant member
```

---

## POST /api/v1/auth/refresh

```yaml
/api/v1/auth/refresh:
  post:
    tags: [Auth]
    summary: Exchange refresh token for new access token
    security: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [refreshToken]
            properties:
              refreshToken:
                type: string
                minLength: 1
    responses:
      '201':
        description: Refresh successful
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiDataEnvelope'
                - type: object
                  properties:
                    data:
                      type: object
                      required: [accessToken, refreshToken, tokenType, tenantId]
                      properties:
                        accessToken:
                          type: string
                        refreshToken:
                          type: string
                          description: Same opaque token returned (rotation not implemented in Sprint-02 skeleton)
                        tokenType:
                          type: string
                          enum: [Bearer]
                        tenantId:
                          type: string
                          format: uuid
      '401':
        description: Invalid refresh token, session not found, or tenant tamper
```

---

## GET /api/v1/users

```yaml
/api/v1/users:
  get:
    tags: [Users]
    summary: List tenant members (users in active tenant)
    security:
      - bearerAuth: []
    responses:
      '200':
        description: User list
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiDataEnvelope'
                - type: object
                  properties:
                    data:
                      type: object
                      required: [items, total]
                      properties:
                        items:
                          type: array
                          items:
                            type: object
                            properties:
                              id:
                                type: string
                                format: uuid
                              email:
                                type: string
                              firstName:
                                type: string
                              lastName:
                                type: string
                              status:
                                type: string
                              membershipId:
                                type: string
                                format: uuid
                        total:
                          type: integer
      '401':
        description: Missing or invalid Bearer token
      '403':
        description: Valid token but missing `user.manage` permission
```

Required permission: `user.manage`.

---

## POST /api/v1/roles

```yaml
/api/v1/roles:
  post:
    tags: [Roles]
    summary: Create a tenant-owned role
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [code, name]
            properties:
              code:
                type: string
                minLength: 2
                pattern: '^[a-z0-9_]+$'
              name:
                type: string
                minLength: 2
              isSystem:
                type: boolean
                default: false
    responses:
      '201':
        description: Role created
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiDataEnvelope'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        id:
                          type: string
                          format: uuid
                        tenantId:
                          type: string
                          format: uuid
                        code:
                          type: string
                        name:
                          type: string
                        isSystem:
                          type: boolean
      '401':
        description: Missing or invalid Bearer token
      '403':
        description: Valid token but missing `role.manage` permission
      '409':
        description: Duplicate role code within tenant (Prisma unique constraint)
```

Required permission: `role.manage`.

---

## Related docs

- Auth flow: `docs/security/sprint-02-auth-flow.md`
- Permissions: `docs/security/sprint-02-permission-registry.md`
- Environment: `docs/api/sprint-02-environment.md`
- Frontend Slice A: `docs/frontend/sprint-02-slice-a-handoff.md`
