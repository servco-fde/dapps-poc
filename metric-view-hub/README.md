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

Do not run the Lakebase-backed server locally before the app has been deployed once. The first deployed startup lets the app service principal create and own `metric_hub`; creating the schema with local user credentials first would prevent the deployed app from accessing it.

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
