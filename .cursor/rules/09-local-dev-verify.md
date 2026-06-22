---
description: Local dev servers and sprint verify gates — never kill all Node processes
alwaysApply: true
---

# Local verify gates and dev servers

## Rule

`pnpm sprint:*:verify` does **not** require API/Web dev servers. They may run in parallel.

**Never** during verify gates (agents, scripts, or docs):

- `taskkill /F /IM node.exe`
- `Stop-Process -Name node -Force` (broad kill)
- `pkill node` / `killall node`

Repo `package.json` verify scripts do **not** kill processes. Broad Node kills are **agent/operator error**, not gate behavior.

## Why

API (`:3001`) and Web (`:3000`) dev servers are Node processes. Killing all Node terminates them and is misreported as "killed for Prisma".

## Windows Prisma EPERM

If `prisma generate` fails with EPERM on `query_engine-windows.dll.node`:

1. Retry `pnpm --filter @crm-os/database prisma:generate` once.
2. Or stop API/Web dev servers **manually** in their own terminals, then retry.
3. Do **not** force-kill all Node processes as a workaround.

## Terminals

- Terminal A: `pnpm --filter @crm-os/api dev`
- Terminal B: `pnpm --filter @crm-os/web dev`
- Terminal C: `pnpm sprint:04:verify` (isolated from dev servers)

Dev server termination during verify is **not** a gate failure unless build or tests fail.
