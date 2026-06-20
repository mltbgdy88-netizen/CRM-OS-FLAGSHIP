CRM OS Module Spec Templates v1


Bu paket, Cursor Factory'nin besleneceği 
tek kaynak gerçeklik (Single Source of Truth)
 katmanıdır.


Amaç:


Sprint Factory Pack
↓
Module Spec
↓
Generator
↓
Cursor Agent
↓
Code


Her modül aynı şablonla tanımlanır.




1. Standart Modül Yapısı


specs/modules/
customer/
├── module.yaml
├── entities.yaml
├── api.yaml
├── permissions.yaml
├── events.yaml
├── ui.yaml
├── tests.yaml
├── acceptance.yaml
└── README.md




2. module.yaml


Modülün ana tanımı


YAML
module: customer
bounded_context: crm
sprint: 3
owner_team: customer-squad
description: 
>
  Customer management module.
status: active
dependencies:
  - auth
  - tenant
  - activity
permissions:
  - crm.customer.read
  - crm.customer.create
  - crm.customer.update
  - crm.customer.delete
events:
  - CustomerCreated
  - CustomerUpdated
ui:
  - /customers
  - /customers/[id]
api_tags:
  - Customers




3. entities.yaml


Domain model tanımı


YAML
entities:
  Customer:
    table: customers
    tenant_scoped: true
    soft_delete: true
    audit_enabled: true
    fields:
      id:
        type: uuid
        primary: true
      tenant_id:
        type: uuid
      customer_no:
        type: string
        unique: true
      name:
        type: string
        required: true
      email:
        type: string
      phone:
        type: string
      status:
        type: enum
        values:
          - active
          - passive
      created_at:
        type: timestamp
      updated_at:
        type: timestamp




4. api.yaml


API sözleşmesi


YAML
resource: customers
routes:
  list:
    method: GET
    path: /api/v1/customers
    permission: crm.customer.read
  detail:
    method: GET
    path: /api/v1/customers/{id}
    permission: crm.customer.read
  create:
    method: POST
    path: /api/v1/customers
    permission: crm.customer.create
  update:
    method: PATCH
    path: /api/v1/customers/{id}
    permission: crm.customer.update
  delete:
    method: DELETE
    path: /api/v1/customers/{id}
    permission: crm.customer.delete




5. permissions.yaml


RBAC matrisi


YAML
permissions:
  crm.customer.read:
    description: Read customers
  crm.customer.create:
    description: Create customer
  crm.customer.update:
    description: Update customer
  crm.customer.delete:
    description: Delete customer
roles:
  admin:
    - crm.customer.read
    - crm.customer.create
    - crm.customer.update
    - crm.customer.delete
  sales_manager:
    - crm.customer.read
    - crm.customer.create
    - crm.customer.update




6. events.yaml


Domain event kataloğu


YAML
events:
  CustomerCreated:
    aggregate: Customer
    payload:
      customerId: uuid
      tenantId: uuid
  CustomerUpdated:
    aggregate: Customer
    payload:
      customerId: uuid
      tenantId: uuid




7. ui.yaml


UI üretim spesifikasyonu


YAML
pages:
  customers_list:
    route: /customers
    layout: table
    filters:
      - status
      - owner
    columns:
      - customer_no
      - name
      - email
      - phone
      - status
    actions:
      - create
      - export
  customer_detail:
    route: /customers/[id]
    tabs:
      - overview
      - contacts
      - activities
      - quotes
      - orders




8. tests.yaml


Otomatik test üretimi


YAML
tests:
  unit:
    - create customer
    - update customer
  integration:
    - list customers
    - get customer detail
  permissions:
    - read permission
    - create permission
  tenant_isolation:
    - cannot read another tenant
  events:
    - CustomerCreated emitted
  api_contract:
    - OpenAPI match




9. acceptance.yaml


Definition Of Done


YAML
acceptance:
  - customer create works
  - customer update works
  - customer delete works
  - permission checks pass
  - tenant isolation pass
  - OpenAPI updated
  - tests passing
  - audit log written
  - events emitted




10. Generator Mapping


Bu dosyalardan üretilecekler:


YAML
module.yaml:
  - NestJS module
  - folder structure
entities.yaml:
  - migrations
  - entities
  - repositories
api.yaml:
  - controller
  - DTO
  - OpenAPI
permissions.yaml:
  - guards
  - permission constants
events.yaml:
  - event classes
  - outbox mappings
ui.yaml:
  - routes
  - pages
  - forms
  - tables
tests.yaml:
  - unit tests
  - integration tests
acceptance.yaml:
  - QA checklist




11. Factory Validation Schema


Her modül CI'da doğrulanır.


module.yaml exists
entities.yaml exists
api.yaml exists
permissions.yaml exists
events.yaml exists
ui.yaml exists
tests.yaml exists
acceptance.yaml exists


Eksik dosya varsa:


FAIL BUILD




12. Cursor Generation Prompt


Read:
module.yaml
entities.yaml
api.yaml
permissions.yaml
events.yaml
ui.yaml
tests.yaml
acceptance.yaml
Generate:
NestJS backend
PostgreSQL migration
OpenAPI
Next.js screens
React Query hooks
Tests
Follow Cursor Rules Pack.
Do not modify unrelated modules.
Ensure:
- tenant isolation
- permission checks
- audit logging
- event publishing
- OpenAPI compliance




13. Enterprise Module Extension


Enterprise modüllerinde ek dosyalar:


security.yaml
audit.yaml
workflow.yaml
approval.yaml


Örnek:


YAML
approval_required:
  create_quote:
    threshold: 100000
    approval_policy:
      quote_approval




14. AI Module Extension


AI sprintlerinde ek dosyalar:


ai.yaml
prompt_templates.yaml
quota.yaml


Örnek:


YAML
ai_feature:
  ask_crm:
    permission:
      ai.ask_crm.use
    quota:
      10000_tokens_month




15. Final Factory Standard


Sprint Factory Pack
↓
Module Spec Templates
↓
Generator
↓
Cursor Agents
↓
Code
↓
Tests
↓
Review
↓
CI
↓
Deploy


Bu noktada artık CRM OS için eksik olan şey sprint değil; 
Generator Pack
, 
Agent Prompt Pack
 ve 
Monorepo Bootstrap Pack
 üretimidir. Bunlar tamamlandığında Cursor üzerinde büyük ölçüde otomatik üretim hattı kurulmuş olur.
