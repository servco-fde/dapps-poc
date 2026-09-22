## 1. Review and compatibility gate

- [ ] 1.1 Review this proposal, including the related F1 transition-version contract, before implementation.
- [ ] 1.2 Select and pin compatible Prisma CLI/Client/PostgreSQL adapter and Node versions; verify the existing Lakebase pool integration, ESM, dynamic schema selection, shutdown ownership, and server bundling. Record the decision in design.md.
- [ ] 1.3 Prove migration datasource authentication and identical committed history across two disposable schemas, including isolated migration ledgers; resolve hard-coded-schema or CLI credential issues before adopting existing data.

## 2. Models and migration lifecycle

- [ ] 2.1 Model all four app tables with physical name mappings, native types/defaults/nullability, relationships, indexes, and preserved CHECK/unique constraints; review the baseline against existing DDL.
- [ ] 2.2 Add shared schema-target validation, a process-level Prisma client, and an OAuth-aware migration wrapper with sanitized diagnostics and explicit lifecycle ownership.
- [ ] 2.3 Add baseline preflight/recording for populated legacy schemas: owner/structure verification, quiesced writes, recovery evidence, and before/after record checks. Reject partial/drifted schemas without repair.
- [ ] 2.4 Replace ad hoc startup DDL with committed migration apply/verification for new/tracked schemas; preserve readiness logging, locking, failure behavior, developer targeting, and AppKit cache separation.
- [ ] 2.5 Add deterministic server client generation and migration assets/runtime dependencies to packaging. Keep install/typecheck/build cloud-independent and free of migration side effects.

## 3. Typed repositories and API integration

- [ ] 3.1 Extract typed proposal repositories/services and domain/DTO validation; replace routine CRUD SQL while documenting any narrow parameterized exceptions.
- [ ] 3.2 Implement atomic create/revise/comment/transition transactions with rollback, conditional writes, uniqueness, and controlled conflict handling.
- [ ] 3.3 Require expectedVersion for status mutations, update the existing AppKit detail caller, and include version alongside from/to in new audit events. Preserve admin-only approval and legacy event rendering.
- [ ] 3.4 Add explicit DTO/error mapping for current response keys, dates/timestamps, JSON/nulls, ordering/limits, and artifact bytes/headers. Preserve the OBO analytics path and server-only Prisma boundary.

## 4. Verification

- [ ] 4.1 Add database-backed tests for fresh initialization, populated baseline preservation, repeat/concurrent startup, invalid target, drift/history/ownership rejection, and isolation across two schemas.
- [ ] 4.2 Add rollback fault-injection and concurrent revision/transition tests; prove stale admin acceptance after resubmission returns 409 without an approval event.
- [ ] 4.3 Add API contract coverage for date/time-zone and JSON mapping, 400/403/404/409 behavior, download content, and old/new audit details; include meaningful AppKit transition caller coverage.
- [ ] 4.4 Restore declared test dependencies as needed; run typecheck, Vitest/integration suites, ESLint, formatting, relevant AppKit checks, and production build. Confirm no cloud access during generation/build and no Prisma runtime in the client bundle.
- [ ] 4.5 Under separately authorized local-runtime scope, use the explicitly selected Databricks profile and developer schema with the documented full-stack proxy. Verify readiness, proposal APIs, token renewal on fresh connections, transaction persistence, and read-only analytics. Record environment and actual evidence without secrets.
- [ ] 4.6 Rehearse application rollback on representative baselined data and record data/ledger preservation. Record unexecuted live checks rather than marking them passed.

## 5. Documentation and delivery

- [ ] 5.1 Document Windows/macOS model generation, migration authoring in disposable databases, selected-target baseline/apply/status, credential handling, readiness failures, and recovery in the app README.
- [ ] 5.2 Update static FDE guide/source map and Reffy project context for Prisma persistence while retaining AppKit, platform authentication, and Unity Catalog read-only/OBO boundaries.
- [ ] 5.3 Record final scope, selected versions, automated/live evidence, and remaining unrelated audit findings; validate with reffy plan validate add-prisma-lakebase-persistence and reffy validate.
- [ ] 5.4 Prepare the concrete deployed-schema baseline/rollout review with explicit environment, owner, schema comparison, backup/recovery evidence, and coordinated server/client release. Execute only with separate authorization; retain the change as active until required delivery and verification are complete.
