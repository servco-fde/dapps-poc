## ADDED Requirements

### Requirement: Persistent reference-implementation identity

The application SHALL identify Metric View Hub as a reference implementation in its shared shell on every route. The marker SHALL be informational, remain visible on desktop and mobile, and link to the FDE Reference Guide.

#### Scenario: User encounters the application on any route

- **WHEN** a user opens any application route
- **THEN** the shared shell displays a `Reference implementation` marker
- **AND** activating the marker navigates to the FDE Reference Guide
- **AND** the marker does not imply that the application or its resources are in an error state

### Requirement: Layered reference guidance

The application SHALL provide concise reference cues on working product screens and SHALL keep detailed explanations in the documentation pages. The metric catalog landing page SHALL explain that the Auto Retail domain, resource bindings, roles, and workflow are a preconfigured example and SHALL offer links to both guides.

#### Scenario: New FDE opens the metric catalog

- **WHEN** a new FDE opens the metric catalog landing page
- **THEN** an informational callout explains that Metric View Hub demonstrates one configurable implementation
- **AND** the callout offers a path to the Metric View Hub Guide
- **AND** the callout offers a path to the FDE Reference Guide

#### Scenario: User follows a contextual cue

- **WHEN** a user activates a reference cue associated with the domain, metric view, execution identity, or proposal workflow
- **THEN** the application navigates to a stable visible section that explains that concept
- **AND** the product screen does not duplicate the full guide content

### Requirement: Addressable two-audience documentation

The application SHALL expose a Documentation area with independently addressable Metric View Hub and FDE guides. `/docs/app` SHALL identify the user guide, `/docs/fde` SHALL identify the FDE guide, and `/docs` SHALL resolve to the user guide. Both guides SHALL be reachable from desktop and mobile navigation and SHALL provide a route-aware switcher between them.

#### Scenario: User navigates directly to a guide

- **WHEN** a user opens `/docs/app` or `/docs/fde` directly
- **THEN** the requested guide renders with a unique page heading
- **AND** the documentation switcher identifies the active guide
- **AND** the user can navigate to the other guide without returning to the metric catalog

#### Scenario: User opens documentation on a narrow viewport

- **WHEN** a user opens the mobile navigation
- **THEN** the Documentation area and reference marker remain discoverable and keyboard operable
- **AND** the documentation content does not force the page wider than the viewport

### Requirement: Metric View Hub Guide content

The Metric View Hub Guide SHALL explain the app's purpose, intended audiences, supported tasks, proposal lifecycle, roles, governed analytics behavior, application-state boundary, engineering handoff, current limitations, and common questions. It SHALL state that exported SQL/YAML is an engineering candidate and that the app does not create or replace Unity Catalog objects.

#### Scenario: Product user needs to understand the app

- **WHEN** a product user opens the Metric View Hub Guide
- **THEN** the user can determine what the application does and which tasks it supports
- **AND** the user can distinguish reviewer and admin responsibilities
- **AND** the user can understand the proposal and publication boundary without needing repository access

### Requirement: FDE Reference Guide content and classification

The FDE Reference Guide SHALL explain the implementation architecture, demonstrated Databricks primitives, Metric Hub examples, environment bindings, code locations, customization sequence, local/deployed differences, and source-document links. Its reference matrix SHALL distinguish `Databricks primitive`, `Example implementation`, `Metric Hub default`, `Environment binding`, and `Replace for your app` classifications.

#### Scenario: FDE evaluates a demonstrated capability

- **WHEN** an FDE inspects an item in the reference matrix
- **THEN** the guide identifies the underlying Databricks primitive
- **AND** it identifies the Metric Hub example or binding
- **AND** it explains whether and how that item is expected to change for another application

#### Scenario: FDE begins adapting the reference implementation

- **WHEN** an FDE opens the customization guidance
- **THEN** the guide provides an ordered checklist covering domain data, metric-view and warehouse bindings, application state, identity and roles, workflow, branding, and deployment configuration
- **AND** it does not characterize existing tenant resources as disposable or safe to mutate by default

### Requirement: Safe and maintainable documentation content

Guide content SHALL be version-controlled and represented in structured client content with stable section identifiers and controlled classification values. Any displayed resource identifiers SHALL come from a deliberate public allowlist. The application SHALL NOT render credentials, tokens, connection strings, credential-bearing environment values, or user-specific local settings in either guide.

#### Scenario: Maintainer updates a documented capability

- **WHEN** a maintainer changes a documented capability or example binding
- **THEN** the associated structured guide content and tests provide a reviewable location for the corresponding documentation update
- **AND** contextual links continue to target stable section identifiers

#### Scenario: Documentation renders configuration information

- **WHEN** either guide displays an implementation or environment binding
- **THEN** it displays only explicitly allowlisted, non-secret information
- **AND** it labels the binding as an example or environment-specific choice where applicable

### Requirement: Documentation availability without data services

The documentation routes SHALL use curated build-time content and SHALL NOT require a new runtime call to Databricks APIs, the SQL warehouse, Unity Catalog, or Lakebase. The guides SHALL remain readable when analytics or application-state services are unavailable.

#### Scenario: A backing data service is unavailable

- **WHEN** the SQL warehouse, metric query, or Lakebase request is unavailable or fails
- **THEN** `/docs/app` and `/docs/fde` still render their complete static guide content
- **AND** no documentation section is replaced by a blank loading or error panel because of that service failure

### Requirement: Accessible AppKit documentation presentation

The documentation UX SHALL use components exported by the installed AppKit UI packages, semantic design tokens, meaningful heading hierarchy, visible keyboard focus, and text labels in addition to color. The primitive matrix and documentation navigation SHALL remain understandable on mobile, tablet, and desktop layouts.

#### Scenario: User navigates documentation with assistive input

- **WHEN** a user navigates the documentation with a keyboard or assistive technology
- **THEN** guide navigation, links, tabs, and accordions expose meaningful accessible names and focus states
- **AND** classifications remain understandable without relying on color alone
