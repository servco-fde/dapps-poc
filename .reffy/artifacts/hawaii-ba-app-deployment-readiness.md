# Hawaii BA app deployment readiness

## Objective

Assess what must change to rebuild the existing `metric-view-hub` Databricks App in
`hawaii-ba-workspace` without disturbing the deployed POC in `hawaii-dev-workspace`.

## Live workspace findings

The following findings came from read-only Databricks CLI checks on 2026-09-15:

- `metric-view-hub` is not currently registered in `hawaii-ba-workspace`, so the app name is available there.
- Databricks Apps is enabled in the BA workspace. Three other apps are registered, well below the platform limit.
- The development and BA workspaces use the same Unity Catalog metastore. Both resolve
  `hawaii_prod.testing.vw__metrics_test` to the same metric-view table ID.
- The BA workspace exposes one SQL warehouse, `Serverless Starter Warehouse`
  (`9c673e276676d648`). The workspace `users` group has `CAN_USE`.
- The BA workspace currently has no Lakebase Autoscaling projects.
- Effective `SELECT` on the metric view is granted to named data and workspace-owner groups, not to the
  general workspace `users` group.

## Portability concerns

- `metric-view-hub/databricks.yml` has only a development target and binds the development workspace host,
  warehouse ID, and Lakebase resource paths. Those values cannot be reused in the BA workspace.
- A BA deployment creates a distinct Databricks App service principal and URL. The new service principal must
  receive the declared warehouse and Lakebase permissions.
- The app uses on-behalf-of SQL execution. Every intended browser user still needs `USE CATALOG`, `USE SCHEMA`,
  and `SELECT` privileges for the governed metric view, even though the app resource binding grants warehouse
  access to its service principal.
- A new BA Lakebase project starts with no proposals, comments, versions, transitions, or audit events from the
  development deployment. Copying collaboration data would require a separately approved migration.
- The deployed service principal should start the app first and create the `metric_hub` schema so it owns the
  schema and tables. Running locally against that schema first risks an ownership conflict.
- `APP_ADMIN_EMAILS` currently grants admin access to Roberto Delgado and Tausif Islam; the BA audience may need
  a different allowlist.
- The bundle declares `lifecycle.started: true`, so deployment starts Medium app compute. The desired initial
  runtime state and cost boundary should be explicit.

## Recommended direction

- Add a dedicated `hawaii-ba` bundle target while preserving the existing development target.
- Bind the BA target to an explicitly selected BA warehouse and a dedicated BA Lakebase Autoscaling
  project/branch/database.
- Reuse the existing governed metric-view identifier because both workspaces resolve the same Unity Catalog
  object, but verify OBO access for representative BA users after deployment.
- Treat BA collaboration state as fresh unless a later, separately reviewed requirement authorizes data
  migration from development.
- Validate the BA target before deployment and run post-deployment smoke checks for app health, identity,
  metric queries, proposal persistence, role enforcement, and clean shutdown.

## Decisions required before implementation

1. Use the existing Serverless Starter Warehouse or provision a dedicated BA warehouse.
2. Confirm that a new dedicated Lakebase project is acceptable and choose its project/branch/database names.
3. Confirm that BA starts with empty collaboration data or define a migration requirement.
4. Identify the BA user groups that require metric-view access.
5. Confirm the deployed admin email allowlist.
6. Decide whether the first approved deployment should remain running or be stopped after verification.

## Implementation decision outcome

On 2026-09-15, the user approved repository implementation using the dedicated serverless warehouse, dedicated
Lakebase project, fresh-state, current-admin, least-privilege OBO, and stop-after-verification defaults captured in
the change proposal. The user separately authorized the reviewed Databricks execution later that day. Data
migration and destructive cleanup remain outside that authorization.

## Execution evidence

Databricks execution on 2026-09-15 produced and verified:

- Serverless SQL warehouse `metric-view-hub-ba` (`c369b46fb27b9276`): `Small`, 1-2 clusters, Photon, 10-minute
  auto-stop, healthy, and tagged for `metric-view-hub` / `hawaii-ba`.
- Human warehouse access limited to `data-hi-digital` (`CAN_USE`) plus owner/inherited admin permissions. Roberto
  Delgado and Tausif Islam are active BA users in this group and the group has effective `USE CATALOG`,
  `USE SCHEMA`, and `SELECT` for the governed metric view.
- Lakebase project `projects/metric-view-hub`, ready `production` branch, active `primary` endpoint, and
  `databricks-postgres` database resource. The project began empty.
- BA app service principal `ace3089e-83dd-49f6-8f43-fb8d889a5e9a`, app URL
  `https://metric-view-hub-3146664464193453.13.azure.databricksapps.com`, and successful deployment
  `01f1b16360b416ab9b024d36117d3c8e`.
- App state `RUNNING`, compute `ACTIVE`, effective `sql` scope, expected warehouse and Lakebase bindings, automatic
  service-principal warehouse `CAN_USE`, and startup log `[lakebase] metric_hub schema is ready`.
- An authorized query through the dedicated BA warehouse returned a `deal_count` of `51976`. The app service
  principal has no effective Unity Catalog grant on the metric view, preserving the OBO boundary.
- The development app remains stopped with its original service principal and development resource bindings.

Signed-in browser verification of `/api/me`, reviewer/admin behavior, proposal persistence, and unauthorized-user
non-escalation remains pending. The BA app is intentionally running for that review and should be stopped afterward.

## Safety boundary

This artifact records assessment and approved execution evidence. It does not authorize data migration,
destructive cleanup, broader grants, or additional resource changes.
