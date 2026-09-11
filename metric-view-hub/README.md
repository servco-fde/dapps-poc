# Metric View Collaboration Hub

A Databricks App proof of concept for discovering a governed Unity Catalog metric view, proposing structured changes, reviewing them, and exporting an engineering-ready SQL/YAML artifact.

## Architecture

- **Governed reads:** AppKit Analytics queries `hawaii_prod.testing.vw__metrics_test` through `useMetricView`.
- **Identity:** Metric queries use on-behalf-of execution and the app declares the `sql` user API scope.
- **Application roles:** Authenticated users are reviewers by default. Emails in the comma-separated `APP_ADMIN_EMAILS` setting are admins and can accept proposals.
- **Collaboration state:** The AppKit Lakebase plugin stores proposals, immutable versions, comments, status transitions, and audit events in the app-owned `metric_hub` schema.
- **Publication boundary:** The app only downloads an artifact. It never creates, replaces, or drops a Unity Catalog object.

## Local project commands

```powershell
npm install
npm run typegen -- --wait
npm run typecheck
npm run lint
npm test
npm run build
databricks apps validate --profile hawaii-dev-workspace
```

## Full-stack local development

The React client and Express API can run locally with hot reload while using the development workspace's SQL warehouse, Unity Catalog metric view, and Lakebase project. Local proposal data uses a developer-owned schema so migrations and test records cannot affect the deployed app's `metric_hub` schema.

Create the ignored local environment file once on each computer:

```powershell
Copy-Item .env.example .env
```

Populate it with the existing development resource values and set `DATABRICKS_CONFIG_PROFILE=hawaii-dev-workspace`. Keep OAuth tokens and other credentials out of this file; AppKit uses the Databricks CLI profile.

Start the complete local client and API through the Databricks proxy:

```powershell
databricks apps run-local `
  --entry-point app.local.yaml `
  --profile hawaii-dev-workspace `
  --env METRIC_HUB_SCHEMA=metric_hub_local_roberto `
  --env LOCAL_DEV_EMAIL=roberto.delgado@servco.com
```

Open <http://localhost:8001>. Vite hot-reloads client changes, and the server watcher restarts for backend changes. Press `Ctrl+C` to stop both processes.

Use a stable, unique lowercase schema such as `metric_hub_local_<name>` for each developer. The first run creates that schema and its tables under the developer's Lakebase identity. Production continues to use `metric_hub` because `METRIC_HUB_SCHEMA` is unset in `app.yaml`.

This loop runs the application stack locally, but it is not offline: SQL Warehouse, Unity Catalog, OAuth, and Lakebase remain managed Databricks services in the development workspace.

Metric queries run with the CLI-authenticated developer identity during local development. AppKit cannot reproduce deployed browser-user OBO impersonation without a forwarded app user token, so verify OBO permissions once after deployment.

## POC runtime controls

Keep the deployed app stopped outside active development and demos. Start the existing deployment, verify its state, and stop it when the session ends:

```powershell
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
