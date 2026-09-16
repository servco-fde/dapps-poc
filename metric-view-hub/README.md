# Metric View Collaboration Hub

A Databricks App proof of concept for discovering a governed Unity Catalog metric view, proposing structured changes, reviewing them, and exporting an engineering-ready SQL/YAML artifact.

## Architecture

- **Governed reads:** AppKit Analytics queries `hawaii_prod.testing.vw__metrics_test` through `useMetricView`.
- **Identity:** Metric queries use on-behalf-of execution and the app declares the `sql` user API scope.
- **Application roles:** Authenticated users are reviewers by default. Emails in the comma-separated `APP_ADMIN_EMAILS` setting are admins and can accept proposals.
- **Collaboration state:** The AppKit Lakebase plugin stores proposals, immutable versions, comments, status transitions, and audit events in the app-owned `metric_hub` schema.
- **Publication boundary:** The app only downloads an artifact. It never creates, replaces, or drops a Unity Catalog object.

## In-app documentation

The deployed UI identifies Metric View Hub as a reference implementation and includes two static, version-controlled guides:

- `/docs/app`: the Metric View Hub Guide for business users, reviewers, admins, and demo participants.
- `/docs/fde`: the FDE Reference Guide for understanding the demonstrated Databricks primitives, Metric Hub defaults, environment bindings, source locations, and expected customization points.

The in-app guides summarize purpose, behavior, architecture, and adaptation. This README remains the operational source for local commands and current bindings; [`../reference-app-poc-playbook.md`](../reference-app-poc-playbook.md) remains the detailed build journal. The guides do not inspect workspace resources at runtime and do not expose credentials or user-specific local settings.

## Workstation readiness

For agent-guided onboarding from the repository root, ask Codex to read [`init.md`](../init.md).

From this app directory, check the shared toolchain in macOS Terminal or Windows Git Bash:

```sh
bash ../setup.sh --check --profile "YOUR_PROFILE"
```

Use your explicitly selected profile. See the [setup guide](../dapps-env-setup.md) for the Windows Git Bash bootstrap and `--install` repairs. Setup leaves app dependencies, resource configuration, `.env`, and your SDD framework choice to you. Automated check mode has been exercised on macOS and Windows Git Bash.

## Local project commands

```sh
npm ci
npm run typegen -- --wait
npm run typecheck
npm run lint
npm test
npm run build
databricks apps validate --profile hawaii-dev-workspace
```

## Full-stack local development

The React client and Express API can run locally with hot reload while using the development workspace's SQL warehouse, Unity Catalog metric view, and Lakebase project. Local proposal data uses a developer-owned schema so migrations and test records cannot affect the deployed app's `metric_hub` schema.

This local process and unique schema are the per-FDE isolation boundary. The deployed development app is a shared
integration instance, not one app per FDE; the BA deployment is a separate shared environment. Deployment and
shared-app lifecycle operations require separate approval and the documented explicit target/profile.

Create the ignored local environment file once on each computer, only if `.env` does not already exist:

| Shell                             | Command                       |
| --------------------------------- | ----------------------------- |
| macOS Terminal / Windows Git Bash | `cp .env.example .env`        |
| Windows PowerShell                | `Copy-Item .env.example .env` |

For this POC, populate it with the existing development resource values and set `DATABRICKS_CONFIG_PROFILE=hawaii-dev-workspace`. Keep OAuth tokens and other credentials out of this file; AppKit uses the Databricks CLI profile.

Start the complete local client and API through the Databricks proxy:

```sh
databricks apps run-local --entry-point app.local.yaml --profile hawaii-dev-workspace --env METRIC_HUB_SCHEMA=metric_hub_local_roberto --env LOCAL_DEV_EMAIL=roberto.delgado@servco.com
```

Open <http://localhost:8001>. Vite hot-reloads client changes, and the server watcher restarts for backend changes. Press `Ctrl+C` to stop both processes.

Use a stable, unique lowercase schema such as `metric_hub_local_<name>` for each developer. The first run creates that schema and its tables under the developer's Lakebase identity. Production continues to use `metric_hub` because `METRIC_HUB_SCHEMA` is unset in `app.yaml`.

This loop runs the application stack locally, but it is not offline: SQL Warehouse, Unity Catalog, OAuth, and Lakebase remain managed Databricks services in the development workspace.

Metric queries run with the CLI-authenticated developer identity during local development. AppKit cannot reproduce deployed browser-user OBO impersonation without a forwarded app user token, so verify OBO permissions once after deployment.

## POC runtime controls

Keep the deployed app stopped outside active development and demos. Start the existing deployment, verify its state, and stop it when the session ends:

```sh
databricks apps start metric-view-hub --profile hawaii-dev-workspace
databricks apps get metric-view-hub --profile hawaii-dev-workspace -o json
databricks apps stop metric-view-hub --profile hawaii-dev-workspace
```

Starting the app restores its last successful deployment; it does not require another deployment. Stopping the app stops its app compute but does not delete the deployment, Lakebase data, or resource bindings. The SQL warehouse and Lakebase endpoint retain their separate idle-suspension settings.

