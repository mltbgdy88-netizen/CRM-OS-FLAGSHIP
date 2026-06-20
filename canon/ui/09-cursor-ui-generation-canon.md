# CRM OS Cursor UI Generation Canon

## Cursor Rule

Cursor must generate UI in this order:

1. Tokens
2. Foundation components
3. Layout/AppShell
4. Forms
5. Data display
6. Domain components
7. AI components
8. Storybook
9. Screens

## Forbidden

- Backend calls during UI-only generation
- Raw colors
- One giant screen component
- Untyped props
- Random gradients
- Generic admin template visuals
- AI actions without review
- Screens without loading/empty/error/permission states

## Required Output Per UI Task

- Component code
- Types
- Mock data
- Storybook stories
- Responsive behavior
- Accessibility basics
- Permission states
- AI review flow where relevant
