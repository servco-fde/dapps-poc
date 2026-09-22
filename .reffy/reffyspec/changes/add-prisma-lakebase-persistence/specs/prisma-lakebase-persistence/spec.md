## ADDED Requirements

### Requirement: Typed application persistence

The application SHALL use generated Prisma model/query types and typed repositories for proposals, versions, comments, and audit events in Lakebase. Routine CRUD SHALL use Prisma operations. Raw SQL exceptions SHALL be narrowly documented, parameterized for values, and confined to persistence/migration code with validated identifiers. External requests and persisted JSON domain structures SHALL retain runtime validation.

#### Scenario: Developer changes a persistence field

- **WHEN** a model changes and generated types are refreshed
- **THEN** incompatible repository field/value usage fails type validation
- **AND** API mappings explicitly define the resulting response contract

#### Scenario: Application reads stored JSON

- **WHEN** a stored draft or event is converted to an application DTO
- **THEN** its domain shape is validated or handled by a documented compatibility path
- **AND** an unchecked cast does not substitute for validating that structure

### Requirement: Preserve the selected application architecture

The application SHALL retain React/AppKit UI, Node/Express, platform authentication, and the existing Unity Catalog OBO read path. Prisma SHALL manage only app-owned PostgreSQL data and its migration history. Artifact generation SHALL remain a download operation without executing Unity Catalog mutations.

#### Scenario: User reads metrics and downloads a proposal

- **WHEN** the Prisma-backed application serves those operations
- **THEN** metric reads continue to use the configured user executor
- **AND** the downloaded artifact does not cause a catalog write
- **AND** AppKit remains the UI library

### Requirement: Lakebase authentication and connection lifecycle

The Prisma integration SHALL preserve Lakebase OAuth renewal and TLS, use a bounded process-level pool, and close resources through a defined lifecycle owner. Runtime and migration authentication SHALL use the selected developer or deployed app identity without persisting or logging credentials.

#### Scenario: A new database connection opens after token expiry

- **WHEN** the running application needs a fresh connection after its earlier credential expires
- **THEN** it obtains a valid credential through the Lakebase integration
- **AND** it does not require a restart or use a permanently captured token

#### Scenario: App restarts or a migration command fails

- **WHEN** a watcher restart, shutdown, or failed migration occurs
- **THEN** owned connections and child processes are released
- **AND** diagnostic output excludes tokens and credential-bearing connection strings

### Requirement: Consistent schema targeting

ORM queries, migration execution, and migration history SHALL use the same validated `METRIC_HUB_SCHEMA`. Deployment MAY use the documented `metric_hub` default. Development SHALL require an explicit developer schema and reject accidental use of shared `metric_hub`. The same committed migration history SHALL operate across selected schemas without rewriting its contents/checksums. Unrelated schemas and AppKit cache objects SHALL remain unmanaged.

#### Scenario: Two developers share a database

- **WHEN** each initializes a different selected developer schema
- **THEN** each schema has independent app data and migration history
- **AND** neither initialization nor subsequent CRUD changes the other schema or shared `metric_hub`

#### Scenario: Development schema is missing or unsafe

- **WHEN** development is configured without an explicit schema, with shared `metric_hub`, or with an invalid identifier
- **THEN** application migration/persistence initialization fails before writing to a database

### Requirement: Non-destructive adoption of existing state

The application SHALL provide an explicit legacy-baseline operation that verifies selected-schema ownership and structural compatibility before marking the initial migration applied. It SHALL preserve physical table/column names, native types, defaults, constraints, indexes, IDs, relationships, and all existing application records. It SHALL NOT replay initial CREATE statements over populated tables, reset schemas, transfer ownership, or silently baseline during normal startup.

#### Scenario: Existing populated schema matches the baseline

- **WHEN** an authorized operator baselines that schema with writers quiesced
- **THEN** the verified baseline is recorded as applied without recreating its tables
- **AND** before/after checks establish that proposals, versions, comments, artifacts, and audit records are preserved

#### Scenario: Existing schema is partial, drifted, or has the wrong owner

- **WHEN** the baseline verification encounters the mismatch
- **THEN** it stops with an actionable error and leaves the baseline unapplied
- **AND** it does not change ownership, drop objects, or repair data automatically

### Requirement: Versioned schema initialization and upgrades

Committed Prisma migrations SHALL replace the handwritten startup DDL loop. Startup SHALL apply and verify committed history for a new or already tracked schema before reporting persistence readiness. Migration authoring SHALL be separate from applying history; reset-capable authoring SHALL use explicitly disposable databases. Failed/edited migration history and untracked existing schemas SHALL block readiness pending explicit reconciliation.

