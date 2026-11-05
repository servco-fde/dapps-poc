## MODIFIED Requirements

### Requirement: FDE Reference Guide content and classification

The FDE Reference Guide SHALL explain the implementation architecture, demonstrated Databricks primitives, Metric Hub examples, environment bindings, code locations, customization sequence, local/deployed differences, and source-document links. Its reference matrix SHALL distinguish `Databricks primitive`, `Example implementation`, `Metric Hub default`, `Environment binding`, and `Replace for your app` classifications. Operational recommendations SHALL cover only the reference Databricks App's resources, configuration, identity, validation, and lifecycle. The guide SHALL state that general FDE workstation preparation, development-environment certification, CI/CD, and broader DevOps tooling belong to a separate project. Current source links SHALL lead to maintained app guidance rather than the retired workstation checker or installation workflow.

#### Scenario: FDE evaluates a demonstrated capability

- **WHEN** an FDE inspects an item in the reference matrix
- **THEN** the guide identifies the underlying Databricks primitive
- **AND** it identifies the Metric Hub example or binding
- **AND** it explains whether and how that item is expected to change for another application

#### Scenario: FDE begins adapting the reference implementation

- **WHEN** an FDE opens the customization guidance
- **THEN** the guide provides an ordered checklist covering domain data, metric-view and warehouse bindings, application state, identity and roles, workflow, branding, and app deployment configuration
- **AND** it does not characterize existing tenant resources as disposable or safe to mutate by default
- **AND** it does not prescribe a workstation installer, general environment certification, or CI/CD system

#### Scenario: FDE follows operational source links

- **WHEN** an FDE follows the guide's configuration or startup references
- **THEN** the links resolve to app-specific instructions consistent with the repository's narrowed purpose
- **AND** a separate ownership notice covers general DevOps needs without inventing an external project URL
