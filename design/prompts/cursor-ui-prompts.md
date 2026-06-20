# CRM OS Cursor UI Generation Pack v1

## Scope

Defines how Cursor must generate CRM OS UI code from approved blueprint systems.

## Architecture Order

```text
1. Design tokens
2. Foundation components
3. Layout/AppShell components
4. Form components
5. Data display components
6. CRM domain components
7. AI components
8. Storybook stories
9. Screen assemblies
10. QA pass
```

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Storybook
- Static typed mock data during UI generation
- No backend implementation in this phase

## Core Rules

- Generate reusable components before screens.
- Use CRM OS design tokens.
- Use static typed mock data only.
- Do not call real APIs.
- Do not create authentication logic.
- Include loading, empty, error, read-only, and permission-restricted states.
- AI components require review before applying actions.
- Use dark-first enterprise CRM density.

## Screen Generation Sequence

1. App shell wrapper
2. Dashboard
3. Customers list
4. Customer 360
5. Leads list
6. Pipeline board
7. Opportunity detail
8. Quote builder
9. Orders list
10. Products & inventory
11. Tasks & calendar
12. Omnichannel inbox
13. Conversation detail
14. Reports & analytics
15. AI Copilot
16. Workflow automation
17. Settings & RBAC
18. Audit logs
19. Auth/login
20. Workspace select

## Component Generation Workflow

For each component:
- Create TypeScript props
- Define variants
- Define states
- Apply token-based Tailwind classes
- Add accessibility attributes
- Add permission/read-only handling
- Add Storybook stories
- Avoid backend assumptions

## Token Rules

No raw hex colors, no arbitrary spacing without approval, no per-screen color systems, no duplicated local token objects.

## Folder Structure

```text
app/(auth)
app/(workspace)
app/(crm-os)

components/foundation
components/layout
components/navigation
components/forms
components/data-display
components/domain
components/admin

lib/types
lib/mock-data
lib/domain-types
lib/domain-mock-data
lib/formatters
lib/permissions
lib/navigation
lib/table
lib/forms
lib/design-tokens
lib/utils
```

## AI Rules

AI is auditable assistant layer, not autonomous hidden actor. AI must never silently create, edit, delete, approve, send, assign, or export.

## Anti-Patterns

Forbidden:
- generic admin template look
- marketing landing page sections inside app
- one giant screen component
- untyped props
- hardcoded mock data inside component body
- backend calls during UI-only generation
- AI silently applying changes
- search leaking restricted records
- export ignoring permission rules

## Definition of Done

Component DoD:
- explicit TypeScript props
- token usage
- required variants and states
- accessibility basics
- Storybook stories
- no backend calls

Screen DoD:
- assembled from reusable components
- AppShell applied where required
- realistic mock data
- loading, empty, error, permission states
- responsive behavior
- AI review flow where relevant

Source status: FROM_CHAT_RECONSTRUCTED.
