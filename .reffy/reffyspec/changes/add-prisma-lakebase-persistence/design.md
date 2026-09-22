# Prisma persistence design

## Context

`server/routes/proposals/proposal-routes.ts` owns four tables and performs compound writes through PostgreSQL CTEs. Results are `Record<string, unknown>[]`, while client contracts are maintained separately. `METRIC_HUB_SCHEMA` selects deployed `metric_hub` or a developer-owned schema. The database also holds unrelated objects, including AppKit cache tables.

Introduce typed persistence and migration history while preserving the existing AppKit UI, Lakebase records, BA ownership model, OBO analytics boundary, and readable lifecycle events. Include the reviewed-version guard at the approval transaction boundary. Other audit remediation remains separate.

## 1. Dependencies, authentication, and lifecycle

Use Prisma Client with a compatible PostgreSQL adapter over the Lakebase OAuth-aware pool. The installed `@databricks/lakebase/README.md` demonstrates `PrismaPg(pool)`; that is the initial candidate, not a promise that every Prisma major accepts the same API.

Before broad route changes, select and pin mutually compatible Prisma CLI, Client, adapter, and Node versions. Verify pool construction, dynamic schema selection, ESM/server bundling, and migration credentials against that release's documentation. Record selected versions and evidence here. Do not mix version-specific APIs or assume the latest major is a drop-in match for AppKit 0.74.0.

Create one Prisma client per process after Lakebase is ready. Reuse OAuth refresh and TLS rather than keeping one token as a permanent password. Define one owner of pool shutdown and test watcher restarts and graceful termination; do not allocate pools per request.

The migration CLI does not automatically inherit the runtime adapter's password callback. A Node wrapper must obtain fresh credentials through the approved Databricks identity and pass short-lived connection configuration through the child environment. It must target the same database/schema as runtime and sanitize failures. Never persist tokens in command arguments, logs, generated files, or `.env`.

## 2. Models, repositories, and API compatibility

| Prisma model | Physical table | Key properties to preserve |
| --- | --- | --- |
| `Proposal` | `proposals` | UUID; text status/change type with CHECK constraints; JSONB criteria; DATE desired date; nullable approver; integer version; timestamptz fields |
| `ProposalVersion` | `proposal_versions` | UUID; proposal FK; unique proposal/version; JSONB draft; artifact text; author/time |
| `ProposalComment` | `comments` | UUID; proposal FK; optional anchor; body/author; resolved boolean; timestamp |
| `ProposalAuditEvent` | `audit_events` | UUID; proposal FK; event/actor; JSONB details; timestamp |

Map model/field names onto existing physical names. Preserve nullability, defaults, native types, cascade behavior, uniqueness, and indexes. Keep text CHECK constraints through reviewed migration SQL; do not replace columns with database enums or drop constraints because an ORM schema cannot express them. Preserve explicit `updated_at` behavior and stored timestamps.

Put client/schema/migration configuration in `server/db/` and typed persistence/transactions behind proposal repositories/services. Route handlers retain Zod validation, actor/role decisions, and HTTP mappings. Use generated model/query types internally and explicit shared DTO schemas at the HTTP boundary. No Prisma runtime or credentials belong in the browser bundle.

Map internal fields back to the current snake_case responses. Preserve date-only `desired_date`, ISO timestamps, nulls, JSON payloads, list ordering/limit, detail shape, and artifact bytes/headers. Test time-zone conversion explicitly. Prisma's JSON type does not validate `draft_json` or audit-detail structure: retain domain validation and backward-compatible handling of old events rather than unchecked casts.

## 3. Schema targeting and isolation

Continue identifier validation. Deployment retains the default `metric_hub`; development must explicitly select a developer schema and reject accidental use of shared `metric_hub`. This guard complements the existing partial isolation and does not narrow the developer's database grants.

Use the same resolved schema for ORM queries, foreign keys, migration execution, and `_prisma_migrations`. Generated models/client must work across developer schemas without embedding a personal schema. Verify the selected adapter's schema option and migration datasource configuration.

All environments must use identical committed migration contents/checksums. Review generated SQL for hard-coded schema qualifications that could override connection targeting. Establish a supported schema-relative migration strategy and prove replay in two schemas before adopting existing data. Do not substitute schema names into committed SQL at runtime or modify ledger checksums. If the chosen tooling cannot satisfy this, revise the design before touching existing data.

Manage only app tables and their ledger. Do not model/introspect the entire database as app-owned, change AppKit cache tables, transfer ownership, or broaden grants to make migrations succeed.

## 4. Baseline and migration lifecycle

Generate and review migration files in explicitly disposable PostgreSQL development/shadow databases. Do not run reset-capable authoring commands or `db push` against shared Lakebase as a shortcut. Commit an initial baseline matching the current physical schema, including CHECK constraints and indexes.

