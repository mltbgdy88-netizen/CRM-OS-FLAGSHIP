Sprint-31 Enterprise Security Factory Pack v1


Sprint Objective


Sprint-30:
Public API → Webhooks → Signed Delivery → Retry → Logs
Sprint-31:
Enterprise Security → SSO Prep → IP Rules → Sessions → Security Events → Advanced Audit


Bu sprint sonunda CRM OS, kurumsal müşteri güvenlik gereksinimlerini karşılayacak temel güvenlik katmanına ulaşır.




Factory Metadata


YAML
sprint: 31
name: Enterprise Security
duration: 2 weeks
depends_on:
  - Sprint-2 Auth + Tenant + IAM
  - Sprint-29 Public API
  - Sprint-30 Webhook Platform
output:
  - enterprise security module
  - SSO provider preparation
  - IP allowlist
  - session management
  - security events
  - advanced audit foundation




Business Scope


Included:
SSO provider config shell
SAML/OIDC preparation
IP allowlist rules
Session/device management
Force logout
Security events
Suspicious login detection foundation
Sensitive action re-auth
Advanced audit filters
Audit export foundation
Excluded:
Full SAML production integration
Full SCIM provisioning
SIEM integration
Device fingerprint ML
Advanced threat detection




Domain Model


YAML
sso_providers:
  id: uuid
  tenant_id: uuid
  provider_type: enum
  name: string
  status: enum
  config_json: jsonb
  created_at: timestamp
  updated_at: timestamp
tenant_ip_rules:
  id: uuid
  tenant_id: uuid
  rule_type: enum
  cidr: string
  description: text
  is_active: boolean
  created_at: timestamp
user_sessions:
  id: uuid
  tenant_id: uuid
  user_id: uuid
  refresh_token_hash: string
  ip_address: inet
  user_agent: text
  device_name: string
  status: enum
  last_seen_at: timestamp
  expires_at: timestamp
  revoked_at: timestamp
  created_at: timestamp
security_events:
  id: uuid
  tenant_id: uuid
  user_id: uuid
  event_type: string
  severity: enum
  ip_address: inet
  user_agent: text
  metadata_json: jsonb
  created_at: timestamp
sensitive_action_challenges:
  id: uuid
  tenant_id: uuid
  user_id: uuid
  action: string
  status: enum
  expires_at: timestamp
  verified_at: timestamp
  created_at: timestamp




Status Values


sso_provider:
draft
active
disabled
ip_rule:
allow
deny
session:
active
revoked
expired
security_event_severity:
low
medium
high
critical
challenge:
pending
verified
expired
failed




Events


YAML
events:
  - SsoProviderCreated
  - SsoProviderUpdated
  - IpRuleCreated
  - IpRuleMatched
  - SessionCreated
  - SessionRevoked
  - AllSessionsRevoked
  - SecurityEventDetected
  - SensitiveActionChallengeCreated
  - SensitiveActionVerified
  - AuditExportRequested




Permissions


YAML
permissions:
  - security.sso.read
  - security.sso.manage
  - security.ip_rules.read
  - security.ip_rules.manage
  - security.session.read
  - security.session.revoke
  - security.event.read
  - security.audit.advanced_read
  - security.audit.export




API Contract


http
GET    /api/v1/security/sso-providers
POST   /api/v1/security/sso-providers
GET    /api/v1/security/sso-providers/{id}
PATCH  /api/v1/security/sso-providers/{id}
POST   /api/v1/security/sso-providers/{id}/test
POST   /api/v1/security/sso-providers/{id}/disable
GET    /api/v1/security/ip-rules
POST   /api/v1/security/ip-rules
PATCH  /api/v1/security/ip-rules/{id}
DELETE /api/v1/security/ip-rules/{id}
GET    /api/v1/security/sessions
POST   /api/v1/security/sessions/{id}/revoke
POST   /api/v1/security/sessions/revoke-all
GET    /api/v1/security/events
POST   /api/v1/security/challenges
POST   /api/v1/security/challenges/{id}/verify
GET    /api/v1/audit-logs/advanced
POST   /api/v1/audit-logs/export




