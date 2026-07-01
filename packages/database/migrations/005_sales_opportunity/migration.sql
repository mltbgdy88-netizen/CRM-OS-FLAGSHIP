-- CRM OS migration band 005_sales_opportunity
-- Sprint-07 Opportunity detail entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Opportunity detail — tenant-owned tables (additive; 005_sales frozen)
-- ---------------------------------------------------------------------------

CREATE TABLE opportunity_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(80),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_opportunity_products_tenant_id ON opportunity_products(tenant_id);
CREATE INDEX idx_opportunity_products_tenant_deleted ON opportunity_products(tenant_id, deleted_at);
CREATE INDEX idx_opportunity_products_opportunity_id ON opportunity_products(opportunity_id);

CREATE TABLE opportunity_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
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

CREATE INDEX idx_opportunity_contacts_tenant_id ON opportunity_contacts(tenant_id);
CREATE INDEX idx_opportunity_contacts_tenant_deleted ON opportunity_contacts(tenant_id, deleted_at);
CREATE INDEX idx_opportunity_contacts_opportunity_id ON opportunity_contacts(opportunity_id);

CREATE TABLE opportunity_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  activity_type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_opportunity_activities_tenant_id ON opportunity_activities(tenant_id);
CREATE INDEX idx_opportunity_activities_tenant_deleted ON opportunity_activities(tenant_id, deleted_at);
CREATE INDEX idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);

CREATE TABLE opportunity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
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

CREATE INDEX idx_opportunity_notes_tenant_id ON opportunity_notes(tenant_id);
CREATE INDEX idx_opportunity_notes_tenant_deleted ON opportunity_notes(tenant_id, deleted_at);
CREATE INDEX idx_opportunity_notes_opportunity_id ON opportunity_notes(opportunity_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE opportunity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_opportunity_products ON opportunity_products
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE opportunity_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_contacts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_opportunity_contacts ON opportunity_contacts
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_activities FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_opportunity_activities ON opportunity_activities
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE opportunity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_notes FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_opportunity_notes ON opportunity_notes
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('005_sales_opportunity');
