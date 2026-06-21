# Sprint-02 IAM Auth Flow

Documents the implemented auth skeleton in `apps/api/src/modules/iam` (Phase 2).

## Overview

```text
Login  → access JWT + opaque refresh token + session row (RLS)
Refresh → parse tenant from refresh token → session lookup (RLS) → new access JWT
Protected routes → Bearer JWT → JwtAuthGuard → TenantContextInterceptor → PermissionGuard
```

## Login

### Request

`POST /api/v1/auth/login`

```json
{
  "email": "admin@default.local",
  "password": "Admin123!",
  "tenantSlug": "default"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `email` | yes | Valid email format |
| `password` | yes | Sprint-02 local seed uses SHA256 hash (not bcrypt yet) |
| `tenantSlug` | no | Defaults to `default` |

### Response (201)

```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<opaque>",
    "tokenType": "Bearer",
    "tenantId": "11111111-1111-4111-8111-111111111111",
    "user": {
      "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "email": "admin@default.local",
      "firstName": "Default",
      "lastName": "Admin"
    }
  },
  "meta": { "timestamp": "2026-06-21T00:00:00.000Z" }
}
```

### Side effects

- Session row created in `sessions` (hash of refresh token) inside `withTenantContext`
- Audit: `auth.login` on `audit_logs`
- Event: `UserLoggedIn` (in-memory publisher in Sprint-02 skeleton)

### Login errors

| Condition | HTTP | Message (typical) |
|-----------|------|-------------------|
| Unknown email / wrong password | 401 | Invalid credentials |
| Unknown tenant slug | 400 | Tenant not found |
| User not member of tenant | 401 | User is not a member of this tenant |

## Access token usage

Send on protected routes:

```http
Authorization: Bearer <accessToken>
```

JWT claims used by backend:

| Claim | Meaning |
|-------|---------|
| `sub` | User ID |
| `email` | User email |
| `tenantId` | Active tenant for this session |

Default TTL: **900 seconds** (`JWT_ACCESS_TTL_SECONDS`, optional).

`TenantContextInterceptor` derives `{ tenantId, userId, email }` from JWT on guarded controllers.

## Refresh token usage

### Request

`POST /api/v1/auth/refresh`

```json
{
  "refreshToken": "<opaque token from login>"
}
```

### Response (201)

```json
{
  "data": {
    "accessToken": "<new jwt>",
    "refreshToken": "<same opaque token>",
    "tokenType": "Bearer",
    "tenantId": "11111111-1111-4111-8111-111111111111"
  },
  "meta": { "timestamp": "..." }
}
```

### Refresh flow (RLS-safe)

1. **Parse** `userId` and `tenantId` from opaque token (`base64url(userId:tenantId:nonce)`) — no DB yet.
2. Build tenant context from parsed values.
3. **Lookup** session by SHA256(refreshToken) via `IamRepository.findSessionByRefreshHash` inside `withTenantContext`.
4. Issue new access JWT from session user + parsed `tenantId`.

Default refresh TTL: **604800 seconds** (7 days, `JWT_REFRESH_TTL_SECONDS`, optional).

See also: `apps/api/README.md` (refresh flow summary).

## Invalid token behavior

### Protected routes (`GET /users`, `POST /roles`)

| Scenario | HTTP | Guard |
|----------|------|-------|
| No `Authorization` header | 401 | JwtAuthGuard |
| Malformed / expired JWT | 401 | JwtAuthGuard |
| Valid JWT, missing permission | 403 | PermissionGuard |

### Refresh route

| Scenario | HTTP |
|----------|------|
| Malformed opaque token | 401 Invalid refresh token |
| Valid format, no matching session | 401 Refresh session not found |
| Expired or revoked session | 401 Refresh session not found |

## Tenant tamper behavior

If an attacker modifies the `tenantId` segment inside the opaque refresh token:

1. Parsed context points at the **wrong tenant** for RLS.
2. Session hash no longer matches stored hash **or** session row is invisible under wrong tenant RLS.
3. Result: **401** — refresh cannot bypass tenant isolation.

Proven by e2e: `POST /api/v1/auth/refresh cannot bypass tenant context` in `apps/api/test/iam.e2e-spec.ts`.

## Local seed credentials (dev only)

| User | Password | Tenant slug | Roles |
|------|----------|-------------|-------|
| `admin@default.local` | `Admin123!` | `default` | `tenant_admin` (all permissions) |
| `member@tenant-b.local` | `Admin123!` | `tenant-b` | none (403 on protected admin routes) |

**Warning:** These credentials and password hashing are for local/dev only. Do not use in production.
