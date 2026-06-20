# CRM OS Component System v1

## Scope

Reusable UI component system for enterprise CRM density, modularity, RBAC, auditability, AI assistive panels, and future multi-tenant SaaS expansion.

## Design Tokens

Color:
- background, border, text, brand, status, CRM domain, finance, AI

Typography:
- font.family.sans
- font.size.xs to 3xl
- font.weight.regular to bold
- lineHeight.tight, normal, relaxed, table

Spacing:
- 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

Radius:
- none, xs, sm, md, lg, xl, 2xl, full

Elevation:
- none, card, cardHover, dropdown, drawer, modal, focus, ai

Size:
- sidebar expanded 280px
- sidebar collapsed 72px
- topbar 64px
- drawer sm 420px, md 560px, lg 720px

## Component Inventory

Foundation:
- Button, IconButton, LinkButton, Badge, StatusBadge, Avatar, Tooltip, Skeleton, EmptyState, ErrorState

Layout:
- AppShell, Sidebar, Topbar, PageHeader, PageSection, Grid, Stack, SplitView, RightPanel, Drawer, Modal, Popover, CommandPalette

Forms:
- Input, PasswordInput, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, DatePicker, CurrencyInput, FilterBar, FormField

Data Display:
- DataTable, TableToolbar, TablePagination, EntityCell, MoneyCell, DateCell, StatusCell, ActionCell, Card, KPIStatCard, Timeline

CRM Domain:
- EntityHeader, CustomerCard, CustomerFactsPanel, CustomerHealthBadge, RiskScoreBadge, RelatedRecordsTabs, FinancialSnapshotCard

Sales:
- KanbanBoard, KanbanColumn, DealCard, PipelineSummaryBar, StageStepper, QuoteLineItemTable, PriceSummaryCard

AI:
- AICopilotPanel, AICommandInput, AIInsightCard, AIReplySuggestion, AITracePanel, AIConfidenceIndicator, AIApprovalControls

Admin:
- MemberTable, RoleEditor, PermissionMatrix, AuditTable, JSONDiffBlock

## Component States

Default, Hover, Focus, Active, Selected, Disabled, Loading, Error, Success, Warning, Empty, ReadOnly, Skeleton, PermissionDenied, RBACRestricted, ApprovalPending, AIApprovalRequired, SLAWarning, SLABreached, PaymentOverdue, InventoryLow.

## Figma Naming

`Category / Component / Variant / State`

## Storybook Structure

Stories grouped by foundations, layout, forms, data-display, crm, sales, omnichannel, ai, reports, admin-security, and states.

## Cursor Master Prompt

Create reusable CRM OS components first. Use Next.js App Router, React, TypeScript, Tailwind CSS, static typed mock data, Storybook-ready architecture, dark-first enterprise styling, RBAC states, AI approval/audit affordances.

Source status: FROM_CHAT_RECONSTRUCTED.
