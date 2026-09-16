## Context

The current DAB defines one default target whose host and resource variables belong to
`hawaii-dev-workspace`. The deployed app combines AppKit Analytics, browser-user OBO SQL execution, and
Lakebase-backed collaboration state. Cross-workspace deployment therefore requires more than copying source: the
target needs its own app identity, resource bindings, state store, and permission verification.

Read-only checks established the following BA baseline:

- The `metric-view-hub` app name is available and Databricks Apps is enabled.
- Both workspaces use metastore `05bf43b3-ec5a-41d9-919f-c560492bb29e` and resolve the same metric-view table ID,
  `d635581e-9052-4c65-8042-d8aee82a1288`.
- `Serverless Starter Warehouse` (`9c673e276676d648`) is available and grants `CAN_USE` to workspace `users`.
- No Lakebase Autoscaling projects exist in the BA workspace.
- Effective metric-view `SELECT` is granted through named data/owner groups, not workspace `users` generally.

## Goals / Non-Goals

Goals:

- Make the BA deployment explicit, repeatable, reviewable, and isolated from development.
- Reuse the shared governed metric view while binding all compute and state resources in the BA workspace.
- Preserve OBO authorization and server-side role enforcement.
- Establish a safe first-deployment order that gives the BA app service principal ownership of its Lakebase
  schema.
- Leave the app stopped when the POC is not being actively exercised.

Non-goals:

- Migrating or synchronizing collaboration data between workspaces.
- Creating, replacing, or publishing Unity Catalog metric views.
- Broadening Unity Catalog permissions to all workspace users.
- Promoting the BA deployment to production or defining a general enterprise release pipeline.
- Changing application workflows, UI behavior, generated artifact semantics, or the existing development target.
- Deleting failed resources or data automatically during rollback.

## Decisions

### 1. Add an independent DAB target

Add a `hawaii-ba` target to `metric-view-hub/databricks.yml`. Keep the existing target and variables unchanged.
The BA target pins only the BA workspace host; operators must provide the returned BA warehouse, Lakebase project,
branch, and database values through bundle variable overrides. Omitting target-level defaults is an intentional
fail-safe against development-value leakage. Operators will pass both `--target hawaii-ba` and
`--profile hawaii-ba-workspace`; commands must not rely on `DEFAULT` or an ambient profile.

### 2. Create a dedicated serverless BA warehouse

Proposed choice: create `metric-view-hub-ba` as a serverless SQL warehouse, initially `Small`, with one minimum and
two maximum clusters and a 10-minute auto-stop. The development `metric-view-hub-dev` warehouse is also serverless,
but it is `2X-Small`, limited to one cluster, and isolated in the development workspace. The existing BA Starter
warehouse is `Small`, limited to one cluster, and shared.

A dedicated warehouse does not inherently make serverless queries faster. It isolates app traffic from unrelated
queries, allows app-specific permissions and cost tags, and provides a clean monitoring/right-sizing signal.
Serverless remains the preferred compute type. Start with the proposed baseline, then use Peak Queued Queries,
query history, and query-profile spill evidence to adjust cluster size or maximum clusters rather than assuming a
larger size is always faster.

Bind the approved warehouse with `CAN_USE` for the app service principal. Because metric queries use OBO, grant
warehouse use to the approved BA user groups as well; do not default to all workspace users without review.

### 3. Create a dedicated BA Lakebase project and fresh state

After approval, create a Lakebase Autoscaling project in `hawaii-ba-workspace`, proposed ID `metric-view-hub`.
Discover and record the actual production branch and database resource names returned by the CLI; do not assume
that development paths are portable. Bind them with `CAN_CONNECT_AND_CREATE`.

The deployed BA app must start before any local process initializes the production `metric_hub` schema. Its new
service principal then creates and owns the schema and tables. The BA store begins empty. Migration from development
requires a separate proposal because it changes data-handling, rollback, and ownership requirements.

### 4. Reuse the governed metric view with OBO authorization

Keep `hawaii_prod.testing.vw__metrics_test` and the `sql` user API scope. The shared metastore and identical table
ID show that no metric-definition copy is needed. This does not grant access: each browser user must inherit
`USE CATALOG`, `USE SCHEMA`, and `SELECT` through an approved account group.

Before deployment, identify representative authorized and unauthorized BA users. Post-deployment verification must
show that an authorized user can query the metric view and that an unauthorized user is not elevated through the
app.

### 5. Keep app identities and state isolated

The BA app uses the same workspace-local name, `metric-view-hub`, but receives a different URL, OAuth integration,
and service principal. No BA resource identifier or identity is written into the development target. Deploying,
starting, stopping, or updating one app must not operate on the other workspace.

### 6. Confirm role configuration before deployment

`APP_ADMIN_EMAILS` remains a target/runtime configuration decision. Proposal review must confirm the BA admins.
All other authenticated users remain reviewers, and the server must continue enforcing admin-only acceptance
independently of UI controls.

### 7. Use an approval-gated rollout and non-destructive rollback

Implementation may prepare and strictly validate local configuration after proposal approval. Creating Lakebase,
changing grants, or deploying requires explicit execution approval. The deployment command may start Medium app
compute because the bundle lifecycle is started. Verification covers app health, identity, metric reads, proposal
persistence, and authorization. Stop the BA app after verification unless the user explicitly requests it remain
running.

Rollback first stops the BA app and records the failure. It does not delete the app, Lakebase project, schema, or
data without separate destructive-action approval. The development deployment remains the working fallback.

## Risks and Tradeoffs

- A dedicated `Small` warehouse costs more while active than the development `2X-Small` baseline and still incurs
  a serverless cold start after auto-stop. Isolation improves predictability and attribution, not guaranteed query
  latency; monitoring must drive later sizing changes.
- OBO behavior depends on end-user group membership. Successful deployment and service-principal grants do not
  prove browser-user access.
- Fresh BA state avoids risky migration but creates two independent collaboration histories.
- A first startup can fail if a user-owned `metric_hub` schema is created before the app service principal owns it.
- `lifecycle.started: true` makes deployment operationally observable and billable until the app is stopped.

## Verification Strategy

1. Validate the DAB target strictly with the explicit BA target/profile and confirm resolved host/resource values.
2. Confirm the app name remains available and the selected warehouse and Lakebase paths exist in the BA workspace.
3. Deploy only after execution approval and capture the new app identity, URL, resource bindings, and deployment
   status.
4. Verify app health and `/api/me` for the expected browser identity.
5. Exercise a metric query as an authorized BA user and confirm expected denial for a user without UC access.
6. Create and retrieve a disposable proposal, verify reviewer/admin enforcement, and confirm persistence after an
   app restart; remove test data only through an approved application workflow.
7. Confirm the development app bindings and state are unchanged.
8. Stop the BA app and verify `compute_status.state` is `STOPPED` unless continued runtime was explicitly approved.

## Reffy Inputs

- `hawaii-ba-app-deployment-readiness.md`
- `reference-app-poc-playbook.md`

## Execution Inputs Still Required

- Separate authorization to create resources, change permissions, start compute, and deploy.
- Actual resource identifiers returned by the approved warehouse and Lakebase creation operations.
- Confirmation that Roberto Delgado and Tausif Islam remain the BA application admins at execution time.
- Named BA groups or representative users for authorized and unauthorized OBO smoke tests.
