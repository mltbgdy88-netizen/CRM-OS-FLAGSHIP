# CRM OS DevOps Quality Gates

## Docker Gate

```text
[ ] API image builds.
[ ] Web image builds.
[ ] Worker image builds.
[ ] Scheduler image builds.
[ ] Images do not contain secrets.
[ ] Non-root runtime user is used where possible.
```

## Kubernetes Gate

```text
[ ] Readiness probe exists.
[ ] Liveness probe exists.
[ ] Resource requests exist.
[ ] Resource limits exist.
[ ] Secrets are referenced, not embedded.
[ ] ConfigMaps are environment-specific.
```

## CI/CD Gate

```text
[ ] Lint runs.
[ ] Typecheck runs.
[ ] Tests run.
[ ] Migration check runs.
[ ] Build runs.
[ ] Docker build runs.
[ ] Security scan runs.
[ ] Release deploy requires approval.
```

## Operations Gate

```text
[ ] Monitoring exists.
[ ] Logging standard exists.
[ ] Backup plan exists.
[ ] Rollback plan exists.
[ ] Incident response process exists.
```
