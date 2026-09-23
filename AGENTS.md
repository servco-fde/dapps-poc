<!-- REFFY:START -->
# Reffy Instructions

These instructions are for AI assistants working in this project.

Always open `@/.reffy/AGENTS.md` when the request:
- Mentions early-stage ideation, exploration, brainstorming, or raw notes
- Needs context before drafting specs or proposals
- Refers to "reffy", "references", "explore", or "context layer"

Use `@/.reffy/AGENTS.md` to learn:
- Reffy workflow for ideation, artifact indexing, and planning scaffolds
- How Reffy owns the runtime while preserving ReffySpec planning files
- How to store and consume ideation context in `.reffy/`

Before performing any Reffy workflow:

1. Inspect `.reffy/skills/` (or run `reffy skill list`) to enumerate available skills.
2. Match the request against each skill's `description` and `triggers`.
3. Read the selected `SKILL.md` completely.
4. Follow that skill before running Reffy commands.

Personal remote-workspace publishing is outside this repository's shared FDE workflow. Do not configure or invoke it for FDE setup, planning, validation, or source synchronization.

Keep this managed block so `reffy init` can refresh the instructions.

<!-- REFFY:END -->

<!-- REFFYSPEC:START -->
# ReffySpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/.reffy/reffyspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Needs the authoritative planning/spec workflow for this repo

Use `@/.reffy/reffyspec/AGENTS.md` to learn:
- How to create and apply ReffySpec change proposals
- ReffySpec format and conventions
- Project structure and planning guidelines

Keep this managed block so `reffy init` can refresh the instructions.

<!-- REFFYSPEC:END -->

## Workstation onboarding

When a user asks to prepare this repository for local development, follow `init.md`. Run the guide's read-only workstation check first. Keep Databricks profile/account selection explicit, obtain approval before repairs or login flows, preserve an existing `.env`, and do not create, start, or deploy cloud resources without an explicit request.

## Metric View Hub local development

When starting `metric-view-hub` locally, do not run bare `npm run dev` or substitute a client-only preview. The complete local app depends on its existing Lakebase project and a developer-owned schema. Preserve `.env`, obtain or reuse the user's explicit Databricks profile selection, and launch the documented full-stack proxy from `metric-view-hub/README.md`:

```sh
databricks apps run-local --entry-point app.local.yaml --profile <selected-profile> --env METRIC_HUB_SCHEMA=<developer-schema> --env LOCAL_DEV_EMAIL=<developer-email>
```

For Roberto's current setup, the developer schema is `metric_hub_local_roberto`. The startup path initializes or migrates that personal schema. Before reporting the app as ready, wait for `[lakebase] <developer-schema> schema is ready`, confirm the routes and server are registered, and make a read-only request to `/api/proposals`. A `must be owner of table appkit_cache_entries` cache warning is separate from the application schema; report it, but treat readiness according to the server and proposal API checks. If startup instead touches the shared `metric_hub` schema or reports ownership failures for `proposals`, stop and verify that `METRIC_HUB_SCHEMA` was passed rather than changing or dropping Lakebase objects.
