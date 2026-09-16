# Change: Deploy Metric View Hub to Hawaii BA workspace

## Status

Repository implementation was approved by the user on 2026-09-15. The user separately authorized Databricks
execution on 2026-09-15, covering the reviewed BA resource creation, least-privilege permissions, transient compute
startup, app deployment, and verification. Data migration and destructive cleanup remain unauthorized.

Cloud execution has provisioned the approved warehouse and Lakebase project and successfully deployed the BA app.
Automated verification, signed-in browser verification, workflow verification, and final app shutdown are complete.
The successful proposal-page load and role behavior verified `/api/me` for the approving user's session. A separate
live reviewer or unauthorized-user session was not tested; on 2026-09-15, the user accepted that limitation and the
automated server tests covering reviewer fallback, non-escalation, and admin-only acceptance.

## Why

The `metric-view-hub` POC is deployable only to `hawaii-dev-workspace` today. Its bundle target hardcodes the
development workspace host, SQL warehouse ID, and Lakebase resource paths. Reusing those bindings in
`hawaii-ba-workspace` would either fail validation or address resources in the wrong workspace.

Read-only discovery found that the BA workspace can host the application and resolves the same governed Unity
Catalog metric view, but it has no Lakebase project and only one available SQL warehouse. A reviewed,
target-specific deployment path is needed before rebuilding the app there.

## What Changes

- Preserve the existing development target and add an explicit `hawaii-ba` bundle target for
  `hawaii-ba-workspace`.
- Bind the BA target to BA-local resources rather than reusing development identifiers.
- For the BA deployment, propose creating a dedicated serverless SQL warehouse named `metric-view-hub-ba`,
  initially sized `Small` with one minimum and two maximum clusters plus a 10-minute auto-stop, and create a
  dedicated BA Lakebase Autoscaling project with its own branch and database.
- Deploy a distinct workspace-local `metric-view-hub` app and service principal while retaining the existing app
  name, source behavior, `sql` user API scope, and governed metric-view binding.
- Start with fresh BA collaboration data. Do not copy development proposals, comments, versions, transitions, or
  audit events unless a later, separately approved migration change is created.
- Confirm the intended BA user groups and admin allowlist before deployment, then verify browser-user OBO access
  and server-enforced roles after deployment.
- Validate, deploy, smoke-test, and then stop the BA app outside an explicitly active demo or development session.
- Document the BA bindings and operational commands without changing the development deployment.

## Impact

- Affected spec: `deploy-metric-view-hub-to-hawaii-ba`
- Expected repository changes after approval: `metric-view-hub/databricks.yml`, deployment documentation, and any
  narrowly required target-validation tests.
- Expected BA cloud changes after separate execution approval: one serverless SQL warehouse, one Lakebase
  Autoscaling project, and one Databricks App with its own service principal, resource grants, deployment, URL,
  and transient compute startup.
- No Unity Catalog object creation or modification. The existing
  `hawaii_prod.testing.vw__metrics_test` object is reused.
- No development Lakebase data mutation or migration. The development app and its stopped/running state remain
  independent.

## Review Decisions

The user approved these implementation defaults on 2026-09-15. Cloud execution remains separately gated:

1. Provision a dedicated **serverless** BA SQL warehouse named `metric-view-hub-ba` rather than use the shared
   Starter warehouse. The development warehouse is also serverless, so separation does not by itself replace
   serverless or guarantee faster queries; it isolates this workload, permissions, monitoring, and cost attribution.
   The proposed starting configuration is `Small`, one minimum and two maximum clusters, and a 10-minute auto-stop.
   Right-size it after reviewing queued queries, query history, and spill metrics.
2. Create a dedicated BA Lakebase project named `metric-view-hub`, using its `production` branch and default
   `databricks_postgres` database, subject to the names returned by the create operation.
3. Start BA with an empty `metric_hub` collaboration schema and no development-data migration.
4. Keep the current admin allowlist only if Roberto Delgado and Tausif Islam should administer the BA instance;
   otherwise supply the replacement addresses before deployment.
5. Identify the BA account groups whose members need OBO access to the metric view. Do not grant the general
   workspace `users` group broad Unity Catalog access merely to make the smoke test pass.
6. Allow deployment to start Medium app compute for verification, then stop it when verification completes.

## Supersedes

None. This adds a second workspace deployment path without replacing the existing development deployment.

## Reffy References

- `hawaii-ba-app-deployment-readiness.md` - live workspace findings, portability risks, decisions, and safety
  boundaries for the BA deployment.
- `reference-app-poc-playbook.md` - proven development deployment order, remote-build identity correction, OBO
  boundary, role enforcement, verification sequence, and stop-after-use runbook.