#### Scenario: New empty schema starts

- **WHEN** the application starts against its selected empty schema under the intended owner
- **THEN** the committed baseline and pending migrations establish the required app objects
- **AND** readiness reports `[lakebase] <schema> schema is ready` only after success

#### Scenario: Two processes start with pending migrations

- **WHEN** they target the same tracked schema concurrently
- **THEN** migration locking coordinates application without duplicate effects
- **AND** neither process reports persistence readiness before required migrations complete

#### Scenario: Populated schema has no migration history

- **WHEN** normal startup encounters existing untracked application tables
- **THEN** it reports the explicit baseline prerequisite and blocks persistence readiness
- **AND** it does not treat `CREATE TABLE IF NOT EXISTS` as a migration substitute

### Requirement: Atomic and concurrency-safe workflow writes

Proposal creation, revision, comments, and lifecycle changes SHALL commit their primary records and associated versions/audit events atomically. Revisions SHALL compare expected version and editable status and retain unique proposal/version enforcement. Conflicts SHALL produce controlled responses without partial writes or duplicate events; infrastructure failures SHALL not be misreported as version conflicts.

#### Scenario: Audit or version insertion fails

- **WHEN** a required insert fails during a compound workflow write
- **THEN** the whole transaction rolls back
- **AND** no partial primary update, version, comment, or event remains

#### Scenario: Two revisions use the same expected version

- **WHEN** they compete to revise one editable proposal
- **THEN** at most one commits a new version and its audit event
- **AND** the other receives a conflict without overwriting the winner

### Requirement: Transitions apply to the reviewed version

Every status mutation SHALL require a positive integer `expectedVersion`, enforce existing transition/role rules, and atomically match the proposal ID, expected version, and observed source status. The AppKit caller SHALL supply its displayed version. Missing/malformed versions SHALL return 400; stale state SHALL return 409 with no write; unauthorized approval SHALL remain forbidden. New status events SHALL preserve `from` and `to` and include `version`.

#### Scenario: Admin accepts a stale review

- **WHEN** an admin viewed version 1 and another actor revised/resubmitted version 2 before acceptance
- **THEN** acceptance with `expectedVersion: 1` returns 409
- **AND** version 2 remains unapproved with no approval event

#### Scenario: Current admin accepts the reviewed version

- **WHEN** an admin submits the current in-review version for approval
- **THEN** approval and its from/to/version audit event commit together
- **AND** existing history records without a version field remain readable

### Requirement: API compatibility and server-only generated code

Except for the required transition version field, the migration SHALL preserve current API response shapes, snake_case keys, JSON/null representation, date-only/timestamp serialization, ordering/limits, artifact bytes/headers, and existing validation/authorization/not-found/conflict semantics. Prisma generated runtime and credentials SHALL remain server-only. Model validation, generation, typecheck, and build SHALL neither access cloud data nor apply migrations.

#### Scenario: Existing AppKit pages use Prisma-backed APIs

- **WHEN** the catalog/proposal/documentation routes are exercised
- **THEN** existing consumers receive compatible data and artifacts
- **AND** date-only fields retain their intended date across supported time zones
- **AND** the browser bundle contains no Prisma server runtime or credentials

#### Scenario: Build runs without Databricks credentials

- **WHEN** dependencies are available and the app is generated, checked, and built
- **THEN** generation/build succeeds without querying Lakebase or Unity Catalog
- **AND** no migration or cloud mutation occurs

### Requirement: Verified migration operations and recovery

The implementation SHALL provide documented baseline/apply/status/recovery workflows and database-backed evidence for data preservation, two-schema isolation, transaction rollback, and stale-write rejection. Live Lakebase checks SHALL use explicit identity/schema selection. Deployed baselining and rollout SHALL require separate execution authorization consistent with existing operational rules. Recovery SHALL preserve records and migration history.

#### Scenario: Local checks pass but live validation is outstanding

- **WHEN** disposable database and automated checks pass without Lakebase runtime verification
- **THEN** the evidence records that limit
- **AND** it does not claim verified OAuth renewal, deployed OBO permissions, or completed rollout

#### Scenario: First adoption rollout fails

- **WHEN** required post-adoption verification fails
- **THEN** the rollout stops and the documented compatible-app rollback or reviewed forward repair is used
- **AND** schema reset, history deletion, ownership transfer, or development-to-BA data copying is not performed automatically