## Bound development resources

| Resource               | Value                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- |
| Databricks CLI profile | `hawaii-dev-workspace`                                                       |
| SQL warehouse          | `metric-view-hub-dev` (`d789a5e994a1ea33`)                                   |
| Metric view            | `hawaii_prod.testing.vw__metrics_test`                                       |
| Lakebase project       | `projects/metric-view-hub`                                                   |
| Lakebase branch        | `projects/metric-view-hub/branches/production`                               |
| Lakebase database      | `projects/metric-view-hub/branches/production/databases/databricks-postgres` |

Workspace-specific identifiers live in `databricks.yml` target variables and resource bindings. Credentials belong only in local ignored environment files or platform-injected values.

## Hawaii BA deployment target

The repository includes a deployed `hawaii-ba` target for `hawaii-ba-workspace`. The target pins only the BA workspace host. Its warehouse and Lakebase identifiers are deliberately required at invocation time so a missing BA value cannot fall back to a development binding.

The first deployment completed on 2026-09-15 after separate execution approval. It uses a dedicated serverless warehouse, a fresh Lakebase project, and no development collaboration-data migration.

| Resource               | Hawaii BA value                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| Databricks CLI profile | `hawaii-ba-workspace`                                                                            |
| Bundle target          | `hawaii-ba`                                                                                      |
| SQL warehouse          | `metric-view-hub-ba` (`c369b46fb27b9276`), serverless `Small`, 1-2 clusters, 10-minute auto-stop |
| Warehouse user group   | `data-hi-digital` (`CAN_USE`)                                                                    |
| Metric view            | `hawaii_prod.testing.vw__metrics_test`                                                           |
| Lakebase project       | `projects/metric-view-hub`                                                                       |
| Lakebase branch        | `projects/metric-view-hub/branches/production`                                                   |
| Lakebase endpoint      | `projects/metric-view-hub/branches/production/endpoints/primary`                                 |
| Lakebase database      | `projects/metric-view-hub/branches/production/databases/databricks-postgres`                     |
| App service principal  | `ace3089e-83dd-49f6-8f43-fb8d889a5e9a`                                                           |
| App URL                | `https://metric-view-hub-3146664464193453.13.azure.databricksapps.com`                           |

After the approved resources exist, capture the resource names returned by Databricks in the current shell. For PowerShell:

```powershell
$env:BUNDLE_VAR_sql_warehouse_id = "c369b46fb27b9276"
$env:BUNDLE_VAR_postgres_project = "projects/metric-view-hub"
$env:BUNDLE_VAR_postgres_branch = "projects/metric-view-hub/branches/production"
$env:BUNDLE_VAR_postgres_database = "projects/metric-view-hub/branches/production/databases/databricks-postgres"
```

For macOS Terminal or Windows Git Bash:

```sh
export BUNDLE_VAR_sql_warehouse_id="c369b46fb27b9276"
export BUNDLE_VAR_postgres_project="projects/metric-view-hub"
export BUNDLE_VAR_postgres_branch="projects/metric-view-hub/branches/production"
export BUNDLE_VAR_postgres_database="projects/metric-view-hub/branches/production/databases/databricks-postgres"
```

Validate the resolved target before deployment and inspect the JSON for the BA host and BA-only resource values:

```sh
databricks bundle validate --strict --target hawaii-ba --profile hawaii-ba-workspace -o json
```

Deploy from this app directory only under an approved change. The deployed app service principal was the first identity to initialize the production `metric_hub` schema; do not run a local process against that schema with another identity.

```sh
databricks apps deploy --target hawaii-ba --profile hawaii-ba-workspace
databricks apps get metric-view-hub --target hawaii-ba --profile hawaii-ba-workspace -o json
databricks apps logs --target hawaii-ba --profile hawaii-ba-workspace --tail-lines 200
```

Confirm the startup log contains `[lakebase] metric_hub schema is ready`, then verify browser-user OBO metric reads, `/api/me`, reviewer/admin enforcement, and proposal persistence. Generated metric metadata and TypeScript contracts remain committed so the remote builder does not need direct Unity Catalog access; runtime queries continue to execute as the signed-in user.

Stop BA app compute after verification unless continued runtime was explicitly approved:

```sh
databricks apps stop --target hawaii-ba --profile hawaii-ba-workspace
databricks apps get metric-view-hub --target hawaii-ba --profile hawaii-ba-workspace -o json
```

The development and BA apps share a workspace-local name but have independent service principals, URLs, compute, and Lakebase state. Always use the explicit target and profile shown above.

## Proposal workflow

```text
draft -> in_review -> changes_requested -> in_review
                   -> approved -> exported -> published
```

Every status change is enforced on the server and written to the audit log. Only admins can perform the `in_review -> approved` transition. Content revisions use optimistic version checks and create immutable proposal-version records.

## Source documentation

- [`../seed-1.md`](../seed-1.md): product seed
- [`../seed-1-proposal.md`](../seed-1-proposal.md): architecture and delivery proposal
- [`../reference-app-poc-playbook.md`](../reference-app-poc-playbook.md): living build journal
