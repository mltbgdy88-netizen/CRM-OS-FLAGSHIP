# Data Privacy & Compliance Canon v1

## Privacy Capabilities

CRM OS must support:

- Consent records
- Data export request
- Data deletion request
- Data retention policy
- Data masking
- Audit trail
- Sensitive field protection
- Communication consent tracking

## Sensitive Data

Sensitive fields include:

- Password hashes
- API keys
- OAuth tokens
- Webhook secrets
- Personal identifiers
- Financial limits
- Bank account details
- AI prompt inputs containing personal data

## Rules

- Store secrets hashed or encrypted.
- Mask sensitive data in logs and UI where required.
- Exports must respect permissions and tenant scope.
- Deletion must preserve legal/audit requirements where applicable.
