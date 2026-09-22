# Metric View Hub architecture and implementation audit

Date: 2026-09-21 (Pacific/Honolulu). Baseline: repository commit `97335aa` plus the supplied, untracked [`architecture.md`](../../architecture.md). Scope: `metric-view-hub` source, configuration, installed dependencies, tests, production compilation, and relevant Reffy context.

## Assessment

Metric View Hub has a useful POC foundation: React, Node.js/Express, Lakebase application storage, and a separate Unity Catalog read path. The original audit identified two differences from the director's preferred stack: AppKit UI/Tailwind instead of Material UI, and handwritten SQL instead of Prisma. Following review, the user selected **retain AppKit UI and adopt Prisma for application persistence**. The UI difference is now an accepted app-specific exception; the persistence migration remains pending. The installed Lakebase driver already documents Prisma integration, so this audit found no platform incompatibility that warrants rejecting Prisma.

Before treating this app as the engineering reference, address approval/version integrity, identity handling, dependency advisories, and the missing revision UI. Preserve the existing separation between company-data reads and application-state writes.

This is an audit and decision input, not an implementation proposal. No app source, dependencies, credentials, database objects, or cloud configuration were changed. Local generated build outputs were refreshed. No application server or cloud resource was started, and no live database was queried. Findings about deployment identity, Entra configuration, grants, and browser behavior remain explicitly unverified.

## Decision after audit review — 2026-09-21

- Retain the existing React/AppKit UI, charts, styling, and analytics hooks. A Material UI migration is no longer recommended for Metric View Hub.
- Use Prisma as the default application persistence layer for proposals, versions, comments, and audit events in Lakebase. Replace routine handwritten CRUD and introduce versioned migrations.
- Retain Node.js/Express and the Lakebase OAuth-aware connection integration. Preserve existing records, developer-schema isolation, atomic workflow writes, and concurrency checks during migration.
- Keep Unity Catalog analytics on the existing read-only, OBO path. Prisma is for app-owned PostgreSQL data; it does not replace the company-data query path or the SQL/YAML handoff generator.
- Permit narrowly justified, parameterized SQL when necessary for an operation Prisma cannot express clearly. The objective is typed, maintainable persistence rather than an absolute prohibition on SQL.

This records the selected direction, not a completed migration. F3 is closed by decision; F5 remains implementation work. The other audit findings remain open, including approval-version integrity and identity handling, which adopting an ORM alone will not fix. [`architecture.md`](../../architecture.md) is preserved as the original director preference; this section records the subsequent app-specific decision.

## Stack alignment against the original director preference

| Director's preference | Observed implementation | Assessment |
| --- | --- | --- |
| React with Material UI | React 19.2.4; components, charts, resource indicators, and metric hooks from `@databricks/appkit-ui` 0.74.0; Tailwind styling | Original mismatch accepted after review: retain AppKit UI. |
| Node.js backend | Node entry point, TypeScript, Express through AppKit `server()` | Aligned; a backend rewrite is not implied by the UI preference. |
| PostgreSQL in Lakebase for app data | AppKit `lakebase()`; proposals, versions, comments, and audit events in a configurable PostgreSQL schema | Aligned. Schema evolution needs work. |
| Unity Catalog read-only for company data | `auto_retail` binds a metric view with `executor: "user"`; structured analytics reads; proposal SQL is downloaded rather than executed | Aligned for implemented application paths. Effective deployed permissions were not rechecked. The declared `sql` scope alone does not establish a read-only permission boundary. |
| Prisma unless there is a reason against it | Parameterized SQL, manual table DDL, and manually maintained TypeScript interfaces; no Prisma dependency/schema/migrations | Prisma selected after review; implementation pending. |
| Databricks platform sign-on with Entra ID | Platform-forwarded identity headers, user SQL scope, and no local login UI | Platform integration is present; actual Entra federation and deployed header behavior require tenant/browser evidence. |
| No other UI library | AppKit UI, Lucide icons, Tailwind, and additional UI helper dependencies | Retain the existing AppKit UI stack under the app-specific decision; do not introduce Material UI alongside it. |
| No local login or hard-coded credentials | No password/login routes found; environment/resource-based configuration and ignored `.env`; development-only email override | No credential literal found in reviewed app source/configuration. Production synthetic-identity fallback is a separate defect, detailed below. |

