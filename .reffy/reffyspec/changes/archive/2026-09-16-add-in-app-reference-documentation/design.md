## Context

The existing React Router application has primary routes for the metric catalog and proposal workflow. Its shell identifies the product as Servco Metric View Hub, and its landing page shows the Auto Retail domain, metric-view binding, OBO access, and Databricks capabilities. The repository README explains that the application is a POC, but the application itself does not consistently distinguish reusable Databricks primitives from Metric Hub-specific choices.

The documentation needs to serve two audiences without creating a second application, a separate documentation deployment, or a runtime dependency on the SQL warehouse or Lakebase.

## Goals / Non-Goals

### Goals

- Make reference-implementation status continuously discoverable without presenting it as an error or unsafe condition.
- Give product users an understandable guide to Metric View Hub's purpose and behavior.
- Give FDEs an implementation-oriented guide that separates platform primitives, example architecture, environment bindings, and replaceable product choices.
- Make short contextual cues lead to stable, deeper explanations.
- Keep documentation accessible, responsive, version-controlled, safe to render, and available when application data services are unavailable.

### Non-Goals

- General Databricks product documentation or a replacement for official platform documentation.
- A generic scaffolding wizard, automated resource discovery, or automatic reconfiguration of this app for another domain.
- Runtime inspection of the workspace, SQL warehouse, Unity Catalog, Lakebase, identities, or permissions.
- Changes to proposal authorization, workflow behavior, analytics queries, data models, APIs, resource bindings, or deployment configuration.
- Exposing credentials, connection details, private environment variables, or user-specific local settings.

## Audience, Genre, and Composition

The user guide targets business users, reviewers, admins, and demo participants whose primary question is "What does this app do and how should I use it?" The FDE guide targets engineers whose primary question is "Which Databricks primitives are demonstrated here, and what must I adapt?"

The documentation area uses a magazine/repository hybrid: short narrative sections establish purpose and boundaries, while cards, a classification matrix, accordions, stable section anchors, and source links support quick lookup. The page hierarchy is semantic rather than duplicating the existing analytic dashboard layout.

## Decisions

### 1. Route and navigation structure

Add nested documentation routes:

- `/docs` redirects to `/docs/app`.
- `/docs/app` renders the Metric View Hub Guide.
- `/docs/fde` renders the FDE Reference Guide.

Add one `Documentation` item to desktop and mobile primary navigation. A shared documentation layout renders a route-aware AppKit `Tabs` switcher for `Metric View Hub Guide` and `FDE Reference Guide`, with the selected tab derived from the URL and tab changes navigating to the corresponding route. Sections that receive contextual links use stable, human-readable HTML ids.

The shell renders a permanent AppKit `Badge` labeled `Reference implementation` as a link to `/docs/fde`. Its accessible name must remain clear at narrow widths, including in the existing mobile `Sheet` navigation.

### 2. Layered disclosure

The permanent badge provides continuous provenance. The metric catalog landing page adds a non-destructive AppKit `Alert` explaining that Auto Retail data, resource bindings, roles, and workflow are a preconfigured example; it provides separate actions to the user guide and FDE guide. This callout is not an error and is not hidden behind a one-time tour.

Compact contextual badges or links identify important examples such as the Auto Retail domain, metric view, OBO execution, and proposal workflow. They contain only a short label and deep-link to the longer explanation, avoiding repeated blocks of documentation on product screens.

### 3. User-guide content

The Metric View Hub Guide presents:

1. Purpose, audience, and product boundary.
2. Metric catalog discovery and governed analytics behavior.
3. Proposal creation, review, versioning, comments, approval, export, and publication-record workflow.
4. Reviewer and admin roles, including the fact that server authorization remains authoritative.
5. OBO analytics identity and the separate Lakebase application-state boundary.
6. The engineering handoff boundary: exported SQL/YAML is a candidate and the app does not create or replace Unity Catalog objects.
7. Current limitations and task-oriented FAQs.

### 4. FDE-guide content and taxonomy

