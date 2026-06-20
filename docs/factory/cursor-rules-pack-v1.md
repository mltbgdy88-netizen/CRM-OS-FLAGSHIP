CRM OS Cursor Rules Pack v1


1. Klasör Yapısı


.cursor/
  rules/
    00-global.md
    01-architecture.md
    02-backend.md
    03-database.md
    04-security.md
    05-permissions.md
    06-events.md
    07-frontend.md
    08-ui-design.md
    09-testing.md
    10-devops.md




2. 00-global.md


Markdown
# Global Rules
- Spec dışına çıkma.
- Sprint Factory Pack dışındaki kapsamı üretme.
- Önce mevcut kodu oku, sonra değişiklik yap.
- Büyük refactor yapma; küçük, izole değişiklik yap.
- Her yeni feature test içermeli.
- Her endpoint OpenAPI ile uyumlu olmalı.
- Tenant isolation kırılırsa iş tamamlanmış sayılmaz.
- Permission check yoksa endpoint tamamlanmış sayılmaz.




3. 01-architecture.md


Markdown
# Architecture Rules
- Monorepo yapısına uy.
- Backend NestJS module-first ilerlemeli.
- Her domain bounded context içinde kalmalı.
- Cross-module erişim service/event üzerinden yapılmalı.
- Kritik iş aksiyonları domain event üretmeli.
- Outbox pattern kullanılmalı.
- Controller içinde business logic yazma.
- Service iş kuralı içerir.
- Repository sadece data access yapar.




4. 02-backend.md


Markdown
# Backend Rules
- Her endpoint DTO kullanmalı.
- DTO validation zorunlu.
- Response DTO kullanılmalı.
- Controller sadece request/response yönetir.
- Business logic service içinde olmalı.
- Database erişimi repository içinde olmalı.
- Transaction gereken işlemlerde atomic işlem yapılmalı.
- Audit/event side effectleri service seviyesinde yönetilmeli.
- Hata mesajları production’da sensitive bilgi sızdırmamalı.




5. 03-database.md


Markdown
# Database Rules
- Her tenant-owned tabloda tenant_id zorunlu.
- Her tenant-owned tablo RLS aktif olmalı.
- Soft delete gereken tablolarda deleted_at olmalı.
- created_at ve updated_at zorunlu.
- Para alanları decimal/numeric olmalı.
- Foreign key ilişkileri açık tanımlanmalı.
- Indexsiz filtre kolonları bırakma.
- Migration rollback düşünülmeli.
- Ledger/audit/event tabloları immutable kabul edilmeli.




6. 04-security.md


Markdown
# Security Rules
- Public endpoint dışında JWT zorunlu.
- TenantGuard zorunlu.
- PermissionGuard zorunlu.
- IDOR kontrolü zorunlu.
- Cross-tenant erişim engellenmeli.
- Secret, token, password loglanmaz.
- API key hash saklanır.
- Webhook secret maskelenir.
- Portal kullanıcıları customer_self scope dışına çıkamaz.
- Dealer kullanıcıları dealer scope dışına çıkamaz.




7. 05-permissions.md


Markdown
# Permission Rules
- Her endpoint permission belirtmeli.
- Frontend permission sadece görünürlük içindir.
- Backend permission zorunlu güvenlik katmanıdır.
- Field-level permission gereken alanlar maskelenmeli.
- Finance, margin, cost, audit, AI debug alanları özel izin ister.
- Permission değişikliği audit log yazmalı.




8. 06-events.md


Markdown
# Event Rules
- Kritik domain aksiyonları event üretmeli.
- Event isimleri past tense olmalı.
- Event payload minimal olmalı.
- Event payload secret/token içermemeli.
- Event tenant_id içermeli.
- Handler idempotent olmalı.
- Event outbox üzerinden publish edilmeli.




9. 07-frontend.md


Markdown
# Frontend Rules
- Next.js + TypeScript kullanılmalı.
- API çağrıları api-client üzerinden yapılmalı.
- TanStack Query kullanılmalı.
- Formlar React Hook Form + Zod ile olmalı.
- Permission-aware UI kullanılmalı.
- Loading, empty, error state zorunlu.
- Optimistic update rollback içermeli.
- Componentler küçük ve tekrar kullanılabilir olmalı.




10. 08-ui-design.md


Markdown
# UI Design Rules
- Dark-first tasarım.
- Siyah/graphite zemin.
- Cam hissi veren yüzeyler.
- High-density enterprise layout.
- 8px grid.
- 16px radius.
- Minimal border.
- Soft shadow.
- Neon accent dikkatli kullanılmalı.
- CRM OS design system dışına çıkma.




11. 09-testing.md


Markdown
# Testing Rules
- Unit test zorunlu.
- Integration test zorunlu.
- Permission test zorunlu.
- Tenant isolation test zorunlu.
- Critical flow için Playwright E2E yazılmalı.
- Finance calculation testleri zorunlu.
- AI context isolation testleri zorunlu.
- Webhook signature testleri zorunlu.
- Test kırmızıysa PR hazır değildir.




12. 10-devops.md


Markdown
# DevOps Rules
- Docker build kırılmamalı.
- Migration CI’da çalışmalı.
- OpenAPI validation CI’da çalışmalı.
- Security scan CI’da çalışmalı.
- Secrets image içine gömülmemeli.
- Production deploy human approval ister.
- Rollback planı olmayan release çıkmaz.




13. Cursor Kullanım Komutu


Use .cursor/rules.
Read the sprint factory pack.
Read module specs.
Generate only the requested module.
Do not change unrelated files.
Write tests.
Update OpenAPI.
Ensure tenant isolation and permission checks.


Sonraki çıktı: 
CRM OS Module Spec Templates v1
.
