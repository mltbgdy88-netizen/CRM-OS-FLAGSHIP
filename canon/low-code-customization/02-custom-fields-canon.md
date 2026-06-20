# CRM OS Custom Fields Canon

## Supported Field Types

- text
- textarea
- number
- currency
- percentage
- date
- datetime
- boolean
- select
- multi_select
- user_reference
- entity_reference
- file_reference
- json_limited

## Storage Strategy

Initial implementation should use controlled metadata tables:

- custom_fields
- custom_field_options
- custom_field_values

## Rules

- Every custom field must be tenant-scoped.
- Every custom field must declare entity_type.
- Every custom field must have validation metadata.
- Sensitive fields must support masking.
- Custom fields must respect permission checks.
- Custom field values must be audit logged.
