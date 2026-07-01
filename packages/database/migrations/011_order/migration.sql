-- CRM OS migration band 011_order
-- Sprint-14 Order Operations entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Order Operations — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE order_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier VARCHAR(120),
  tracking_number VARCHAR(120),
  shipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_order_shipments_tenant_id ON order_shipments(tenant_id);
CREATE INDEX idx_order_shipments_tenant_deleted ON order_shipments(tenant_id, deleted_at);
CREATE INDEX idx_order_shipments_order_id ON order_shipments(order_id);

CREATE TABLE order_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_order_deliveries_tenant_id ON order_deliveries(tenant_id);
CREATE INDEX idx_order_deliveries_tenant_deleted ON order_deliveries(tenant_id, deleted_at);
CREATE INDEX idx_order_deliveries_order_id ON order_deliveries(order_id);

CREATE TABLE order_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  returned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_order_returns_tenant_id ON order_returns(tenant_id);
CREATE INDEX idx_order_returns_tenant_deleted ON order_returns(tenant_id, deleted_at);
CREATE INDEX idx_order_returns_order_id ON order_returns(order_id);

CREATE TABLE order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_order_files_tenant_id ON order_files(tenant_id);
CREATE INDEX idx_order_files_tenant_deleted ON order_files(tenant_id, deleted_at);
CREATE INDEX idx_order_files_order_id ON order_files(order_id);

CREATE TABLE order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_order_notes_tenant_id ON order_notes(tenant_id);
CREATE INDEX idx_order_notes_tenant_deleted ON order_notes(tenant_id, deleted_at);
CREATE INDEX idx_order_notes_order_id ON order_notes(order_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE order_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_shipments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_order_shipments ON order_shipments
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_deliveries FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_order_deliveries ON order_deliveries
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE order_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_returns FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_order_returns ON order_returns
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_order_files ON order_files
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_order_notes ON order_notes
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('011_order');
