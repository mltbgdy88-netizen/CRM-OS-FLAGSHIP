# CRM OS Form & Input System v1

## Scope

Enterprise data entry, validation, modal forms, drawer forms, wizards, CRM forms, AI-assisted form filling, file upload, and accessibility.

## Form Architecture

```text
Form
├── FormHeader
├── FormBody
├── ValidationSummary
├── FormFooter
└── AI Assist
```

Variants:
- Standard, Compact, Drawer, Modal, Wizard, InlineEdit, ReadOnly, Approval, Admin, AIReviewed, PermissionRestricted

## Input Inventory

TextInput, PasswordInput, EmailInput, PhoneInput, URLInput, SearchInput, Textarea, MaskedInput, NumberInput, CurrencyInput, PercentageInput, DateInput, TimeInput, DateTimeInput, DateRangeInput, Select, MultiSelect, Combobox, Checkbox, RadioGroup, Switch, FileUpload, RichTextEditor, TagInput.

## Field Anatomy

- Label
- Required indicator
- Field control
- Help text
- Validation message
- Character counter
- Permission note
- AI suggestion

## Select and Combobox

Select for limited options such as status, stage, priority, payment status, role, permission scope.

Combobox for large/dynamic options such as customer, contact, product, owner, branch, related entity, tag.

## Validation Framework

Layers:
- Client-side
- Schema
- Permission
- Business rule
- Future server-side and async

Types:
required, min/max length, pattern, email, phone, url, number min/max, date range, currency precision, unique, permission_required, business_rule.

## Modal, Drawer, Wizard Forms

Modal for quick create and confirmation. Drawer for contextual create/edit. Wizard for onboarding, import, automation, role setup, quote generation, channel setup.

## CRM Domain Form Examples

Create Customer, Create Deal, Create Quote, Create Order, Product Form, Task Form, User & Role Form.

## AI Assisted Form Filling

AI may suggest fields, autofill draft, detect duplicate, recommend owner, or warn about missing info. AI never submits or overwrites without approval.

Source status: FROM_CHAT_RECONSTRUCTED.