Evidence: [`package.json`](../../metric-view-hub/package.json):7–84; [`server.ts`](../../metric-view-hub/server/server.ts):1–9; [`definitions.json`](../../metric-view-hub/config/metric-views/definitions.json):1–9; [`databricks.yml`](../../metric-view-hub/databricks.yml); [`app.yaml`](../../metric-view-hub/app.yaml); [`index.css`](../../metric-view-hub/client/src/index.css):1; [`proposal-routes.ts`](../../metric-view-hub/server/routes/proposals/proposal-routes.ts).

Workspace URLs, resource IDs, and the admin email allowlist are configuration, not passwords. This review excluded private `.env` contents and Git history; it is not a complete secret scan.

## Prioritized findings

Priorities indicate remediation importance for this app. Only dependency advisory severities below are externally assigned security ratings.

### F1 — High: approval is not tied to the version reviewed

The status request contains only `status`. The server reads the current status and updates with `WHERE id = $1 AND status = $2`, without matching `current_version`. An admin can leave version 1 open, another reviewer can request changes and an API client can revise/resubmit version 2, and the admin's stale Accept action can approve version 2. The UI's displayed version does not protect this operation.

Evidence: `client/src/pages/ProposalDetailPage.tsx:71–79`; `server/routes/proposals/proposal-routes.ts:62–64,464–507`. A local handler probe supplied `expectedVersion: 1`; validation discarded that unknown field and the captured update had no version predicate. A mocked version-2 response was accepted with HTTP 200. This establishes the missing check, not a live database race test.

Recommendation: require the reviewed version on transitions, match it atomically with status, return 409 for stale actions, and record the version in the approval event. Add a stale-review integration test. Preserve the existing admin-only approval check.

### F2 — High: production dependency audit reports three underlying advisories

`npm audit --omit=dev --json` returned **nine high-severity affected package entries**, zero critical, on this audit date. The nine include dependency propagation; they are not nine independent vulnerabilities.