The FDE Reference Guide begins with the reference-implementation statement and an architecture overview. Its central table maps each concern through four columns: capability, Databricks primitive, Metric Hub example, and expected adaptation.

Every mapped item receives one or more controlled classification labels:

- `Databricks primitive`
- `Example implementation`
- `Metric Hub default`
- `Environment binding`
- `Replace for your app`

The guide covers Databricks Apps/AppKit, React and Express composition, AppKit Analytics and the SQL warehouse, Unity Catalog Metric Views, OBO execution, Lakebase application state, roles, proposal workflow, artifact export, bundle/resource bindings, local development, deployed execution, and the publication boundary. It also includes a source-code map and an ordered customization checklist.

### 5. Content ownership and freshness

Store display content and its classifications in typed modules under `client/src/content/`; page components own composition, not long duplicated literals. Reuse existing client-visible constants where doing so reduces drift. Maintain a small, explicit allowlist for any displayed binding identifiers.

The first implementation is curated at build time. It does not read `.env`, call a new API, enumerate workspace resources, or infer configuration from credentials. Documentation routes therefore render without loading states and remain available if analytics or Lakebase is unavailable. Existing data screens retain their own loading, empty, error, and partial-state obligations.

Repository operational documents remain canonical for setup commands and detailed maintenance history. The in-app FDE guide summarizes those concerns and links to them; it does not copy the full workstation guide or POC playbook.

### 6. AppKit component and visual plan

- Shell reference marker: `Badge` with `asChild` and a React Router link.
- Landing explanation: `Alert`, `AlertTitle`, `AlertDescription`, and `Button` links.
- Documentation switcher: controlled `Tabs`, `TabsList`, and `TabsTrigger` synchronized with the current route; each route renders its corresponding content panel.
- Narrative and grouped sections: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `Separator`.
- Primitive/default matrix: responsive `Table` primitives with classification `Badge` elements; provide a stacked small-screen presentation if horizontal table scanning becomes unusable.
- FAQs and adaptation details: `Accordion`, `AccordionItem`, `AccordionTrigger`, and `AccordionContent`.
- Source and contextual links: `Button` with `asChild` or semantic inline links as appropriate.
- Mobile access: extend the existing `Sheet` navigation.

Use AppKit semantic tokens and existing Servco theme variables. Reference status is informational, so it must not use destructive or warning semantics. Do not introduce raw palette utilities or hard-coded colors for these elements.

### 7. Accessibility and responsive behavior

All navigation and deep links must be keyboard operable and retain visible focus. Page titles use a consistent heading hierarchy; section anchors land on visible headings and account for the sticky header. Classification never relies on color alone. The primitive table must remain readable on small screens through responsive overflow or a stacked equivalent, and the documentation switcher must not force the application wider than the viewport.

### 8. Verification strategy

Add Vitest coverage for the structured content model, required guide sections, classification values, route definitions, and the public identifier allowlist. Add or update the AppKit Playwright smoke test with role-based selectors so it directly loads both documentation routes and confirms the shell reference marker and unique page headings.

Run formatting, ESLint, AppKit AST-grep lint, TypeScript checks, Vitest, and production build. Before any workspace-backed `databricks apps validate`, show the configured Databricks profiles and obtain the user's profile selection; pass it explicitly. Manually verify desktop and mobile navigation, keyboard focus, deep-link anchors, table responsiveness, and documentation availability when data requests fail.

## Risks / Tradeoffs

- Curated content can drift from configuration. Typed structure, explicit ownership, source links, focused tests, and reuse of safe constants reduce but do not eliminate that risk.
- More primary navigation increases shell density. A single Documentation entry plus an internal switcher is less costly than two new primary links.
- Exact resource identifiers help FDEs but can create accidental coupling. The guide will emphasize logical roles and expected adaptation, display only allowlisted identifiers, and never describe existing tenant resources as disposable.
- Interspersed labels can clutter the working app. Only concepts with meaningful documentation targets receive cues; full explanations remain on the guide pages.

## Reffy Inputs

- `in-app-reference-documentation.md`

## Open Questions

None. The choices above are ready for user review; requested revisions should be applied to this change before implementation approval.
