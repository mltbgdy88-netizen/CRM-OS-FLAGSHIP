# CRM OS Production Operations Canon

## Operational Responsibilities

```text
deployment
monitoring
incident response
backup validation
capacity planning
security patching
cost monitoring
tenant usage monitoring
AI usage monitoring
```

## Health Checks

```text
/livez
/readyz
/health
```

Health checks must include:

```text
API process
database connectivity
redis connectivity
queue connectivity
object storage readiness where required
```

## Incident Response

Severity levels:

```text
SEV1 production outage
SEV2 major degraded service
SEV3 module-level issue
SEV4 minor defect
```

Required incident process:

```text
detect
triage
assign owner
mitigate
communicate
resolve
postmortem
prevent recurrence
```
