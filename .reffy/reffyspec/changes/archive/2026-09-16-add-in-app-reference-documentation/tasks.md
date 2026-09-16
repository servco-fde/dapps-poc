## 0. Approval gate

- [x] 0.1 Explicit user approval received on 2026-09-16 before application implementation began.

## 1. Documentation content model

- [x] 1.1 Define typed, version-controlled content modules for the Metric View Hub Guide, FDE Reference Guide, stable section ids, controlled classification labels, and the safe public binding inventory.
- [x] 1.2 Add content-model tests for required sections, unique/stable ids, allowed classification values, safe links, and exclusion of credential-bearing or user-specific values.

## 2. Routes and application navigation

- [x] 2.1 Add `/docs/app` and `/docs/fde` routes plus a `/docs` redirect to the app guide.
- [x] 2.2 Add one Documentation entry to desktop navigation and the existing mobile Sheet, preserving active-state, focus, containment, and narrow-screen behavior.
- [x] 2.3 Build the shared documentation layout and route-aware AppKit Tabs switcher with independently addressable, accessible guide pages and stable section anchors.
- [x] 2.4 Add the permanent `Reference implementation` Badge link to the application shell on desktop and mobile.

## 3. Guide pages

- [x] 3.1 Implement the Metric View Hub Guide covering purpose, audience, supported tasks, proposal lifecycle, roles, governed access, application-state boundary, engineering handoff, limitations, and FAQs.
- [x] 3.2 Implement the FDE Reference Guide covering reference status, architecture, primitive mapping, controlled classifications, public resource topology, code map, customization checklist, operating modes, and source links.
- [x] 3.3 Compose the pages from confirmed AppKit Card, Alert, Badge, Tabs, Table, Accordion, Separator, and Button primitives using semantic tokens and the established Servco theme.
- [x] 3.4 Ensure the primitive matrix, guide switcher, headings, links, and accordions are accessible and usable at mobile, tablet, and desktop widths.

## 4. Contextual reference cues

- [x] 4.1 Add the non-destructive landing-page Alert with concise reference copy and separate links to the user and FDE guides.
- [x] 4.2 Add a small, curated set of contextual links for the Auto Retail domain, metric-view binding, OBO execution, and proposal workflow; avoid duplicating long guide content on product screens.
- [x] 4.3 Verify that every contextual link targets a stable visible section and that classification is not communicated by color alone.

## 5. Documentation integration

- [x] 5.1 Update `metric-view-hub/README.md` to identify the in-app guides, their intended audiences, and the boundary between in-app summaries and repository operational documentation.
- [x] 5.2 Confirm that the implementation adds no runtime resource-discovery call, API endpoint, secret exposure, database migration, permission change, resource binding, or cloud-resource change.

## 6. Verification

- [x] 6.1 Add or update AppKit Playwright smoke coverage to load both documentation routes directly and verify unique headings, the permanent reference marker, and navigation using role-based selectors.
- [x] 6.2 Run `npm run format`, `npm run lint`, `npm run lint:ast-grep`, `npm run typecheck`, `npm test`, and `npm run build` from `metric-view-hub/`.
- [x] 6.3 Show all configured Databricks profiles and obtain the user's selection before running `databricks apps validate --profile <selected-profile>`; do not infer or default the profile.
- [x] 6.4 Manually verify desktop/mobile navigation, keyboard focus, heading hierarchy, deep-link anchor positioning, table responsiveness, and guide availability while analytics or Lakebase requests fail.
- [x] 6.5 Run `reffy plan validate add-in-app-reference-documentation` after planning edits and keep this change unarchived until implementation and verification are complete.
