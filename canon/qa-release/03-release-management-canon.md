# CRM OS Release Management Canon

## Branch Strategy

- main: production-ready
- develop: integration branch
- release/x.y.z: stabilization
- agent/sprint-xx-task-name: AI-generated task branch
- hotfix/x.y.z: production fix

## Release Flow

1. Feature branches merge to develop after PR gates.
2. Release branch is created from develop.
3. Staging deployment runs full regression.
4. Manual approval is required for production.
5. Production deployment uses rolling or blue/green strategy.
6. Post-deploy smoke tests are mandatory.
7. Rollback plan must exist before deployment.

## Versioning

Use semantic versioning:

- MAJOR: breaking API or database change
- MINOR: new module or capability
- PATCH: bug fix or safe improvement

## Release Notes

Every release must include:

- features
- migrations
- permissions added
- events added
- API changes
- known risks
- rollback plan
