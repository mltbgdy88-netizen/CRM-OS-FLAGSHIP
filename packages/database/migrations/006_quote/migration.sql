-- CRM OS migration band 006_quote
-- Sprint-09 Quote Core entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Quote Core — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  number VARCHAR(80) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  margin_percent INTEGER NOT NULL DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'TRY',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_quotes_tenant_number ON quotes(tenant_id, number);
CREATE INDEX idx_quotes_tenant_id ON quotes(tenant_id);
CREATE INDEX idx_quotes_tenant_deleted ON quotes(tenant_id, deleted_at);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_opportunity_id ON quotes(opportunity_id);

CREATE TABLE quote_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label VARCHAR(120),
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_versions_tenant_id ON quote_versions(tenant_id);
CREATE INDEX idx_quote_versions_tenant_deleted ON quote_versions(tenant_id, deleted_at);
CREATE INDEX idx_quote_versions_quote_id ON quote_versions(quote_id);

CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(15, 2) NOT NULL,
  line_total NUMERIC(15, 2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_items_tenant_id ON quote_items(tenant_id);
CREATE INDEX idx_quote_items_tenant_deleted ON quote_items(tenant_id, deleted_at);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

CREATE TABLE quote_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  discount_type VARCHAR(30) NOT NULL DEFAULT 'percent',
  value NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_discounts_tenant_id ON quote_discounts(tenant_id);
CREATE INDEX idx_quote_discounts_tenant_deleted ON quote_discounts(tenant_id, deleted_at);
CREATE INDEX idx_quote_discounts_quote_id ON quote_discounts(quote_id);

CREATE TABLE quote_taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  rate_percent NUMERIC(5, 2) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quote_taxes_tenant_id ON quote_taxes(tenant_id);
CREATE INDEX idx_quote_taxes_tenant_deleted ON quote_taxes(tenant_id, deleted_at);
CREATE INDEX idx_quote_taxes_quote_id ON quote_taxes(quote_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quotes ON quotes
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_versions ON quote_versions
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_items ON quote_items
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_discounts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_discounts ON quote_discounts
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE quote_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_taxes FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_quote_taxes ON quote_taxes
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('006_quote');
