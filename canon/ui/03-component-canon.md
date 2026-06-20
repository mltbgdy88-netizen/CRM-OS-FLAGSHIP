# CRM OS Component Canon

## Generation Order

1. Foundation components
2. Layout components
3. Navigation components
4. Form components
5. Data display components
6. CRM domain components
7. AI components
8. Screen assemblies

## Foundation Components

- Button
- IconButton
- Badge
- Avatar
- Tooltip
- Skeleton
- EmptyState
- ErrorState
- Card
- Drawer
- Modal

## Data Display Components

- DataTable
- FilterBar
- SavedViewSelector
- BulkActionBar
- Pagination
- ExportMenu
- TableCell variants

## Form Components

- Form
- FormField
- TextInput
- Select
- Combobox
- MultiSelect
- DateInput
- CurrencyInput
- FileUpload
- RichTextEditor
- ModalForm
- DrawerForm
- Wizard
- AIFormSuggestion

## Domain Components

- CustomerHeader
- CustomerFactsPanel
- CustomerFinancialSnapshot
- LeadConversionPanel
- OpportunityHeader
- PipelineBoard
- QuoteLineItemTable
- QuotePriceSummary
- OrderFulfillmentTimeline
- InventoryBadge
- TicketSLAIndicator
- MessageThread
- AIDomainInsight

## Rules

- Components must use explicit TypeScript props.
- Components must be Storybook-ready.
- Components must use realistic CRM mock data.
- Components must support permission, loading, empty, error, and read-only states where relevant.
- AI components must never silently mutate records.