Business Rules


SSO config shell şifreli config_json saklamalıdır.
SSO secret değerleri response içinde maskelenmelidir.
IP allowlist aktifse login request IP kuralından geçmelidir.
Deny rule allow rule’dan önceliklidir.
Session revoke refresh token’ı geçersiz yapmalıdır.
Revoke all mevcut user’ın tüm aktif sessionlarını kapatmalıdır.
Security event kritik ise notification oluşturulmalıdır.
Sensitive action challenge olmadan kritik işlem yapılamaz.
Audit export async job olarak çalışmalıdır.
Audit export permission ve re-auth gerektirir.




Sensitive Actions


api_key.create
api_key.revoke
webhook.create
webhook.delete
role.permission.update
user.deactivate
payment.cancel
stock.adjust
audit.export
security.sso.manage
security.ip_rules.manage




PostgreSQL Migration Pack


SQL
sso_providers
tenant_ip_rules
user_sessions
security_events
sensitive_action_challenges
audit_exports


Indexes:


SQL
idx_sso_provider_tenant
idx_ip_rules_tenant
idx_sessions_user
idx_sessions_status
idx_security_events_tenant
idx_security_events_type
idx_security_events_severity
idx_challenges_user_status


RLS:


tenant_id enforced on all enterprise security tables




Guard / Middleware Pack


IpAllowlistGuard
SensitiveActionGuard
SessionStatusGuard
SecurityEventInterceptor
AdvancedAuditInterceptor




NestJS Source Tree


modules/security/
├── sso/
├── ip-rules/
├── sessions/
├── security-events/
├── sensitive-actions/
├── audit-export/
├── guards/
├── dto/
├── events/
└── tests/




Frontend Scope


Routes:


/settings/security
/settings/security/sso
/settings/security/ip-rules
/settings/security/sessions
/settings/security/events
/settings/audit
/settings/audit/export


Components:


SecurityOverview
SsoProviderList
SsoProviderForm
IpRuleTable
SessionTable
RevokeSessionButton
SecurityEventsTable
SensitiveActionModal
AdvancedAuditTable
AuditExportDrawer




Cursor Agent Tasks


Backend Agent


YAML
generate:
  - security module
  - SSO provider config shell
  - IP allowlist guard
  - session management APIs
  - security event service
  - sensitive action challenge service
  - advanced audit export APIs
  - tests


Frontend Agent


YAML
generate:
  - security settings screens
  - SSO provider form
  - IP rules screen
  - session management screen
  - security events table
  - audit export drawer
  - sensitive action modal


QA Agent


YAML
generate:
  - IP allowlist tests
  - session revoke tests
  - sensitive action tests
  - security event tests
  - audit export tests
  - permission tests
  - tenant isolation tests




Test Factory


create SSO provider
mask SSO secrets in response
create IP allow rule
deny rule blocks login
allow rule permits login
session list works
revoke session blocks refresh
revoke all sessions works
security event created
sensitive action without challenge blocked
sensitive action with challenge allowed
audit export requires permission
cross tenant security access blocked




Quality Gates


lint
typecheck
unit tests
integration tests
security tests
permission tests
tenant isolation tests
OpenAPI validation




Definition of Done


SSO provider shell çalışıyor
SSO secret masking çalışıyor
IP allowlist/denylist çalışıyor
Session revoke çalışıyor
Security events oluşuyor
Sensitive action challenge çalışıyor
Advanced audit filtreleri çalışıyor
Audit export job tetikleniyor
Permission kontrolü çalışıyor
Tenant izolasyonu geçiyor
Tests passing




Output Package


Enterprise Security
→ SSO Prep
→ IP Rules
→ Session Control
→ Security Events
→ Sensitive Action Re-Auth
→ Advanced Audit


Sonraki üretim paketi:


Sprint-32 Enterprise Hardening Factory Pack v1