| Underlying advisory | Reported affected package | Reported path/condition to investigate |
| --- | --- | --- |
| [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh) | `js-yaml` | Reached through AppKit/AppKit UI and other dependencies; CPU exhaustion when processing crafted YAML. |
| [GHSA-q7rr-3cgh-j5r3](https://github.com/advisories/GHSA-q7rr-3cgh-j5r3) | OpenTelemetry Prometheus exporter / SDK | Via `@mlflow/core`; investigate whether an affected exporter is enabled and reachable. |
| [GHSA-45rx-2jwx-cxfr](https://github.com/advisories/GHSA-45rx-2jwx-cxfr) | OpenTelemetry Jaeger propagator | Investigate whether affected header propagation is enabled on incoming requests. |

Evidence: current npm audit result against this dependency tree and [`package-lock.json`](../../metric-view-hub/package-lock.json). npm reported no automatic fix for the top-level AppKit packages and `js-yaml` in this resolution. That does not mean patched upstream versions do not exist.

Recommendation: determine runtime reachability, select compatible patched versions or narrowly justified overrides, and rerun build and security checks. Do not equate package presence with an exploitable deployed endpoint. No exploit was run and no dependency repair was applied.

### F3 — Closed by decision: retain AppKit UI

The original audit classified Material UI alignment as a high architecture priority. Every main screen depends on AppKit UI primitives, charts and metric hooks are imported from the same package, and the global stylesheet imports AppKit styles. The user reviewed that migration cost and chose to retain AppKit UI.

Evidence: `package.json:32–46`; `client/src/App.tsx:3–11`; `client/src/pages/MetricCatalogPage.tsx:2–22`; `client/src/index.css:1`. This is a cross-screen migration rather than a theme adjustment.

Disposition: retain React/React Router, AppKit UI, `useMetricView`, and the existing styling. Address the independent usability and bundle findings within that stack. No Material UI migration is part of the selected direction.

The current canonical [documentation spec](../reffyspec/specs/in-app-reference-documentation/spec.md) explicitly requires AppKit presentation. Retaining AppKit is consistent with that requirement, so this decision does not require superseding the UI specification.

### F4 — Medium: missing production identity becomes a synthetic reviewer

`requestActor` falls back to `local-developer@databricks.invalid` even outside development. Empty forwarded email also becomes an empty actor rather than an authentication error. Custom proposal read routes do not require an actor, and mutation routes accept the fallback.

Evidence: `server/routes/proposals/proposal-routes.ts:177–182,248–252,314–320`. With production mode and no forwarded header, a local handler probe returned HTTP 200 from `/api/me` with the synthetic reviewer. A validated proposal create returned HTTP 201 and supplied that synthetic email to the mocked database.

Impact: if a request reaches these routes without the expected trusted identity, the application permits reviewer behavior and loses reliable human attribution. Databricks' authenticated proxy is an important outer boundary; this probe does **not** demonstrate bypass of that proxy or a deployed anonymous-access vulnerability. Platform forwarding and OBO are documented in [Azure Databricks authorization](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-apps/auth).

Recommendation: reject missing/empty identity on business APIs in production, keep an explicit development-only identity path, and test the deployed trust boundary and admin/reviewer matrix. Entra verification belongs at the platform/tenant boundary; adding local login is unnecessary.

### F5 — Medium: persistence has neither Prisma nor versioned migrations

Decision status: Prisma selected after audit review; implementation and migration validation remain pending.

`SCHEMA_STATEMENTS` runs `CREATE ... IF NOT EXISTS` before route registration. This bootstraps empty databases, but does not upgrade existing columns or constraints. Future changes to these strings can leave existing schemas incompatible. Route registration is also coupled to successful database initialization.

Evidence: `server/routes/proposals/proposal-routes.ts:113–169,237–245`; no migration directory or Prisma schema exists in the app inventory. Persistence contracts use `Record<string, unknown>[]` plus separately maintained client interfaces.

Recommendation: introduce Prisma models and versioned migrations for application tables while retaining the Lakebase OAuth-aware pool. Baseline existing tables and preserve both the deployed schema and developer-owned schemas; do not reset them. Maintain atomic proposal/version/audit writes and optimistic concurrency, using parameterized raw SQL where that is the clearer transaction boundary.

The [DevHub Lakebase development documentation](https://developers.databricks.com/docs/lakebase/development) exposes ORM-ready configuration and a standard pool. The installed `@databricks/lakebase/README.md:199–211` includes a `PrismaPg(pool)` example. Integration still needs a small validation of the selected Prisma/adapter versions, token renewal, schema selection, and migration identity. The real reason to defer is migration effort in an existing POC, not a demonstrated Lakebase incompatibility. Prisma would apply to app-owned PostgreSQL data; Unity Catalog analytics should stay on its existing governed read path.

### F6 — Medium: the browser cannot complete the revision workflow

The backend has a versioned PUT endpoint. The client only has a new-proposal builder that POSTs, a detail page, and status actions. No edit route, edit link, or PUT caller exists. After requesting changes, a browser user can resubmit unchanged content but cannot make the promised revision in the UI.

Evidence: `client/src/App.tsx:114–117`; `client/src/pages/ProposalBuilderPage.tsx:24–95`; `client/src/pages/ProposalDetailPage.tsx:29–36`; `server/routes/proposals/proposal-routes.ts:367–427`. The guide describes revision at `client/src/content/documentation.ts:120`.

Recommendation: reuse the builder for allowed editable states, load the current draft/version, submit via PUT with `expectedVersion`, and present 409 recovery. Add a browser test covering request-changes, edit, resubmit, and accept.

### F7 — Medium: generated SQL does not protect its outer dollar delimiter

The generator JSON-quotes YAML scalar values but wraps the result in `AS $$ ... $$`. Accepted free text can contain `$$`; quoting it for YAML does not escape the surrounding SQL delimiter.

Evidence: `server/routes/proposals/proposal-routes.ts:185,200–232`. A valid request with purpose `Description includes literal $$ delimiters.` passed the actual route validator and produced an artifact with three `$$` occurrences rather than the two delimiters. No generated SQL was executed.

Impact: valid application input can produce a broken handoff; crafted input may change what an engineer later executes. The app itself still performs no Unity Catalog write.

Recommendation: reject or safely encode delimiter-breaking content using verified Databricks syntax, and add artifact validation for delimiter characters, multiline text, and duplicate member names. Keep generated output subject to engineering review.

### F8 — Medium: passing unit tests leave important behavior untested

The four Vitest files contain 18 passing tests, mainly pure workflow/generation helpers, deployment configuration, audit-event formatting, and documentation content. They do not exercise real HTTP authorization, database rollback/concurrency, migrations, or OBO isolation. The only Playwright smoke test checks documentation navigation.

In this checkout, `@playwright/test` 1.63.0 is declared but absent from `node_modules`; all other exact direct dependency versions matched their declarations. `npm run lint` fails with 32 type-safety errors in `tests/smoke.spec.ts`, consistent with that missing package. App `typecheck` excludes the standalone browser-test project, so its success does not contradict this failure.

Evidence: `server/routes/proposals/proposal-routes.test.ts`; `tests/smoke.spec.ts`; `tests/tsconfig.json`; `tsconfig.server.json`; `package.json:12,52`. No repository CI workflow was found in the inspected tree.

Recommendation: restore the declared development dependency in a separate repair, rerun lint, include the browser-test project in type validation, and add targeted API/database and browser coverage for F1/F4/F6/F7. Preserve explicit full-stack proxy setup and a developer-owned schema for integration testing.

### F9 — Medium: proposal listing silently hides records after 200

The list endpoint always returns the latest 200 proposals without a cursor, total, or truncation flag. The UI renders the array without pagination. Older records become undiscoverable through the list, although direct links can still work. Detail loading also returns all versions/comments/events without a page boundary.

Evidence: `server/routes/proposals/proposal-routes.ts:252–303`; `client/src/pages/ProposalListPage.tsx:18–28,79`.

Recommendation: add bounded pagination with a deterministic tie-breaker, status/search filtering, and an explicit result count or next-page indicator. Page long histories separately when needed.

### F10 — Medium: data context, empty states, and form labeling need correction

The catalog's KPI caption says `source dates from 2024`, but requests do not specify a date filter and the caption is not derived from returned coverage or refresh metadata. No-data summaries render no KPI explanation, and empty chart arrays still enter the chart branch. The proposal list shows `No proposals yet` after a failed initial fetch because its empty state does not exclude `error`.

Repeated dimension/measure labels are not associated with unique input IDs, and acceptance-criteria inputs rely on placeholders. The Comparison tab promises a field-level summary but shows identifiers and counts rather than an actual definition comparison.

Evidence: `client/src/pages/MetricCatalogPage.tsx:65–82,161–191,213–246`; `client/src/pages/ProposalListPage.tsx:50–72`; `client/src/pages/ProposalBuilderPage.tsx:275–470`; `client/src/pages/ProposalDetailPage.tsx:268–295`.

Recommendation: show an explicit query period or describe the results as unfiltered history; expose actual coverage and fetch freshness separately. Make loading/empty/error/partial states mutually intelligible. Associate every repeated control with a stable label and render server field-validation messages. Rename the comparison to a reference summary until an actual diff exists. These conclusions come from source inspection; no visual or assistive-technology test was performed.

### F11 — Low: initial client bundle and duplicated resource UI add overhead

The client build reports a 1,223.60 kB minified main JavaScript chunk (394.51 kB gzip), plus a separate Arrow chunk. All pages are eagerly imported. `ResourceStatusProvider` and `ResourceStatusIndicator` are mounted in both `main.tsx` and `App.tsx`.

Evidence: production build output; `client/src/App.tsx:16–21,131–138`; `client/src/main.tsx:18–21`.

Recommendation: mount resource feedback once, lazy-load page/chart code where useful, and remeasure within the retained AppKit stack. This is a bundle-size observation, not a measured page-load or server-latency regression.

## Selected component and persistence direction

Audience: metric reviewers and admins who browse governed definitions, interpret summary results, and collaborate on changes. The closest data-screen genre is a repository/catalog with an analytic overview. Keep the existing four summary metrics and two charts, but make period, source, and data states explicit.

| Existing concern | Selected direction |
| --- | --- |
| AppKit shell, Sheet navigation, buttons, cards, badges | Retain existing AppKit primitives and styling |
| Builder inputs/selects and validation | Retain AppKit `Input`, `Textarea`, `Select`, and `Label`; associate unique input IDs and expose field-validation messages |
| Tabs, documentation, and review history | Retain AppKit `Tabs`, `Accordion`, and `Table`, with semantic headings |
| Loading, errors, empty results, resource notifications | Use AppKit `Skeleton` and `Alert`, explicit empty-state content, and one resource-status provider/indicator |
| AppKit bar/line charts | Retain `BarChart` / `LineChart`; add source/period labels and an accessible tabular alternative |
| `useMetricView` and format helpers | Retain the existing analytics hooks, OBO behavior, and metadata formatting |
| AppKit backend | Keep Node/Express and useful server-side AppKit integration; isolate framework details behind services |
| Handwritten PostgreSQL access | Prisma models/repositories over the Lakebase pool; versioned migrations and atomic workflow writes |

The persistence migration should preserve the current API contracts where practical, keeping the UI independent of Prisma implementation details. Use Prisma transactions and conditional writes to retain the existing proposal/version/audit atomicity and implement the reviewed-version guard from F1.

## Verification record

| Check | Result and limits |
| --- | --- |
| `npm test` | Passed: 4 files, 18 tests. First sandboxed attempt hit Windows `spawn EPERM`; rerun outside sandbox passed. |
| `npm run typecheck` | Passed for the app's configured server/client projects. |
| `npm run lint` | Failed: 32 errors in the smoke test; declared Playwright package is missing locally. No repair applied. |
| `npm run build:server` | Passed. |
| `npm run build:client` | Passed outside sandbox after the restricted attempt failed with `EPERM` and native dependency bundling errors. Main-chunk size warning remains. |
| Full `npm run build` lifecycle | Not run: invoked its compilation steps directly to avoid `prebuild`'s generated-file synchronization. |
| Production dependency audit | Completed with nonzero exit: 9 high affected-package entries, 3 underlying advisories. |
| Focused route probes | Actual route module transpiled in memory; mocked Express registration and Lakebase query calls. Confirmed synthetic identity, accepted embedded delimiter, and absent approval-version check. No HTTP proxy or real transaction was tested. |
| Secret review | No credential literal found in reviewed application code/configuration; private environment files and history excluded. |
| Browser/OBO/Entra/database integration | Not run. No app startup, login, cloud inspection, database mutation, or deployment performed. |

Suggested sequence: resolve approval/identity defects and dependency exposure; restore reliable validation; then implement Prisma persistence with schema preservation and revision UI coverage while retaining AppKit UI. Verify Entra sign-on, trusted identity forwarding, least-privilege company-data reads, and role enforcement in the selected deployed environment before declaring runtime conformance.

## Context retained for subsequent planning

- [`architecture.md`](../../architecture.md) supplies the original director preference and remains unchanged/untracked by this audit. The decision above records the subsequent choice to retain AppKit UI and adopt Prisma.
- [`hawaii-ba-app-deployment-readiness.md`](hawaii-ba-app-deployment-readiness.md) supplies historical deployment evidence; its pending browser checks and resource state were not revalidated here.
- [`in-app-reference-documentation.md`](in-app-reference-documentation.md) and the canonical documentation spec explain the existing AppKit design choice.
- [`README.md`](../../metric-view-hub/README.md) remains the operational source for the full-stack local proxy, selected profile, and developer-owned schema boundary.
- Reffy `create-artifact`, Databricks app-design, and Lakebase guidance informed this assessment. A later architecture migration should be a separate ReffySpec change linked to this artifact.
