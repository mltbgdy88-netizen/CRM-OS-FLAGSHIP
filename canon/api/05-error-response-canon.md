# CRM OS Error Response Canon v1

## 1. Standard Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": []
    },
    "requestId": "uuid"
  }
}
```

## 2. Error Code Naming

```txt
MODULE_REASON
```

Examples:

```txt
CUSTOMER_NOT_FOUND
LEAD_ALREADY_CONVERTED
QUOTE_APPROVAL_REQUIRED
ORDER_STOCK_NOT_AVAILABLE
PAYMENT_AMOUNT_INVALID
PERMISSION_DENIED
TENANT_CONTEXT_MISSING
VALIDATION_ERROR
RATE_LIMIT_EXCEEDED
```

## 3. HTTP Status Mapping

```txt
400 VALIDATION_ERROR
401 UNAUTHENTICATED
403 PERMISSION_DENIED
404 NOT_FOUND
409 CONFLICT
422 BUSINESS_RULE_VIOLATION
429 RATE_LIMIT_EXCEEDED
500 INTERNAL_ERROR
```

## 4. Security Rule

Error messages must not leak:

```txt
- another tenant's record existence
- secret values
- raw SQL errors
- internal stack traces
- provider tokens
```

## 5. Validation Error Details

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": [
        {
          "field": "email",
          "message": "Email is required"
        }
      ]
    }
  }
}
```

## 6. Cursor Error Rule

Cursor must not return ad-hoc errors. Every endpoint must use centralized error helpers.
