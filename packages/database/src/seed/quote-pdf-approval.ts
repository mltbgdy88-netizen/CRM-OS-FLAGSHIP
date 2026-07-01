import type { PoolClient } from 'pg';
import { SEED_IDS, SEED_QUOTE_PDF_PERMISSIONS } from './constants';

export async function seedQuotePdfApprovalData(client: PoolClient): Promise<void> {
  await client.query('BEGIN');

  try {
    for (const permission of SEED_QUOTE_PDF_PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (id, code, module, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE
         SET module = EXCLUDED.module,
             description = EXCLUDED.description`,
        [permission.id, permission.code, permission.module, permission.description],
      );
    }

    for (const permission of SEED_QUOTE_PDF_PERMISSIONS) {
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
      `INSERT INTO quote_approvals (
         id, tenant_id, quote_id, approver_user_id, status, notes, created_by
       )
       VALUES ($1, $2, $3, $4, 'pending', 'Awaiting manager approval.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteApprovalDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_approvals (
         id, tenant_id, quote_id, approver_user_id, status, notes, created_by
       )
       VALUES ($1, $2, $3, $4, 'pending', 'Tenant B approval queue.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteApprovalTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_files (
         id, tenant_id, quote_id, file_name, mime_type, storage_key, size_bytes, checksum, created_by
       )
       VALUES ($1, $2, $3, 'Q-2026-0001.pdf', 'application/pdf',
               'tenants/default/quotes/Q-2026-0001.pdf', 245760, 'sha256:seed-default', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteFileDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_files (
         id, tenant_id, quote_id, file_name, mime_type, storage_key, size_bytes, checksum, created_by
       )
       VALUES ($1, $2, $3, 'Q-2026-0001.pdf', 'application/pdf',
               'tenants/tenant-b/quotes/Q-2026-0001.pdf', 198432, 'sha256:seed-tenant-b', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteFileTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_view_logs (
         id, tenant_id, quote_id, viewer_user_id, source, created_by
       )
       VALUES ($1, $2, $3, $4, 'pdf', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteViewLogDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_view_logs (
         id, tenant_id, quote_id, viewer_user_id, source, created_by
       )
       VALUES ($1, $2, $3, $4, 'pdf', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteViewLogTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_signatures (
         id, tenant_id, quote_id, signer_name, signer_email, signed_at, created_by
       )
       VALUES ($1, $2, $3, 'Default Customer Signer', 'signer@default.local', NOW(), $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteSignatureDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_signatures (
         id, tenant_id, quote_id, signer_name, signer_email, signed_at, created_by
       )
       VALUES ($1, $2, $3, 'Tenant B Signer', 'signer@tenant-b.local', NOW(), $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteSignatureTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query(
      `INSERT INTO quote_status_history (
         id, tenant_id, quote_id, from_status, to_status, reason, created_by
       )
       VALUES ($1, $2, $3, 'draft', 'pending_approval', 'Quote submitted for approval.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteStatusHistoryDefault,
        SEED_IDS.tenantDefault,
        SEED_IDS.quoteDefault,
        SEED_IDS.userAdmin,
      ],
    );

    await client.query(
      `INSERT INTO quote_status_history (
         id, tenant_id, quote_id, from_status, to_status, reason, created_by
       )
       VALUES ($1, $2, $3, 'draft', 'pending_approval', 'Tenant B quote submitted.', $4)
       ON CONFLICT (id) DO NOTHING`,
      [
        SEED_IDS.quoteStatusHistoryTenantB,
        SEED_IDS.tenantB,
        SEED_IDS.quoteTenantB,
        SEED_IDS.userMemberB,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
