# deploy-metric-view-hub-to-hawaii-ba Specification

## Purpose
Define the independent, workspace-local, approval-gated deployment and operation of Metric View Hub in the Hawaii
BA workspace while preserving the Hawaii development deployment.

## Requirements

### Requirement: Independent Hawaii BA deployment target

The repository SHALL define an explicit Hawaii BA deployment target for `metric-view-hub` while preserving the
existing Hawaii development target. Every BA validation, deployment, start, status, log, and stop operation SHALL
identify both the BA target and `hawaii-ba-workspace` profile and SHALL NOT rely on `DEFAULT` or ambient workspace
selection. BA resource bindings SHALL be required inputs until actual BA identifiers have been provisioned and
recorded; missing inputs SHALL fail instead of falling back to development values.

#### Scenario: Operator selects the BA deployment

- **WHEN** an approved operator validates or deploys the `hawaii-ba` target with the BA profile
- **THEN** the resolved workspace host belongs to `hawaii-ba-workspace`
- **AND** no development workspace resource identifier is selected

#### Scenario: Development target remains available

- **WHEN** the BA target is added and validated
- **THEN** the existing development target retains its host and resource bindings
- **AND** no development app lifecycle operation is performed

### Requirement: Workspace-local resource bindings

The BA target SHALL bind a dedicated serverless SQL warehouse and Lakebase Autoscaling branch/database that exist
in `hawaii-ba-workspace`. It SHALL declare `CAN_USE` for the warehouse and `CAN_CONNECT_AND_CREATE` for Lakebase.
Development workspace resource IDs and paths SHALL NOT be reused as BA values. Initial warehouse sizing and scaling
SHALL be documented and subsequently adjusted from observed queueing, query-history, and spill evidence rather than
from an assumption that dedicated or larger compute guarantees lower latency.

#### Scenario: Target resources resolve

- **WHEN** the BA target is validated before deployment
- **THEN** its warehouse, Lakebase branch, and Lakebase database resolve in the BA workspace
- **AND** the resolved app resource declarations contain the required permissions

#### Scenario: A required BA resource is missing

- **WHEN** validation or preflight discovery cannot resolve an approved BA resource
- **THEN** deployment stops before app creation or update
- **AND** the process reports the missing target-specific binding without falling back to development

#### Scenario: Dedicated warehouse is right-sized

- **WHEN** the BA deployment completes representative metric-query verification
- **THEN** reviewers examine queueing, execution time, active clusters, and spill evidence for the dedicated
  warehouse
- **AND** any size or scaling change is justified by those observations and separately approved

### Requirement: Service-principal-owned fresh collaboration state

The initial BA deployment SHALL use a dedicated BA Lakebase project and a fresh `metric_hub` collaboration schema.
The deployed BA app service principal SHALL create and own the schema before any local process uses that production
schema. Development collaboration records SHALL NOT be copied unless a separate migration change is approved.

#### Scenario: First BA deployment initializes collaboration storage

- **WHEN** the approved app is deployed against an empty dedicated BA Lakebase project
- **THEN** the new app service principal creates and owns `metric_hub` and its application tables
- **AND** the application begins with no development proposals, comments, versions, transitions, or audit events

#### Scenario: Production schema already has another owner

- **WHEN** preflight or startup detects that `metric_hub` is owned by another principal
- **THEN** the rollout stops and reports the ownership conflict
- **AND** it does not drop, transfer, or overwrite the schema without separate approval

### Requirement: Governed metric reads preserve OBO authorization

The BA app SHALL query `hawaii_prod.testing.vw__metrics_test` with browser-user OBO execution and the `sql` user API
scope. Deployment SHALL NOT grant Unity Catalog access broadly to workspace `users`; intended users SHALL receive
the required `USE CATALOG`, `USE SCHEMA`, and `SELECT` privileges through approved account groups.

#### Scenario: Authorized BA user reads metrics

- **WHEN** a signed-in BA user has warehouse access and the required inherited Unity Catalog privileges
- **THEN** the app returns governed metric results under that user's identity
- **AND** the query does not use the app service principal to bypass the user's data permissions

#### Scenario: Unauthorized BA user opens the app

- **WHEN** a signed-in user lacks required Unity Catalog privileges
- **THEN** the metric query is denied or shown as an authorization error
- **AND** the app does not elevate the user or broaden grants automatically

### Requirement: Workspace-local application identity and roles

The BA deployment SHALL create a workspace-local `metric-view-hub` app with a distinct service principal, OAuth
integration, URL, and Lakebase state. The configured BA admin allowlist SHALL be approved before deployment; all
other authenticated users SHALL remain reviewers, and admin-only acceptance SHALL continue to be enforced by the
server.

#### Scenario: BA app identity is created

- **WHEN** the first BA deployment succeeds
- **THEN** the recorded app identity and URL differ from the development deployment
- **AND** its declared permissions apply only to BA-bound resources

#### Scenario: Reviewer attempts an admin action

- **WHEN** an authenticated user not present in the approved admin allowlist attempts to accept a proposal
- **THEN** the server rejects the transition
- **AND** hiding or exposing the UI control does not change that authorization decision

### Requirement: Approval-gated and reversible POC rollout

Repository configuration MAY be implemented only after proposal approval. SQL warehouse and Lakebase creation,
permission changes, compute startup, and deployment SHALL require explicit execution approval. The rollout SHALL
verify the BA app and then stop app compute unless continued runtime is explicitly approved. Rollback SHALL
preserve resources and data unless a separate destructive action is approved.

#### Scenario: Planning is approved without execution approval

- **WHEN** the proposal is approved but cloud execution has not been authorized
- **THEN** local configuration and validation work may proceed within the approved scope
- **AND** no BA resource is created, permission is changed, compute is started, or app is deployed

#### Scenario: Approved deployment passes verification

- **WHEN** the BA app passes health, identity, metric-read, persistence, and role checks
- **THEN** its evidence and resource identifiers are recorded without credentials
- **AND** app compute is stopped after verification unless the user approved continued runtime

#### Scenario: Deployment or verification fails

- **WHEN** deployment or a required smoke check fails
- **THEN** the BA app is stopped when safe and the failure is recorded
- **AND** the process does not delete the app, Lakebase project, schema, or data without separate approval
- **AND** the development deployment remains unchanged as the fallback
