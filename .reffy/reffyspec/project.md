# Project Context

## Purpose

Metric View Collaboration Hub is a Databricks App proof of concept for business stakeholders, reviewers, and engineers to discover governed Unity Catalog metrics, propose structured changes, discuss and approve proposals, and download deterministic SQL/YAML candidates for engineering review. Business users do not need Unity Catalog write access or SQL/YAML expertise.

The repository also records a repeatable Forward Deployed Engineer (FDE) workflow from product seed to deployed POC. Reffy now provides the repository's planning workspace; existing project documents remain source material rather than being copied into new specs automatically.

## Tech Stack

- Node.js 22 or newer; TypeScript with ES modules.
- React 19, React Router 7, Vite (the pinned rolldown-vite alias), Tailwind CSS 4, AppKit UI, and Lucide icons.
- Databricks AppKit 0.74.0 with analytics, Lakebase, and server plugins; Express API and Zod request validation.
- Databricks SQL Warehouse for metric-view reads; Unity Catalog for governed analytics data; Lakebase PostgreSQL for collaboration state.
- Databricks CLI 1.0.0 or newer, OAuth profiles, Databricks Apps, and Declarative Automation Bundle configuration.
- Vitest, TypeScript checks, ESLint, AppKit AST-grep lint, Prettier, and tsdown server bundling.
- Repository-root planning tooling: pnpm 10.34.5 and reffy-cli 1.9.4, pinned by package.json and pnpm-lock.yaml.
- Application dependencies: npm and package-lock.json under metric-view-hub/. Root pnpm tooling does not migrate the app to pnpm or create a pnpm workspace.

## Project Conventions

### Code Style

- Follow metric-view-hub/.prettierrc.json: two spaces, semicolons, single quotes, ES5 trailing commas, 120-column print width, and automatic line-ending detection.
- Follow the typed ESLint configuration, React Hooks rules, and AppKit AST-grep checks. Validate external input with Zod; use parameterized SQL for values and validated identifiers for schema selection.
- Keep UI code in client/src/, API code in server/, shared contracts in shared/, and metric definitions in config/metric-views/.
- Use PascalCase for React components and descriptive names consistent with neighboring modules.
- Follow style/SERVCO_STYLEGUIDE.pdf for UI changes. Preserve the established Makai/Nalu palette, responsive containment, and readable layouts. Do not invent or redistribute unavailable brand/font assets.

### Architecture Patterns

- Repository root contains the product seed, proposal, workstation guide, playbook, and Reffy workspace. The deployable app lives in metric-view-hub/.
- server/server.ts composes AppKit plugins; server/dev.ts and server/start.ts set the environment before loading the application. Keep startup commands compatible with Windows and macOS; quote shell glob arguments.
- Analytics reads use useMetricView and the auto_retail definition, currently hawaii_prod.testing.vw__metrics_test. Deployed queries use executor: "user" and the app's sql user API scope for on-behalf-of (OBO) authorization.
- Lakebase stores proposals, immutable versions, comments, transitions, and audit events. The deployed service principal owns metric_hub. Local development selects a validated METRIC_HUB_SCHEMA such as metric_hub_local_roberto.
- API routes enforce workflow transitions and admin-only acceptance independently of UI controls. Configured APP_ADMIN_EMAILS grant admin; other users default to reviewer. LOCAL_DEV_EMAIL is a development-only identity fallback.
- The app generates downloadable engineering artifacts; it does not execute their Unity Catalog CREATE/REPLACE statements. A publication-record status is not proof that the app published a catalog object.
- Commit generated metric metadata/contracts used by remote builds. Development validation regenerates them under the developer's selected profile; remote install/build must not require extra direct catalog access for the app service principal.
- app.yaml describes deployed startup/settings; app.local.yaml runs the local hot-reload entry point. databricks.yml contains target variables and resource bindings.

### Testing Strategy

From metric-view-hub/, run checks appropriate to the change:

```sh
npm run format
npm run lint
npm run typecheck
npm test
npm run build
databricks apps validate --profile hawaii-dev-workspace
```

The Databricks validator covers type generation, AST-grep lint, type checking, build, and tests. Current focused Vitest coverage checks deterministic artifact generation, workflow transitions, admin/reviewer behavior, and schema identifier validation. Use meaningful regression tests for changed behavior; do not treat compilation as proof of runtime permissions.

For integration checks, use the selected development resources and verify health, /api/me, proposal access, and a metric query. Local reads use the CLI-authenticated developer identity; verify browser-user OBO permissions with the deployed app separately. Keep write tests in the selected developer schema.

