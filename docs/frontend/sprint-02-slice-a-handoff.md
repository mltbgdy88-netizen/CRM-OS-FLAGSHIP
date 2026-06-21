# Sprint-02 Frontend Slice A Handoff

**Audience:** Frontend Agent (Phase 3A)  
**Branch base:** `agent/sprint-02-auth-tenant-iam`  
**Status:** Ready to start login + auth wiring only.

## Scope boundary

| In Slice A | Out of scope (disabled) |
|------------|-------------------------|
| Login screen | User admin UI |
| Auth token wiring | Role / permission matrix |
| Loading / error / success states | Session / device panel |
| Redirect after login | **Frontend Slice B** (explicitly disabled) |

**Frontend Slice B remains disabled** per `.cursor/rules/00-sprint-02-hard-guard.md` and `.ai/orchestration/locks.yaml` (`apps/web/app/(iam)` phase 3B `status: disabled`).

Do not implement CRM modules, RabbitMQ, or backend changes unless a blocking contract mismatch is found — report and stop.

## API base URL

Local API: `http://localhost:${API_PORT:-3001}`

Contract: `docs/api/sprint-02-iam-openapi.md`  
Auth flow: `docs/security/sprint-02-auth-flow.md`

## Login screen contract

### Form fields

| Field | Type | Required | Default |
|-------|------|----------|---------|
| Email | email input | yes | — |
| Password | password input | yes | — |
| Tenant slug | text (optional) | no | `default` |

### Submit

`POST /api/v1/auth/login`

```json
{ "email": "...", "password": "...", "tenantSlug": "default" }
```

### Success handling

On **201**, persist from `response.data`:

- `accessToken` — send as `Authorization: Bearer …` on protected calls
- `refreshToken` — store securely for silent refresh (see warnings)
- `tenantId`, `user` — display / session context

Navigate to post-login route (product decision; no admin screens in Slice A).

## Required UI states

| State | Behavior |
|-------|----------|
| **Idle** | Form enabled, no inline error |
| **Loading** | Disable submit, show spinner on primary action |
| **Validation error** | Client-side: empty email/password before submit |
| **Auth error (401/400)** | Show generic “Invalid credentials or tenant” — do not leak which field failed |
| **Network error** | Retry affordance, non-blocking message |
| **Success** | Brief confirmation optional; redirect with tokens stored |

Do **not** build permission-denied admin UI in Slice A. If a protected route is hit without permission, show generic unauthorized (403) message only if needed for dev smoke tests.

## Token storage warning

Sprint-02 skeleton does not mandate a storage backend. For Slice A:

- Prefer **httpOnly secure cookies** in production (requires backend cookie support — not in Phase 2).
- If using `localStorage` / `sessionStorage` for local dev only, document XSS risk prominently in PR notes.
- **Never** commit tokens, secrets, or seed passwords to the repo.
- Refresh token is opaque and tenant-bound — treat as sensitive as access token.

## API calls needed (Slice A)

| Call | When | Auth |
|------|------|------|
| `POST /api/v1/auth/login` | Login submit | None |
| `POST /api/v1/auth/refresh` | Access token near expiry / 401 recovery | None (body: `refreshToken`) |
| `GET /health` | Optional API connectivity check | None |

**Do not call** in Slice A (Slice B / backend smoke only):

- `GET /api/v1/users` (requires `user.manage`)
- `POST /api/v1/roles` (requires `role.manage`)

## Local dev credentials

See `docs/security/sprint-02-auth-flow.md` — `admin@default.local` / `Admin123!` / tenant `default`.

## Acceptance checklist (Frontend Agent)

- [ ] Login form matches contract fields
- [ ] All required UI states implemented
- [ ] Tokens stored per team decision with security note
- [ ] No Slice B screens (users, roles, sessions)
- [ ] No `apps/web` changes outside authorized login routes
- [ ] `pnpm sprint:01:verify` still passes

## References

- OpenAPI-style contract: `docs/api/sprint-02-iam-openapi.md`
- Permissions (for future slices): `docs/security/sprint-02-permission-registry.md`
- Sprint status: `docs/sprints/sprint-02-status.md`
