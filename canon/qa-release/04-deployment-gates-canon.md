# CRM OS Deployment Gates Canon

## Pre-Deploy Gates

- build success
- container image build success
- vulnerability scan pass or approved exception
- database migration dry-run pass
- backup completed for production
- feature flags reviewed
- environment variables validated
- secrets loaded from secret manager

## Deploy Gates

- readiness probes healthy
- liveness probes healthy
- API health endpoint healthy
- worker queue health verified
- scheduler health verified
- migration lock released
- no critical error spike

## Post-Deploy Gates

- smoke tests pass
- login works
- tenant context works
- customer list loads
- permission guard works
- audit log receives records
- metrics visible
- logs searchable
