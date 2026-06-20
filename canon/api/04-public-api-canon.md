# CRM OS Public API Canon v1

## 1. Purpose

Public API dış sistemlerin CRM OS ile güvenli ve sınırlı entegrasyon kurmasını sağlar.

## 2. Authentication

Desteklenen modeller:

```txt
API Key
OAuth2 Client Credentials
OAuth2 Authorization Code
```

## 3. API Key Rules

```txt
- Key plaintext sadece oluşturulurken gösterilir.
- DB içinde hash olarak saklanır.
- Key tenant scoped olmalıdır.
- Scope bazlı yetkilendirme zorunludur.
- Last used timestamp tutulur.
```

## 4. Scopes

```txt
customers:read
customers:write
leads:read
leads:write
quotes:read
quotes:write
orders:read
orders:write
inventory:read
payments:read
tickets:read
tickets:write
webhooks:manage
```

## 5. Rate Limit

Varsayılan:

```txt
1000 request / hour / tenant / api key
```

Enterprise planlarda artırılabilir.

## 6. Public API Restrictions

Public API şunları yapamaz:

```txt
- Tenant değiştiremez.
- Kullanıcı parolası yönetemez.
- Internal audit log silemez.
- RLS bypass edemez.
- Yetkisiz export yapamaz.
```

## 7. Developer Portal

Public API dokümantasyonu `/docs/api/openapi-contract-v1.md` ve OpenAPI spec üzerinden yayınlanır.

## 8. Cursor Rule

Public API endpointleri üretirken Cursor:
- scope kontrolü ekler,
- rate limit metadata tanımlar,
- audit log üretir,
- API usage log ekler.
