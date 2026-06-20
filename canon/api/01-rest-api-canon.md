# CRM OS REST API Canon v1

## 1. API Mission

CRM OS API, multi-tenant SaaS CRM platformunun resmi uygulama sözleşmesidir.

Ana hedef:
- Tenant izolasyonu
- Permission kontrollü erişim
- Tutarlı response formatı
- Audit ve event üretimi
- OpenAPI-first geliştirme
- Cursor için deterministik endpoint üretimi

## 2. Base Path

```txt
/api/v1
```

## 3. Resource Naming

Kurallar:

```txt
- URL path lowercase ve kebab-case olmalı.
- Koleksiyon endpointleri çoğul olmalı.
- Action endpointleri sadece domain davranışı için kullanılmalı.
- CRUD dışı işlemler açık fiil içerebilir.
```

Örnek:

```txt
GET    /customers
POST   /customers
GET    /customers/{id}
PATCH  /customers/{id}
DELETE /customers/{id}

POST   /leads/{id}/convert
POST   /quotes/{id}/send
POST   /quotes/{id}/approve
POST   /quotes/{id}/convert-to-order
POST   /orders/{id}/reserve-stock
```

## 4. Standard Request Headers

```txt
Authorization: Bearer <jwt>
X-Tenant-Id: <tenant_uuid>
X-Request-Id: <uuid optional>
Idempotency-Key: <uuid optional for mutating commands>
```

## 5. Standard Response Format

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-20T12:00:00Z"
  }
}
```

List response:

```json
{
  "data": [],
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-20T12:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "total": 120
    }
  }
}
```

## 6. Error Format

```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found",
    "details": {},
    "requestId": "uuid"
  }
}
```

## 7. Pagination Canon

Varsayılan:

```txt
page=1
pageSize=25
```

Limit:

```txt
max pageSize = 100
```

Büyük veri için ileride cursor pagination desteklenebilir.

## 8. Filtering Canon

Basit filtreler query param ile alınır:

```txt
GET /customers?status=active&ownerId=<uuid>
GET /quotes?status=sent&customerId=<uuid>
```

Karmaşık raporlama filtreleri Report Builder veya Analytics API üzerinden yapılır.

## 9. Sorting Canon

```txt
sort=createdAt:desc
sort=name:asc
```

Whitelist dışı alanlarda sort yapılmaz.

## 10. Idempotency Canon

Mutating command endpointleri desteklemelidir:

```txt
POST /payments
POST /orders/{id}/reserve-stock
POST /quotes/{id}/convert-to-order
```

Idempotency key aynı tenant altında saklanır.

## 11. Tenant Canon

Her request tenant context kurmalıdır:

```sql
SET app.tenant_id = '<tenant_uuid>';
SET app.user_id = '<user_uuid>';
```

API seviyesinde tenant kontrolü yeterli değildir; PostgreSQL RLS zorunludur.

## 12. Cursor Endpoint Rule

Cursor endpoint üretirken şu sırayı izler:

```txt
1. OpenAPI contract güncelle.
2. DTO oluştur.
3. Permission code belirle.
4. Controller method ekle.
5. Service method ekle.
6. Repository/query method ekle.
7. Audit log ekle.
8. Event emission ekle.
9. Test ekle.
```
