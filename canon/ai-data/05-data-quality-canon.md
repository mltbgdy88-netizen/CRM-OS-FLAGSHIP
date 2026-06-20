# CRM OS Data Quality Canon

## Purpose

Data quality protects CRM OS from becoming a polluted customer database.

## Core Capabilities

- Duplicate detection
- Customer merge suggestions
- Missing field detection
- Email/phone validation
- Address normalization
- Inactive customer detection
- Stale opportunity detection
- Invalid product data detection
- Import validation
- Data quality scoring

## Data Quality Signals

```text
duplicate_probability
missing_required_fields
invalid_email
invalid_phone
stale_record
conflicting_owner
missing_consent
outdated_price
orphaned_record
```

## AI Role

AI may suggest cleanup but must not merge/delete records automatically.
