# Change: Add Prisma persistence for Metric View Hub

## Status

Draft for review. The user requested this ReffySpec change after selecting AppKit UI plus Prisma persistence. Implementation and database migration have not started.

## Why

Proposal routes currently combine request handling, handwritten PostgreSQL queries, table creation, and untyped query results. Startup creates missing tables but cannot evolve existing tables through a reviewed migration history. Prisma will make application data models and queries explicit and typed, and introduce repeatable migrations while preserving existing Lakebase records.

For example, revising a proposal must still update its definition, create exactly one immutable version, and record one audit event together. Approval must also reject a stale browser version rather than approve a newer definition the admin has not reviewed.

## What Changes

- Add Prisma models, generated server-side types, and typed repositories for proposals, versions, comments, and audit events.
- Integrate Prisma's PostgreSQL adapter with the existing Lakebase OAuth-aware connection layer, preserving schema selection and connection lifecycle management.
- Replace routine application CRUD SQL with Prisma operations and transactions. Keep reviewed migration SQL and narrowly documented, parameterized exceptions where needed.
- Replace ad hoc startup table creation with committed migrations and explicit, verified baselining of existing schemas. Preserve records, ownership, indexes, constraints, and developer-schema isolation.
- Preserve existing response shapes, dates, JSON payloads, status rules, artifact downloads, and HTTP error semantics through typed API mappings.
- Require `expectedVersion` on status-transition requests and compare it atomically with the stored version and status. Update the AppKit detail-page caller and record the version in new status audit events.
- Document the persistence/migration workflow and add database-backed tests for migration safety, rollback, and concurrent writes.

## Scope Boundaries

AppKit UI, Node/Express, platform sign-on, resource bindings, and Unity Catalog OBO analytics remain the selected architecture. Prisma handles app-owned Lakebase data only. Generated SQL/YAML remains an engineering handoff rather than an executed catalog mutation.

This change addresses audit F5 and the closely related approval-version defect F1. Missing-identity handling, dependency advisories, revision UI, artifact delimiters, pagination, and other audit findings remain separate work. Restoring declared test dependencies needed for validation is permitted implementation work; unrelated dependency upgrades are outside scope.

## Impact

- New capability: `prisma-lakebase-persistence`. No canonical capability currently specifies the persistence implementation. Existing AppKit presentation, BA ownership/OBO boundaries, and readable lifecycle-history requirements remain applicable.
- App files: Prisma schema/config/migrations, `server/db/`, proposal repositories/services, routes, shared DTO/validation definitions, the status-action caller, package scripts/lockfile, and tests.
- Documentation: app README and structured FDE guide; update Reffy project context when implementation ships. The independent `add-fde-workstation-setup` change retains its workstation-only scope.
- Data: existing tables remain in place; add a migration ledger in the selected app schema. No development-to-BA data copy, schema reset, ownership transfer, or cloud provisioning is required.
- API: status mutation now requires `expectedVersion`. Missing/malformed values return 400; a stale version/status returns 409 with no write. Ship server and client together. Other response contracts remain compatible.

## Acceptance Summary

The AppKit workflow reads and writes through generated Prisma types; an existing populated schema can adopt migration history without losing data; a new isolated schema can replay the same history; transactions roll back as a unit; stale revisions and approvals return conflicts; and build/type generation works without cloud credentials. Live Lakebase validation uses an explicitly selected profile and isolated schema. Deployed-schema baselining and rollout are separately authorized operational actions.

## Supersedes

None. This replaces an implementation detail without a dedicated canonical persistence specification. It does not reverse the AppKit documentation or BA resource/ownership decisions.

## Reffy References

- `metric-view-hub-architecture-audit.md` - decision to retain AppKit and adopt Prisma; F5 migration/type requirements, F1 approval integrity, and validation limitations.
