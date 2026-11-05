## ADDED Requirements

### Requirement: FDE reference purpose and ownership boundary

The repository SHALL present itself as an FDE reference for composing and adapting Databricks Apps, with Metric View Hub as its working example. Current repository and FDE-guide content SHALL distinguish application architecture and Databricks Apps-specific resource operations from general workstation preparation, local/remote environment certification, CI/CD, and broader DevOps tooling owned outside this repository. The repository SHALL NOT provide or recommend a maintained general workstation checker, installer/repair workflow, or CI/CD toolkit.

#### Scenario: FDE evaluates the repository

- **WHEN** an FDE reads the root README or FDE guide
- **THEN** the FDE can identify the reference purpose, example application, and intended customization points
- **AND** general development-environment and delivery-tooling ownership is explicitly outside this repository

#### Scenario: Maintainer retires the workstation toolkit

- **WHEN** this scope change is implemented
- **THEN** `setup.sh` and its exclusively used helper/tests are removed
- **AND** active onboarding and agent instructions do not invoke them or prescribe a replacement general checker

### Requirement: Retained Databricks Apps operational guidance

The reference SHALL retain guidance needed to configure, validate, run, and adapt this Databricks App: declared prerequisites; project dependency/build/test commands; manifests and target/profile selection; warehouse, Unity Catalog, and Lakebase bindings; app SP/OBO permissions; secret references; developer-schema isolation; the full-stack local proxy; deployment and app lifecycle commands; and app-specific readiness/troubleshooting. Local-app instructions SHALL assume a prepared workstation, preserve an existing `.env`, use an explicitly selected Databricks profile, and distinguish local developer identity from deployed browser-user authorization. App-resource mutations SHALL remain separately authorized.

#### Scenario: FDE runs the reference locally

- **WHEN** an FDE with the declared prerequisites follows the app-specific entry point
- **THEN** the instructions lead through app configuration and the full-stack proxy with a personal Lakebase schema
- **AND** they do not scan, install, repair, or certify the FDE's general workstation
- **AND** they do not treat approval for local development as approval to provision, start, or deploy shared cloud resources

#### Scenario: FDE operates a deployed reference app

- **WHEN** an FDE consults the app's deployment or lifecycle guidance
- **THEN** it describes Databricks Apps commands, selected target/profile, resource permissions, and readiness evidence
- **AND** it does not require adopting a CI/CD platform, pipeline template, or general DevOps framework

### Requirement: External DevOps handoff

Current entry points SHALL direct general FDE DevOps needs to the separate colleague-led project through a concise ownership notice. A project link SHALL be included only when its identity and destination have been supplied or verified. Missing external details SHALL NOT block documenting the ownership boundary or imply that scripts have been transferred, published, or validated elsewhere. `dapps-env-setup.md` SHALL become a short handoff notice pointing to the app-specific README; `init.md` SHALL remain an app-specific entry point.

#### Scenario: External project details are unavailable

- **WHEN** the colleague's project name, URL, or supported commands are unknown
- **THEN** the notice explains the ownership split without an invented destination or executable setup command
- **AND** the app-specific instructions remain usable by an FDE with a prepared workstation

### Requirement: Historical continuity and app preservation

The retirement SHALL preserve archived changes, original ideation, and historical build evidence. Retained historical DevOps material SHALL be visibly distinguished from current instructions. The implementation SHALL preserve the app's existing product workflows, reference identity, resource bindings, credential protections, and deployment state. Canonical specs SHALL be updated through archival of the delivered superseding change, not rewritten during proposal drafting.

#### Scenario: Reader encounters earlier setup guidance

- **WHEN** a reader follows retained historical playbook material about the workstation toolkit
- **THEN** the material is identified as superseded and points to the current scope/handoff
- **AND** the original archived decision remains available unchanged

#### Scenario: Scope correction is implemented

- **WHEN** maintainers remove the general DevOps tooling and update the reference documentation
- **THEN** the app's metric, proposal, and Microsoft integration behavior and resource bindings remain unchanged
- **AND** existing cloud compute is not started or reconfigured as a side effect
