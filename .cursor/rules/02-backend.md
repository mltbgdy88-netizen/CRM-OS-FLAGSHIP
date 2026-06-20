# 02 Backend Rules v8

- Backend uses NestJS, TypeScript, PostgreSQL and Redis.
- Every module requires controller, service, DTOs, repository/provider and tests.
- Every route must resolve tenant context.
- Every protected route must declare required permission metadata.
- Critical writes must create audit log records and domain events.
- List endpoints must support pagination, search and safe filters.
