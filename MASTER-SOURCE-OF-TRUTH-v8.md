# CRM OS Master Source of Truth v8

## Status

PRODUCTION_READY_FOR_CURSOR

## Purpose

CRM OS Master Workspace v8 is the final production-oriented Cursor workspace. Its target is not a historical transcript archive. Its target is a complete, consistent, source-driven and reconstruction-approved workspace that Cursor can use to build CRM OS sprint by sprint.

## Source Hierarchy

1. Customer Operating System / Amiral Gemisi CRM Platformu Technical Blueprint PDF
2. CRM OS Master Workspace v7
3. HTML conversation export
4. Reconstructed production specs approved for v8

## Core Decisions

- Architecture: Modular Monolith + Event-Driven Architecture.
- Backend: NestJS, TypeScript, PostgreSQL, Redis, RabbitMQ/BullMQ.
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query.
- Tenancy: Shared PostgreSQL database with mandatory tenant_id and PostgreSQL RLS.
- AI: AI Gateway, provider adapters, pgvector starting point, review-based AI actions.
- DevOps: Docker, Kubernetes, Helm, Terraform, CI/CD, Prometheus, Grafana, Loki, Sentry.
- Security: RBAC + permissions + tenant/branch/team scope, audit log, rate limit, webhook signature and encrypted backups.

## Production Rule

Cursor must never generate the whole CRM OS in one pass. It must generate one small sprint task at a time:

Spec → implementation → tests → review → fix → merge.

## First Cursor Task

Start with Sprint-01 Repository Bootstrap only.

# v1.1 Canon Fix

The active root is this folder.

Sprint-01 is repository bootstrap only.

Queue runtime for initial foundation is Redis + BullMQ. RabbitMQ is deferred.

Prisma + PostgreSQL RLS requires tenant-aware repository boundaries and transaction-local tenant context for tenant-scoped operations.
