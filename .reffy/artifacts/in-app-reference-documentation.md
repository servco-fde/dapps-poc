# In-app reference documentation

## Problem and intent

Metric View Hub is both a working Databricks App and a reference implementation for new Forward Deployed Engineers (FDEs). The current interface presents a polished Auto Retail application but does not make it sufficiently clear that its domain, resource bindings, roles, and proposal workflow are one example configuration rather than required defaults for future apps.

The desired UX should preserve the usefulness of the working product while teaching an FDE how Databricks primitives are assembled inside the tenant. Short contextual cues should identify reference-specific choices, while dedicated in-app documentation provides the longer explanation.

## Audience split

The documentation should separate two concerns:

- A user-facing Metric View Hub guide explains the app's purpose, intended users, capabilities, roles, proposal lifecycle, governed access model, publication boundary, limitations, and common tasks.
<!-- aka: The Data Steward High Council - audience -->
- An FDE reference guide explains the implementation at a higher level: architecture, Databricks primitives, example defaults, environment bindings, code locations, customization points, and local-versus-deployed behavior.
<!-- aka: The Forward Deployed Engineer - audience -->

This split keeps product documentation understandable to reviewers and business users without hiding implementation guidance from the FDE audience.

## Proposed information architecture

Expose a Documentation area with independently addressable app-guide and FDE-guide routes. Use compact reference cues elsewhere in the app to deep-link to the relevant documentation section:

- A permanent `Reference implementation` badge in the application shell links to the FDE guide.
- A landing-page informational callout offers paths to both guides.
- Contextual labels identify the Auto Retail domain, metric view, OBO execution, resource bindings, and proposal workflow as primitives or example choices and link to their explanations.

The FDE guide should feature a matrix that classifies each documented item as a reusable Databricks primitive, example implementation, Metric Hub default, environment binding, or replaceable application choice. It should use "preconfigured example resources" rather than imply that all bound tenant resources are disposable or were created by the app.

## Content direction

The Metric View Hub guide should cover purpose, audience, supported tasks, proposal workflow, roles, governance and identity behavior, publication boundaries, limitations, and FAQs.

The FDE guide should cover the reference-implementation statement, architecture flow, primitive-to-example mapping, resource topology, execution identity, customization checklist, source-code map, operating modes, and links to repository documentation. Exact resource identifiers should appear only when useful and safe; credentials and secrets must never be rendered.

## UX and maintenance constraints

- Use published AppKit UI primitives such as Badge, Alert, Card, Table, Tabs, Accordion, Separator, Button, and the existing mobile Sheet; use semantic design tokens rather than raw colors.
- Keep the guide pages route-addressable so contextual links can target stable sections.
- Treat the pages as living, version-controlled documentation. Prefer structured content modules and reuse existing configuration constants where practical instead of duplicating values across components.
- If any binding inventory is derived at runtime, render loading, empty, error, and partial states and expose only a deliberate safe subset.
- Keep the permanent reference marker visible even if a more detailed introductory callout can be collapsed or acknowledged.
- Ensure desktop and mobile navigation remain usable and accessible.
- Add focused tests for routes, navigation, reference cues, required content, and the absence of secret-bearing values.

## Planning boundary

This work is a separate application UX capability from the active FDE workstation-setup change. Planning and approval should complete before React routes, components, content sources, tests, or documentation links are implemented. No Databricks resources, bindings, authentication settings, or deployments need to change for this capability.
