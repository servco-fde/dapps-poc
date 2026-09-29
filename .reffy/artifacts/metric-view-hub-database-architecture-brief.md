# Metric View Hub Database Architecture Brief

## Executive summary

Metric View Hub uses Databricks Lakebase PostgreSQL for application-owned collaboration data such as proposals, versions, comments, workflow transitions, and audit events.

The architecture provides **three logical data environments across two physical Lakebase databases**:

1. A deployed development environment.
2. An isolated local-development environment for Roberto.
3. A deployed Hawaii BA production environment.

The Hawaii BA environment has the strongest isolation because it runs in a separate Databricks workspace and Lakebase database. Local and deployed development share one Lakebase database but use different PostgreSQL schemas.

## Architecture at a glance

```text
Hawaii development workspace
└── Lakebase project: metric-view-hub
    └── production branch
        └── databricks-postgres database
            ├── metric_hub
            │   └── Deployed development app data
            └── metric_hub_local_roberto
                └── Roberto's local-development data

Hawaii BA workspace
└── Lakebase project: metric-view-hub
    └── production branch
        └── databricks-postgres database
            └── metric_hub
                └── Deployed BA production app data
```

Although the Lakebase project, branch, database, and deployed schema names are identical across the two workspaces, they identify separate resources because each workspace has its own Lakebase deployment.

## Environment boundaries

| Logical environment | Databricks workspace | Lakebase database boundary | PostgreSQL schema | Isolation model |
| --- | --- | --- | --- | --- |
| Deployed development | `hawaii-dev-workspace` | Development workspace database | `metric_hub` | Dedicated deployed-app schema |
| Local development | `hawaii-dev-workspace` | Same database as deployed development | `metric_hub_local_roberto` | Separate developer-owned schema |
| BA production | `hawaii-ba-workspace` | Separate BA workspace database | `metric_hub` | Separate physical database and app-owned schema |

## Why this design was chosen

### Production separation

The BA deployment receives its own Databricks App identity, SQL warehouse, Lakebase project, database, URL, and collaboration state. Development records are not copied into BA. This provides a clean production boundary and avoids accidental migration of test proposals or audit history.

### Fast local development without another database

Local development reuses the development workspace's Lakebase infrastructure to avoid provisioning and operating another database. A developer-specific schema keeps local migrations and test records away from the deployed development application's data.

### Service-principal ownership

Each deployed application's service principal initializes and owns its `metric_hub` schema. This aligns schema ownership with the runtime identity and avoids depending on a developer's personal credentials for deployed operation.

### Stable application behavior

The application defaults to the `metric_hub` schema when `METRIC_HUB_SCHEMA` is not configured. Deployed environments use this default. Local development explicitly sets:

```text
METRIC_HUB_SCHEMA=metric_hub_local_roberto
```

This allows the same application code to run across environments while directing persistence to the appropriate schema.

## Isolation strength and tradeoffs

BA production is physically isolated from development: it is hosted in a separate workspace and Lakebase database.

Local and deployed development are logically isolated, not physically isolated. They share the same Lakebase project, branch, database, compute, and underlying administrative boundary. Their data remains separate because PostgreSQL schema names, ownership, and application configuration differ.

This is an intentional cost-and-convenience tradeoff. It is appropriate for local development provided the schema override remains explicit and access privileges do not permit unintended cross-schema operations.

## Operational guardrails

- Local startup must always pass `METRIC_HUB_SCHEMA=metric_hub_local_roberto`.
- An unset local schema variable falls back to `metric_hub` and could target deployed development data.
- Deployed app service principals should initialize and own their respective `metric_hub` schemas before local processes access those schemas.
- Local migrations and test records must remain in developer-owned schemas.
- Development-to-BA data migration is not implicit and requires separate review and approval.
- Destructive schema operations require explicit approval because dropping a schema removes all application records within it.
- Additional developers should receive unique schemas such as `metric_hub_local_<name>` rather than sharing Roberto's local schema.

## Current interpretation

It is reasonable to describe the application as having three data environments: development, local development, and BA production. For technical accuracy, it has two physical Lakebase databases and three isolated logical application-data environments.

## Supporting context

- `metric-view-hub/README.md` documents the deployed and local schema conventions.
- `metric-view-hub/app.yaml` leaves `METRIC_HUB_SCHEMA` unset for deployed environments.
- `metric-view-hub/server/routes/proposals/proposal-routes.ts` defaults the schema to `metric_hub`.
- `hawaii-ba-app-deployment-readiness.md` records creation of the separate BA Lakebase project and fresh collaboration state.
