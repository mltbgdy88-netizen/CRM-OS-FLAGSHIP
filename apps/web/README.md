# @crm-os/web

Next.js App Router skeleton for Sprint-01; Sprint-02 Slice A adds login.

## Commands

```bash
pnpm --filter @crm-os/web dev
pnpm --filter @crm-os/web test
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Bootstrap home |
| `/health` | Web health placeholder |
| `/login` | Sprint-02 Slice A login (email, password, tenant slug) |

## Local API

Set `NEXT_PUBLIC_API_URL=http://localhost:3001` when the NestJS API runs on a non-default host/port.

Login calls `POST /api/v1/auth/login`. Access token is stored in **sessionStorage** for local dev only — see on-page security warning.

Slice B (users, roles, sessions UI) is **not** implemented.
