# Change: Add in-app reference documentation

## Status

Implementation approved by the user on 2026-09-16. Application work, local verification, and workspace-backed Databricks validation with the user-selected `hawaii-dev-workspace` profile are complete.

## Why

Metric View Hub is both a working Auto Retail application and a reference implementation for Forward Deployed Engineers (FDEs). The deployed interface currently looks like a finished domain product, while the explanation that its metric view, resource bindings, roles, and proposal workflow are example choices lives primarily in repository documentation.

Users need a clear explanation of what Metric View Hub does and how to use it. FDEs need a different layer that shows how Databricks primitives are assembled, which choices are Metric Hub-specific, and what they should replace for their own application. Mixing both audiences into one long page would either overwhelm product users or underserve implementers.

## What Changes

- Add a Documentation area to the application with stable, independently addressable routes for a user-facing Metric View Hub Guide and an FDE Reference Guide.
- Add the Metric View Hub Guide content: purpose, audience, supported tasks, roles, proposal lifecycle, governed access, publication boundary, limitations, and frequently asked questions.
- Add the FDE Reference Guide content: reference status, architecture, Databricks primitive mapping, example defaults, environment bindings, code map, customization checklist, and local-versus-deployed behavior.
- Add a permanent `Reference implementation` marker to the application shell, a landing-page informational callout, and contextual cues that deep-link to relevant guide sections.
- Classify reference content consistently as a Databricks primitive, example implementation, Metric Hub default, environment binding, or replaceable application choice.
- Store the guide content in version-controlled, structured client content rather than adding a new runtime documentation service or querying Databricks resources dynamically.
- Add responsive and accessible navigation, focused documentation tests, and browser smoke coverage for the new routes and reference markers.

## Impact

- Affected spec: `in-app-reference-documentation` (new capability).
- Expected application areas: `metric-view-hub/client/src/App.tsx`, the metric catalog landing page, new documentation page/components/content modules, shared styling, and focused tests.
- Expected documentation impact: update the app README only as needed to identify the in-app guides and their content ownership; existing repository guides remain deeper operational sources.
- No database migration, API endpoint, Databricks resource, permission, binding, authentication, provisioning, or deployment change is required.
- This is independent of `add-fde-workstation-setup` and does not alter or supersede it.

## Review Decisions

1. The application will expose `/docs/app` and `/docs/fde`; `/docs` will redirect to the user-facing app guide.
2. The primary shell will gain one `Documentation` entry rather than separate top-level entries for both audiences. The documentation area will provide its own route-aware guide switcher.
3. The shell's `Reference implementation` marker will remain visible on every route and link directly to the FDE guide.
4. The first implementation will use curated, build-time content and a deliberate public inventory. It will not fetch workspace or resource metadata at runtime.
5. The guides will use "preconfigured example resources" and will not imply that all tenant bindings are disposable, app-created, or safe to modify.
6. Exact identifiers will be shown only when they are already public within this internal application and help an FDE understand a binding. Secrets, tokens, connection strings, user-specific local values, and credential-bearing environment data are excluded.

## Supersedes

None.

## Reffy References

- `in-app-reference-documentation.md` - defines the audience split, information architecture, reference classifications, UX cues, maintenance constraints, and planning boundary.