| Target state | Behavior |
| --- | --- |
| Empty, explicitly selected schema | Apply the baseline and later committed migrations under the intended owner. |
| Populated legacy schema without ledger | Explicitly verify live definitions, constraints, indexes, defaults, ownership, and representative data; mark the reviewed baseline applied without replaying CREATE statements. |
| Tracked schema with compatible history | Apply pending committed migrations with the deployment workflow and verify required history before readiness. |
| Partial schema, drift, edited/failed history, wrong owner | Stop with an actionable error; do not infer success from table existence or silently mark migrations applied. |

Baselining is a one-time operator action, never silent startup behavior. Quiesce writers, retain recovery evidence, and compare IDs, relationships, row counts/content, generated artifacts, dates, statuses, and audit history before and after. Rehearse adoption on representative disposable data first. Deployed baselining uses the app schema owner and separate execution authorization; never run a developer against shared `metric_hub` to take ownership.

Replace `initializeSchema` with a controlled apply-and-verify step for committed migrations during normal startup. New schemas initialize; untracked existing schemas fail with baseline instructions. Keep migration locking enabled and test concurrent starts. Expose persistence readiness only after success, preserving `[lakebase] <schema> schema is ready`. AppKit's non-blocking cache warning remains distinct from application migration failure.

Include migration files and pinned executable dependencies in the deployed runtime artifact; do not assume development dependencies exist there. Install, client generation, typecheck, and build must not apply migrations or require cloud credentials. Keep migration authoring, explicit legacy baselining, and applying committed migrations as separate operations.

## 5. Atomic workflow writes and reviewed-version approval

| Operation | Required transaction |
| --- | --- |
| Create | Insert proposal, version 1, and creation audit event together. |
| Revise | Conditional update on ID, expected version, and editable status; next version and audit insert in the same transaction; zero matches returns 409. |
| Comment | Insert comment and audit event together; absent proposal remains 404 with no event. |
| Transition | Validate role/transition; update conditional on ID, reviewed version, and observed status; insert from/to/version event in the same transaction; zero matches returns 409. |

Use Prisma transactions/conditional writes supported by the pinned release; retain database uniqueness as a second defense. Handle serialization/deadlock conflicts explicitly with bounded whole-transaction retries where safe, otherwise return a conflict. Never retry only part of a compound write or classify a database outage as a version conflict.

Status requests become `{ status, expectedVersion }`; the existing detail page sends the displayed `current_version`. Missing/malformed versions return 400. An admin viewing version 1 cannot approve version 2 after request-changes/revise/resubmit. Approval remains admin-only. Preserve `from`/`to` event details and add `version`; legacy records must remain readable.

Identity fallback/role policy otherwise remain out of scope. Prisma does not authenticate callers or automatically correct audit F4.

## 6. Build, documentation, and rollout

Add deterministic server client generation/model validation and pin direct dependencies in the app's npm manifest/lockfile. Root pnpm/Reffy tooling stays separate. Keep generated Prisma code server-only.

Update the README with Windows/macOS generation, migration-authoring, baseline, apply/status, and recovery commands. Update the static FDE guide/source map to distinguish Prisma modeling/migrations from Lakebase hosting/authentication. Retain AppKit presentation and the documented full-stack proxy workflow.

Rollout order: disposable PostgreSQL tests; separately authorized OAuth/migration checks in a developer schema; reviewed live comparison and recovery evidence; explicitly authorized baseline of one deployed environment under its owner; then coordinated client/server release. Do not copy development data into BA.

Initial adoption should leave physical tables compatible with the old application. Rehearse rollback by returning to the prior app version while preserving the ledger and records; use a reviewed forward repair for drift. Do not roll back through table drops, schema resets, or history deletion.

## Validation and implementation gates

- Verify selected versions, pool ownership, token renewal on new connections, schema selection, CLI authentication, and bundling before replacing routes.
- Database tests: empty migration, populated baseline, repeated/concurrent startup, drift/owner rejection, two-schema isolation, and preserved records/constraints.
- Fault injection: version/audit insert failure rolls back the whole write. Race revisions/transitions and test stale admin approval after resubmission.
- API tests: date/time-zone and JSON compatibility, 400/403/404/409 behavior, ordering, artifact bytes, and old audit-event rendering.
- Run typecheck, tests, lint, formatting, relevant AppKit checks, and build; restore the declared missing Playwright dependency as needed. Integration/browser tests use the full stack and an isolated schema.
- Live OAuth/proxy and deployed OBO/identity checks require separate runtime evidence. Record outstanding checks and keep this change unarchived until required validation is complete.

## Sources and planning basis

- `metric-view-hub-architecture-audit.md`: F1, F5, and the AppKit/Prisma decision.
- Installed `@databricks/lakebase/README.md`: Prisma pool integration example.
- [Prisma PostgreSQL connector (v7)](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql): initial adapter/schema candidate; recheck against the chosen release.
- [Prisma baselining (v7)](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/baselining): adoption of existing state without initial-migration replay.
- [Prisma transactions (v7)](https://docs.prisma.io/docs/orm/v7/prisma-client/queries/transactions): transactions and optimistic concurrency patterns. Planning has not installed or pinned a Prisma release.
