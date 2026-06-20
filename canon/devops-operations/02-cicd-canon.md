# CRM OS CI/CD Canon

## Pull Request Pipeline

Every PR must run:

```text
lint
typecheck
unit tests
migration check
build
docker image build
security scan
```

## Main Branch Pipeline

```text
merge to main
deploy development
run smoke tests
publish dev artifacts
```

## Release Pipeline

```text
release branch
deploy staging
run integration tests
run e2e tests
run migration dry-run
manual approval
deploy production
health check
monitor
```

## Production Deploy

Allowed strategies:

```text
blue-green
rolling deployment
canary for risky changes
```

## Rollback Rules

- Rollback plan must exist before production deploy.
- Database migrations must be backward-compatible where possible.
- Deployment must automatically fail if health checks fail.
- Release notes must include migration risk.
