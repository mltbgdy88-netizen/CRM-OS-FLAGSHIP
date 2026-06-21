-- CRM OS migration band 002_iam
-- Sprint-02 IAM entities with PostgreSQL RLS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS schema_migrations (
  band VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Global / registry tables
-- ---------------------------------------------------------------------------

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  default_currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  timezone VARCHAR(80) NOT NULL DEFAULT 'Europe/Istanbul',
  locale VARCHAR(10) NOT NULL DEFAULT 'tr-TR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password_hash TEXT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(150) NOT NULL UNIQUE,
  module VARCHAR(80) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tenant-owned IAM tables
-- ---------------------------------------------------------------------------

CREATE TABLE tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, user_id)
);

CREATE INDEX idx_tenant_members_tenant_id ON tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_tenant_deleted ON tenant_members(tenant_id, deleted_at);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, code)
);

CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_tenant_deleted ON roles(tenant_id, deleted_at);

CREATE TABLE role_permissions (
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_tenant_id ON role_permissions(tenant_id);

CREATE TABLE member_roles (
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  tenant_member_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (tenant_member_id, role_id)
);

CREATE INDEX idx_member_roles_tenant_id ON member_roles(tenant_id);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_user_id UUID REFERENCES users(id),
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id UUID,
  payload JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_tenant_deleted ON audit_logs(tenant_id, deleted_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(tenant_id, entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- User-owned session/device tables (active tenant context optional)
-- ---------------------------------------------------------------------------

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_tenant_id UUID REFERENCES tenants(id),
  refresh_token_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_tenant_id UUID REFERENCES tenants(id),
  device_fingerprint VARCHAR(255) NOT NULL,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_user_id ON devices(user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — tenant-owned tables (fail closed without app.tenant_id)
-- ---------------------------------------------------------------------------

ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tenant_members ON tenant_members
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_roles ON roles
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_role_permissions ON role_permissions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_roles FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_member_roles ON member_roles
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- User-owned tables — scoped by app.user_id (and tenant when active context set)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY user_isolation_sessions ON sessions
  USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND (
      active_tenant_id IS NULL
      OR active_tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND (
      active_tenant_id IS NULL
      OR active_tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  );

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices FORCE ROW LEVEL SECURITY;
CREATE POLICY user_isolation_devices ON devices
  USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND (
      active_tenant_id IS NULL
      OR active_tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND (
      active_tenant_id IS NULL
      OR active_tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  );

-- ---------------------------------------------------------------------------
-- Application runtime role — DEV / LOCAL ONLY
-- ---------------------------------------------------------------------------
-- WARNING: The crmos_app login below is for local development and CI proof
-- only. It uses a fixed password (crmos_app) and must NOT be used in production.
--
-- Production application DB roles (login, password, rotation, grants) must be
-- provisioned by infra / DevOps outside application migrations — never committed
-- as production secrets and never created with hardcoded passwords in prod.
--
-- Role flags: NOSUPERUSER NOBYPASSRLS — RLS policies apply to this role.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'crmos_app') THEN
    CREATE ROLE crmos_app LOGIN PASSWORD 'crmos_app' NOSUPERUSER NOBYPASSRLS;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE crmos TO crmos_app;
GRANT USAGE ON SCHEMA public TO crmos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('002_iam');
