# CRM OS Master API Canon Layer v1

Bu klasör CRM OS API üretimi için kanonik kaynak katmanıdır.

Kural:
- `/canon/api` içindeki kararlar `/docs/api`, `/specs/api` ve Cursor üretim görevlerinden üstündür.
- API üretimi OpenAPI uyumlu, tenant-safe, permission-aware ve event-aware olmalıdır.
- Cursor endpoint üretmeden önce bu klasörü, `AGENTS.md`, `.cursor/rules` ve ilgili sprint spec dosyasını okumalıdır.
