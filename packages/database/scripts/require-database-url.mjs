/**
 * Sprint-02 RLS gate — fails fast when DATABASE_URL is unset.
 * Used by `pnpm db:test:rls` (DevOps must wire this in CI before PR-final).
 */
if (!process.env.DATABASE_URL) {
  console.error(
    'ERROR: DATABASE_URL is required for db:test:rls (Sprint-02 RLS gate).\n' +
      'Run against real PostgreSQL: pnpm db:migrate && pnpm db:seed && pnpm db:test:rls\n' +
      'See packages/database/README.md',
  );
  process.exit(1);
}