For Reffy setup and planning checks, run commands from the repository root:

```sh
pnpm exec reffy doctor
pnpm exec reffy validate
```

Follow the managed skill discovery instructions in AGENTS.md before Reffy workflows. Reindex and validate after artifact changes; validate change proposals before implementation and archive them when their work has shipped.

### Git Workflow

- GitHub repository: servco-fde/dapps-poc; default branch: main. Both laptops synchronize code through GitHub.
- Prefer focused feature branches and pull requests for substantive changes, following the existing repository workflow. Use concise, descriptive commits. Commit/push/deploy when requested; these are separate actions.
- Keep .env files, credentials, node_modules, build outputs, and logs out of Git. Commit root planning manifests/lockfile and application source/lockfile in their respective scopes.
- Preserve existing uncommitted work when synchronizing machines. Keep changes reviewable and validate before deployment.
- Reffy artifacts belong in .reffy/artifacts/. Canonical specs belong in .reffy/reffyspec/specs/; active changes belong in .reffy/reffyspec/changes/. Follow generated instructions for supported layouts and append-only archives.

## Domain Context

The initial governed metric view concerns Auto Retail vehicle sales and finance-and-insurance metrics, including deal count, GPVR, PVR, and penetration measures. Proposal forms capture purpose, owner, acceptance criteria, source/target identifiers, dimensions, measures, and rationale.

The workflow is:

```text
draft -> in_review -> changes_requested -> in_review
                   -> approved -> exported -> published
```

Only application admins can accept an in-review proposal. Revisions use optimistic version checks and preserve immutable history. Engineering implements approved catalog changes through its own review/deployment process.

Existing source documents (paths relative to repository root):

- README.md: overview and current capabilities.
- seed-1.md: original product intent.
- seed-1-proposal.md: architecture and delivery proposal; some items describe future work.
- metric-view-hub/README.md: current app commands and resources.
- dapps-env-setup.md: FDE workstation guide, originally written for Windows.
- reference-app-poc-playbook.md: build journal, decisions, verification, and partial-isolation boundary.

Databricks-group role mapping, richer revision UI, and automated Git pull-request handoff are future directions, not completed capabilities. Consult current code and specs before assuming a proposal or journal entry describes shipped behavior.

## Important Constraints

- This POC offers **partial developer isolation**. A unique METRIC_HUB_SCHEMA separates the app's local proposal records and schema initialization from deployed metric_hub records. It does not restrict the developer's underlying permissions.
- Developer schemas share the Lakebase database and production-named branch with the deployed POC. Analytics still reads the production Unity Catalog metric view through a dedicated development warehouse. This is not a separate production-independent data environment.
- The same developer can reuse their schema from multiple laptops under the same Databricks identity. Each laptop needs its own ignored .env and working OAuth profile. Different developers should select distinct schemas.
- Use the explicit hawaii-dev-workspace profile for this POC. Do not silently substitute a workspace, warehouse, database, or schema.
- Keep governance reads and artifact export separate from catalog writes. Preserve server authorization and schema-identifier validation.
- Local development requires cloud services; it is not an offline Databricks emulator. AppKit's local cache may fall back to memory after a non-blocking ownership warning on service-principal-owned cache tables.
- Stop deployed app compute outside development/demo sessions. The dedicated warehouse auto-stops after five idle minutes, so first queries can incur startup latency. Resource settings and live state should be checked when operational decisions depend on them.
- Store credentials only in approved local/platform mechanisms. Do not commit tokens, service-principal secrets, or local environment files.

## External Dependencies

| Service/resource | Current POC binding |
| --- | --- |
| Workspace/profile | hawaii-dev-workspace at https://adb-4192082222593323.3.azuredatabricks.net |
| Databricks App | metric-view-hub |
| SQL warehouse | metric-view-hub-dev (d789a5e994a1ea33) |
| Unity Catalog metric view | hawaii_prod.testing.vw__metrics_test |
| Lakebase project | projects/metric-view-hub |
| Lakebase branch | projects/metric-view-hub/branches/production |
| Lakebase database | databricks_postgres; database resource ends in databases/databricks-postgres |
| Lakebase endpoint | projects/metric-view-hub/branches/production/endpoints/primary |
| Source control | GitHub servco-fde/dapps-poc |
| Documentation tooling | Databricks agent skills and Developer Hub Docs MCP, https://developers.databricks.com/api/mcp |

Reffy is initialized locally with project_id and workspace_ids set to dapps-poc. No Reffy remote workspace is configured as part of this setup. Resource identifiers are configuration, not credentials; databricks.yml and verified workspace state are the sources for binding changes.
