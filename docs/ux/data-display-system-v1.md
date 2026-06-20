# CRM OS Data Display System v1

## Scope

Enterprise-grade tables, filters, saved views, bulk actions, exports, states, and AI-assisted table actions.

## DataTable Composition

```text
DataTable
├── TableHeaderArea
├── TableToolbar
├── BulkActionBar
├── TableContainer
├── TableFooter
└── OptionalSideDrawer
```

## Variants

Standard, Dense, Selectable, WithPinnedColumn, WithPreviewDrawer, WithBulkActions, WithSavedViews, WithAI, Audit, ReadOnly, Loading, Empty, Error, PermissionDenied.

## Column Definition

Fields:
- id
- label
- accessorKey
- type
- width
- sortable
- filterable
- searchable
- hideable
- pinnable
- exportable
- permission
- renderCell

Column types:
text, entity, person, company, email, phone, money, number, percentage, date, datetime, status, badge, risk, priority, owner, channel, source, stage, progress, inventory, payment, actions, json.

## Cell Components

TextCell, EntityCell, CompanyCell, PersonCell, MoneyCell, NumberCell, PercentageCell, DateCell, RelativeTimeCell, StatusCell, RiskCell, PriorityCell, OwnerCell, ChannelCell, StageCell, InventoryCell, PaymentCell, ActionCell, JSONCell.

## Filters

FilterBar includes SearchInput, QuickFilterGroup, AdvancedFilterButton, ActiveFilterChips, ClearAllButton, SavedViewSelector, ColumnVisibilityButton.

## Saved Views

Saved views store filters, search query, sort, column visibility, order, density, and page size. Views are workspace-scoped and permission-aware.

## Bulk Actions

Bulk actions include assign owner, change status, add tag, export selected, archive, delete, create task, AI summarize, AI suggest next actions. Destructive actions require confirmation.

## Exports

CSV first. XLSX later. Export respects workspace, RBAC, column exportability, and audit.

## Domain Table Examples

Customers, Deals, Quotes, Orders, Products & Inventory, Tasks, Inbox Conversations, Audit Logs.

## AI-Assisted Table Actions

AI table actions open review panel and never silently mutate records.

Source status: FROM_CHAT_RECONSTRUCTED.
