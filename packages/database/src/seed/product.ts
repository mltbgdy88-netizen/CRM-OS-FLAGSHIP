import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_PRODUCT_PERMISSIONS } from './constants';

export async function seedProductData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_PRODUCT_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_PRODUCT_PERMISSIONS) {
      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantDefault, SEED_IDS.roleAdmin, permission.id],
      );

      await client.query(
        `INSERT INTO role_permissions (tenant_id, role_id, permission_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [SEED_IDS.tenantB, SEED_IDS.roleTenantB, permission.id],
      );
    }

    await client.query(
      `INSERT INTO product_brands (id, tenant_id, name, code, created_by)
       VALUES ($1, $2, 'CRM OS', 'crm-os', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.productBrandDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO product_brands (id, tenant_id, name, code, created_by)
       VALUES ($1, $2, 'Tenant B Labs', 'tenant-b-labs', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.productBrandTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO product_categories (id, tenant_id, name, code, created_by)
       VALUES ($1, $2, 'Software Licenses', 'software-licenses', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.productCategoryDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO product_categories (id, tenant_id, name, code, created_by)
       VALUES ($1, $2, 'Platform Services', 'platform-services', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.productCategoryTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO product_collections (id, tenant_id, name, code, description, created_by)
       VALUES ($1, $2, 'Flagship Catalog', 'flagship', 'Default tenant flagship product collection.', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.productCollectionDefault, SEED_IDS.tenantDefault, SEED_IDS.userAdmin],
    );

    await client.query(
      `INSERT INTO product_collections (id, tenant_id, name, code, description, created_by)
       VALUES ($1, $2, 'Tenant B Essentials', 'essentials', 'Tenant B starter product collection.', $3)
       ON CONFLICT (id) DO NOTHING`,
      [SEED_IDS.productCollectionTenantB, SEED_IDS.tenantB, SEED_IDS.userMemberB],
    );

    await client.query(
      `INSERT INTO products (
         id, tenant_id, sku, name, description, status, brand_id, category_id, created_by
       )
       VALUES ($1, $2, 'CRM-ENT-001', 'CRM OS Enterprise License',
               'Annual enterprise subscription license.', 'active', $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.productBrandDefault,
        SEED_IDS.productCategoryDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO products (
         id, tenant_id, sku, name, description, status, brand_id, category_id, created_by
       )
       VALUES ($1, $2, 'TB-PLT-001', 'Tenant B Platform Bundle',
               'Two-seat platform bundle for tenant B.', 'active', $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.productBrandTenantB,
        SEED_IDS.productCategoryTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO product_variants (
         id, tenant_id, product_id, sku, name, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'CRM-ENT-001-STD', 'Standard Edition', 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productVariantDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.productDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO product_variants (
         id, tenant_id, product_id, sku, name, sort_order, created_by
       )
       VALUES ($1, $2, $3, 'TB-PLT-001-BASE', 'Base Bundle', 1, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productVariantTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.productTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO product_prices (
         id, tenant_id, product_id, variant_id, amount, currency_code, is_default, created_by
       )
       VALUES ($1, $2, $3, NULL, 95000, 'TRY', TRUE, $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productPriceDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.productDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO product_prices (
         id, tenant_id, product_id, variant_id, amount, currency_code, is_default, created_by
       )
       VALUES ($1, $2, $3, $4, 105000, 'TRY', FALSE, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productPriceVariantDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.productDefault,
        SEED_IDS.productVariantDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO product_prices (
         id, tenant_id, product_id, variant_id, amount, currency_code, is_default, created_by
       )
       VALUES ($1, $2, $3, $4, 64000, 'TRY', TRUE, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productPriceTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.productTenantB,
        SEED_IDS.productVariantTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO product_collection_items (
         id, tenant_id, collection_id, product_id, created_by
       )
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productCollectionItemDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.productCollectionDefault,
        SEED_IDS.productDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO product_collection_items (
         id, tenant_id, collection_id, product_id, created_by
       )
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.productCollectionItemTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.productCollectionTenantB,
        SEED_IDS.productTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
