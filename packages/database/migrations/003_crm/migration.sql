-- CRM OS migration band 003_crm
-- Sprint-03 Customer Core entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Customer Core — tenant-owned CRM tables
-- ---------------------------------------------------------------------------

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_tenant_deleted ON customers(tenant_id, deleted_at);

CREATE TABLE customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  title VARCHAR(120),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_contacts_tenant_id ON customer_contacts(tenant_id);
CREATE INDEX idx_customer_contacts_tenant_deleted ON customer_contacts(tenant_id, deleted_at);
CREATE INDEX idx_customer_contacts_customer_id ON customer_contacts(customer_id);

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(80),
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(120),
  region VARCHAR(120),
  postal_code VARCHAR(30),
  country_code VARCHAR(2) NOT NULL DEFAULT 'TR',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_addresses_tenant_id ON customer_addresses(tenant_id);
CREATE INDEX idx_customer_addresses_tenant_deleted ON customer_addresses(tenant_id, deleted_at);
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);

CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_tags_tenant_id ON customer_tags(tenant_id);
CREATE INDEX idx_customer_tags_tenant_deleted ON customer_tags(tenant_id, deleted_at);
CREATE INDEX idx_customer_tags_customer_id ON customer_tags(customer_id);

CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(200),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_notes_tenant_id ON customer_notes(tenant_id);
CREATE INDEX idx_customer_notes_tenant_deleted ON customer_notes(tenant_id, deleted_at);
CREATE INDEX idx_customer_notes_customer_id ON customer_notes(customer_id);

CREATE TABLE customer_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120),
  byte_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_customer_files_tenant_id ON customer_files(tenant_id);
CREATE INDEX idx_customer_files_tenant_deleted ON customer_files(tenant_id, deleted_at);
CREATE INDEX idx_customer_files_customer_id ON customer_files(customer_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — tenant-owned CRM tables (fail closed without app.tenant_id)
-- ---------------------------------------------------------------------------

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customers ON customers
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_contacts ON customer_contacts
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_addresses ON customer_addresses
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_tags ON customer_tags
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_notes ON customer_notes
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE customer_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_files FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customer_files ON customer_files
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Ensure application role can access new CRM tables (created after 002_iam grants)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('003_crm');
