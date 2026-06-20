CRM OS Generator Pack v1


1. Amaç


Module Spec dosyalarından otomatik kod iskeleti üretmek.


Generator Pack şu çıktıları üretir:


NestJS module
PostgreSQL migration
DTO
Controller
Service
Repository
Events
Permissions
OpenAPI tag
Next.js routes
React Query hooks
UI shell
Test skeleton
Docs skeleton




2. Generator Komutu


Bash
pnpm generate:module customer


Opsiyonel:


Bash
pnpm generate:module quote 
--sprint
=
9
pnpm generate:module inventory 
--backend-only
pnpm generate:module dashboard 
--frontend-only
pnpm generate:module payment 
--with-tests




3. Input


specs/modules/{module}/
  module.yaml
  entities.yaml
  api.yaml
  permissions.yaml
  events.yaml
  ui.yaml
  tests.yaml
  acceptance.yaml




4. Output


apps/api/src/modules/{module}/
apps/web/src/features/{module}/
packages/permissions/src/{module}.ts
packages/events/src/{module}.ts
packages/api-client/generated
packages/database/migrations
docs/modules/{module}.md




5. Generator Klasörü


tools/generators/
  module-generator.ts
  backend-generator.ts
  frontend-generator.ts
  migration-generator.ts
  dto-generator.ts
  test-generator.ts
  openapi-generator.ts
  docs-generator.ts
  templates/




6. Template Yapısı


tools/generators/templates/
  backend/
    module.ts.hbs
    controller.ts.hbs
    service.ts.hbs
    repository.ts.hbs
    dto.ts.hbs
    event.ts.hbs
    spec.ts.hbs
  frontend/
    page.tsx.hbs
    list-page.tsx.hbs
    detail-page.tsx.hbs
    form.tsx.hbs
    hooks.ts.hbs
    api.ts.hbs
  database/
    migration.sql.hbs
    rls.sql.hbs
    indexes.sql.hbs
  docs/
    module.md.hbs




7. module-generator.ts Akışı


1. module adını al
2. specs/modules/{module} var mı kontrol et
3. YAML dosyalarını oku
4. Spec validate et
5. Backend dosyalarını üret
6. Migration üret
7. Permission constants üret
8. Event classes üret
9. Frontend shell üret
10. Test skeleton üret
11. Docs üret
12. Özet rapor yaz




8. Generated Backend Structure


apps/api/src/modules/customer/
  customer.module.ts
  controllers/customer.controller.ts
  services/customer.service.ts
  repositories/customer.repository.ts
  dto/create-customer.dto.ts
  dto/update-customer.dto.ts
  events/customer-created.event.ts
  events/customer-updated.event.ts
  tests/customer.service.spec.ts
  tests/customer.controller.spec.ts




9. Generated Frontend Structure


apps/web/src/features/customer/
  routes/customer-list.page.tsx
  routes/customer-detail.page.tsx
  components/customer-form.tsx
  components/customer-table.tsx
  hooks/use-customers.ts
  api/customer.api.ts




10. Generated Migration


Her tenant-owned tablo için:


SQL
tenant_id uuid 
not
 
null
created_at timestamptz 
not
 
null
 
default
 now()
updated_at timestamptz 
not
 
null
 
default
 now()


RLS:


SQL
ALTER
 
TABLE
 customers ENABLE 
ROW
 
LEVEL
 SECURITY;
CREATE
 POLICY tenant_isolation_customers
ON
 customers
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);




11. Permission Constants


TypeScript
export
 
const
 
CustomerPermissions
 
=
 {
  Read: 
'crm.customer.read'
,
  Create: 
'crm.customer.create'
,
  Update: 
'crm.customer.update'
,
  Delete: 
'crm.customer.delete'
,
} 
as
 
const
;




12. Event Constants


TypeScript
export
 
const
 
CustomerEvents
 
=
 {
  Created: 
'CustomerCreated'
,
  Updated: 
'CustomerUpdated'
,
} 
as
 
const
;




13. Generated Controller Standard


Her endpointte zorunlu:


JwtAuthGuard
TenantGuard
PermissionGuard
DTO Validation
OpenAPI decorators


Örnek:


TypeScript
@
UseGuards
(
JwtAuthGuard
, 
TenantGuard
, 
PermissionGuard
)
@
RequirePermission
(
CustomerPermissions
.
Create)
@
Post
()
create(
@
Body
() 
dto
: 
CreateCustomerDto
) {
  
return
 
this
.
customerService
.
create(
dto
);
}




14. Generated Service Standard


Service şunları içermeli:


business validation
repository call
audit log
domain event
transaction boundary




15. Generated Repository Standard


Repository sadece data access yapar.


create
findById
findMany
update
softDelete




16. Test Generator


Üretilecek testler:


unit test
integration test
permission test
tenant isolation test
event emitted test




17. Spec Validator


Bash
pnpm validate:specs


Kontroller:


module.yaml var mı
entities.yaml var mı
api.yaml var mı
permissions.yaml var mı
events.yaml var mı
ui.yaml var mı
tests.yaml var mı
acceptance.yaml var mı
her endpoint permission içeriyor mu
tenant scoped entity tenant_id içeriyor mu
event payload tenantId içeriyor mu




18. Cursor Kullanımı


Cursor prompt:


Run generator for module: customer.
Then complete generated ACTION_ITEMs.
Follow .cursor/rules.
Do not modify unrelated files.
Write tests and make them pass.




19. Quality Gate


Generator çıktısı tamamlanmış sayılmaz; şu komutlar geçmeli:


Bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:specs
pnpm db:migrate




20. Definition of Done


Generator çalışıyor
Spec dosyalarını okuyor
Backend skeleton üretiyor
Frontend skeleton üretiyor
Migration üretiyor
Permission constants üretiyor
Event constants üretiyor
Test skeleton üretiyor
Docs skeleton üretiyor
Spec validation çalışıyor
Cursor üretime hazır


Sonraki paket:


CRM OS Agent Prompt Pack v1
