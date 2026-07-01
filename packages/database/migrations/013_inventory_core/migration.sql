-- CRM OS migration band 013_inventory_core
-- Sprint-16 Inventory Core entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Inventory Core — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_warehouses_tenant_code ON warehouses(tenant_id, code);
CREATE INDEX idx_warehouses_tenant_id ON warehouses(tenant_id);
CREATE INDEX idx_warehouses_tenant_deleted ON warehouses(tenant_id, deleted_at);

CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_warehouse_locations_warehouse_code
  ON warehouse_locations(warehouse_id, code);
CREATE INDEX idx_warehouse_locations_tenant_id ON warehouse_locations(tenant_id);
CREATE INDEX idx_warehouse_locations_tenant_deleted ON warehouse_locations(tenant_id, deleted_at);
CREATE INDEX idx_warehouse_locations_warehouse_id ON warehouse_locations(warehouse_id);

CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity_on_hand NUMERIC(18, 3) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(18, 3) NOT NULL DEFAULT 0,
  quantity_available NUMERIC(18, 3) NOT NULL DEFAULT 0,
  critical_level NUMERIC(18, 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_stocks_tenant_warehouse_variant
  ON stocks(tenant_id, warehouse_id, product_variant_id);
CREATE INDEX idx_stocks_tenant_id ON stocks(tenant_id);
CREATE INDEX idx_stocks_tenant_deleted ON stocks(tenant_id, deleted_at);
CREATE INDEX idx_stocks_warehouse_id ON stocks(warehouse_id);
CREATE INDEX idx_stocks_product_variant_id ON stocks(product_variant_id);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  stock_id UUID REFERENCES stocks(id) ON DELETE SET NULL,
  movement_type VARCHAR(30) NOT NULL,
  quantity NUMERIC(18, 3) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  movement_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_stock_movements_tenant_id ON stock_movements(tenant_id);
CREATE INDEX idx_stock_movements_tenant_deleted ON stock_movements(tenant_id, deleted_at);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_product_variant_id ON stock_movements(product_variant_id);
CREATE INDEX idx_stock_movements_stock_id ON stock_movements(stock_id);
CREATE INDEX idx_stock_movements_movement_at ON stock_movements(movement_at);

CREATE TABLE stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  counted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_stock_counts_tenant_id ON stock_counts(tenant_id);
CREATE INDEX idx_stock_counts_tenant_deleted ON stock_counts(tenant_id, deleted_at);
CREATE INDEX idx_stock_counts_warehouse_id ON stock_counts(warehouse_id);

CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  stock_count_id UUID REFERENCES stock_counts(id) ON DELETE SET NULL,
  quantity_before NUMERIC(18, 3) NOT NULL,
  quantity_after NUMERIC(18, 3) NOT NULL,
  adjustment_quantity NUMERIC(18, 3) NOT NULL,
  reason TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_stock_adjustments_tenant_id ON stock_adjustments(tenant_id);
CREATE INDEX idx_stock_adjustments_tenant_deleted ON stock_adjustments(tenant_id, deleted_at);
CREATE INDEX idx_stock_adjustments_stock_id ON stock_adjustments(stock_id);
CREATE INDEX idx_stock_adjustments_warehouse_id ON stock_adjustments(warehouse_id);
CREATE INDEX idx_stock_adjustments_product_variant_id ON stock_adjustments(product_variant_id);
CREATE INDEX idx_stock_adjustments_stock_count_id ON stock_adjustments(stock_count_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_warehouses ON warehouses
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_warehouse_locations ON warehouse_locations
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_stocks ON stocks
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_stock_movements ON stock_movements
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE stock_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_counts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_stock_counts ON stock_counts
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_stock_adjustments ON stock_adjustments
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('013_inventory_core');
