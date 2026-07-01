-- CRM OS migration band 012_product_catalog
-- Sprint-15 Product Catalog entities with PostgreSQL RLS

-- ---------------------------------------------------------------------------
-- Product Catalog — tenant-owned tables
-- ---------------------------------------------------------------------------

CREATE TABLE product_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_product_brands_tenant_code ON product_brands(tenant_id, code);
CREATE INDEX idx_product_brands_tenant_id ON product_brands(tenant_id);
CREATE INDEX idx_product_brands_tenant_deleted ON product_brands(tenant_id, deleted_at);

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(80) NOT NULL,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_product_categories_tenant_code ON product_categories(tenant_id, code);
CREATE INDEX idx_product_categories_tenant_id ON product_categories(tenant_id);
CREATE INDEX idx_product_categories_tenant_deleted ON product_categories(tenant_id, deleted_at);
CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);

CREATE TABLE product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(80) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_product_collections_tenant_code ON product_collections(tenant_id, code);
CREATE INDEX idx_product_collections_tenant_id ON product_collections(tenant_id);
CREATE INDEX idx_product_collections_tenant_deleted ON product_collections(tenant_id, deleted_at);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  brand_id UUID REFERENCES product_brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_products_tenant_sku ON products(tenant_id, sku);
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_tenant_deleted ON products(tenant_id, deleted_at);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_product_variants_tenant_sku ON product_variants(tenant_id, sku);
CREATE INDEX idx_product_variants_tenant_id ON product_variants(tenant_id);
CREATE INDEX idx_product_variants_tenant_deleted ON product_variants(tenant_id, deleted_at);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'TRY',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_product_prices_tenant_id ON product_prices(tenant_id);
CREATE INDEX idx_product_prices_tenant_deleted ON product_prices(tenant_id, deleted_at);
CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX idx_product_prices_variant_id ON product_prices(variant_id);

CREATE TABLE product_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  collection_id UUID NOT NULL REFERENCES product_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_product_collection_items_collection_product
  ON product_collection_items(collection_id, product_id);
CREATE INDEX idx_product_collection_items_tenant_id ON product_collection_items(tenant_id);
CREATE INDEX idx_product_collection_items_tenant_deleted ON product_collection_items(tenant_id, deleted_at);
CREATE INDEX idx_product_collection_items_collection_id ON product_collection_items(collection_id);
CREATE INDEX idx_product_collection_items_product_id ON product_collection_items(product_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — fail closed without app.tenant_id
-- ---------------------------------------------------------------------------

ALTER TABLE product_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_brands FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_brands ON product_brands
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_categories ON product_categories
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_collections ON product_collections
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_products ON products
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_variants ON product_variants
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_prices ON product_prices
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

ALTER TABLE product_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collection_items FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_collection_items ON product_collection_items
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crmos_app;

INSERT INTO schema_migrations (band) VALUES ('012_product_catalog');
