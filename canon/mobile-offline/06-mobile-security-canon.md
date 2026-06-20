# CRM OS Mobile Security Canon

## Required Security Controls

- Device binding
- Session expiration
- Refresh token revocation
- Optional biometric unlock
- Encrypted local storage
- Remote logout
- Tenant-scoped cache separation
- No cross-tenant offline cache mixing
- Audit log for mobile-sensitive actions

## File and Media

- Uploaded photos/files must pass file validation on server.
- Offline files must remain encrypted until sync.
- Failed uploads must not disappear silently.

## Lost Device Rule

Admin must be able to revoke mobile sessions and invalidate cached credentials.
