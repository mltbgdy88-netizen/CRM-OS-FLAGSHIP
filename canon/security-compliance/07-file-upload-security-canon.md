# File Upload Security Canon v1

## Required Controls

- Allowed MIME types
- Max file size
- Virus scan status
- Tenant-scoped storage path
- Permission check before upload
- Permission check before download
- Audit log for sensitive file actions
- Signed URL expiration

## File States

```text
queued
uploading
uploaded
virus_scan_pending
virus_scan_failed
rejected_type
rejected_size
deleted
```

## Forbidden

- Public permanent file URLs
- Executable uploads without explicit approval
- Cross-tenant file sharing
- Storing files outside tenant scope
