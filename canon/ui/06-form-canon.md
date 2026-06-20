# CRM OS Form Canon

## Purpose

Forms manage all create, edit, approval, configuration, and wizard workflows.

## Required Form Types

- PageForm
- DrawerForm
- ModalForm
- InlineEdit
- Wizard
- ApprovalForm
- AIReviewedForm

## Rules

- Labels must always be visible.
- Placeholder is not a label.
- Dirty state must be tracked.
- Unsaved changes must be protected.
- Required fields must be programmatically identified.
- Permission-restricted fields must not silently submit unauthorized data.
- AI must never submit forms automatically.
- AI-filled values require user review.

## Validation

- Field-level validation near fields.
- Form-level validation summary for long forms.
- Errors must explain what to fix.
- Validation must not rely only on color.
