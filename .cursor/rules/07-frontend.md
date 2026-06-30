# 07 Frontend Rules v8

- Frontend uses Next.js App Router, React, TypeScript, Tailwind CSS and TanStack Query.
- Authenticated pages use the **existing minimal AppShell** — do not redesign it in domain sprints.
- Every screen includes loading, empty, error and permission states.
- Use typed mock data before backend integration.

## Domain sprints (Sprint-04+)

See `docs/DECISIONS.md` (2026-06-22). **Functional proof only.**

- Build only minimum routes needed to verify API behavior.
- Keep styling simple and consistent with the current minimal app.
- Do not create full dashboard design, design system, or visual polish.
- Do not redesign existing screens.
- Do not spend sprint capacity on UI/UX canon implementation (`canon/ui/*`, `08-ui-design.md`).

## Dedicated UI/UX sprint (later)

Final AppShell, navigation, dashboard layout, component system, design tokens, and visual polish are deferred to a future UI/UX sprint — not domain sprints.
