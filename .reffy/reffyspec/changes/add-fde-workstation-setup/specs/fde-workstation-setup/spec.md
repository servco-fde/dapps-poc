## ADDED Requirements

### Requirement: Shared macOS and Windows entry point

The repository SHALL provide a root `setup.sh` runnable with Bash 3.2-compatible syntax on macOS and Git Bash on Windows. It SHALL resolve its own paths independently of the caller's working directory, support spaces in paths, and use LF shell-script line endings. Documentation SHALL explain the Windows Git Bash bootstrap prerequisite, explicitly guide PowerShell users to open Git Bash for setup, and SHALL NOT require WSL or a change of shell for unrelated development commands.

#### Scenario: Supported workstation invokes setup from another directory
- **WHEN** an FDE runs `bash "/path with spaces/setup.sh"` on a supported host
- **THEN** setup detects the correct platform and resolves its helpers correctly
- **AND** both platforms use the same check and result semantics

#### Scenario: Windows workstation has no Bash
- **WHEN** an FDE follows the onboarding guide from PowerShell on a machine without Git Bash
- **THEN** the guide first explains obtaining Git for Windows through an approved installation route
- **AND** it explains how to open Git Bash and run the script without claiming direct PowerShell execution

#### Scenario: Unsupported platform
- **WHEN** setup runs on an unsupported host or WSL
- **THEN** it reports the unsupported environment and exits with code 2
- **AND** it performs no installation or configuration actions

#### Scenario: Agent harness starts in Windows PowerShell
- **WHEN** an FDE asks a coding harness running in PowerShell to follow the setup guide and Git Bash is installed
- **THEN** the harness may invoke the existing Git Bash executable directly with the documented setup arguments
- **AND** it does not run the script through WSL or introduce a second setup engine

### Requirement: Check mode is the default

Setup SHALL default to non-interactive check mode. Check mode SHALL NOT install/update tools, initiate login, rewrite configuration, run package lifecycle scripts, or mutate cloud resources. Help SHALL make no changes. Invalid or contradictory options SHALL fail with exit code 1.

#### Scenario: Readiness check finds missing tools
- **WHEN** an FDE runs `bash setup.sh` with prerequisites missing
- **THEN** the script reports missing prerequisites and concrete next steps with exit code 2
- **AND** no installer, login flow, or configuration mutation runs

#### Scenario: Conflicting invocation
- **WHEN** the invocation contains both `--check` and `--install`, an unknown option, a missing option value, or `--yes` without `--install`
- **THEN** setup explains the invalid invocation and exits with code 1 before performing checks or changes

### Requirement: Explicit guided repair

Setup SHALL provide `--install` to show and confirm concrete supported repairs. `--install --yes` SHALL authorize only documented tool and integration repair actions, not implicit identity selection, browser login, SSH trust changes, or replacement of conflicting integration settings. Non-interactive install mode without `--yes` SHALL terminate without prompting.

#### Scenario: Interactive developer accepts a repair
- **WHEN** a prerequisite is missing and the developer confirms the displayed repair in install mode
- **THEN** setup runs the platform-appropriate repair and verifies the resulting prerequisite
- **AND** a declined repair remains reported as incomplete

#### Scenario: Unattended install cannot authenticate
- **WHEN** `--install --yes` runs with no usable selected Databricks identity
- **THEN** supported tool repairs may run
- **AND** setup reports the required identity action without selecting an account or starting a browser/device login

#### Scenario: No interactive input is available
- **WHEN** `--install` runs without `--yes` in a non-interactive terminal
- **THEN** setup reports the proposed actions and exits with code 2 without waiting for input

### Requirement: Common toolchain inventory

Setup SHALL check Git, GitHub CLI, modern Databricks CLI, Node.js/npm, VS Code, and Codex CLI, and report editor-integration evidence separately. It SHALL compare parsed versions against applicable declared/documented minimums, initially Node.js 22+ and Databricks CLI 1.0.0+, and verify required Databricks command availability. It SHALL NOT silently substitute the legacy Python CLI or expand the common-toolchain inventory to include SDD frameworks or planning-only tools.

#### Scenario: Incompatible or conflicting installations exist
- **WHEN** setup detects an older version, legacy CLI, or multiple conflicting executable paths
- **THEN** it identifies the incompatibility and applicable remediation
- **AND** it preserves unrelated installations and version-manager settings

#### Scenario: Editor exists without a command-line launcher
- **WHEN** VS Code is installed on macOS but `code` is absent from PATH
- **THEN** setup reports available installation evidence and any required launcher/manual verification
- **AND** it does not install a duplicate editor solely because the launcher is missing

### Requirement: FDE choice of SDD framework

Setup and its onboarding guidance SHALL leave spec-driven development tool/framework selection to each FDE. Setup SHALL NOT select, install, validate, or require Reffy CLI or any other SDD framework, even when this repository declares one. Planning-only package-manager dependencies SHALL NOT affect common workstation readiness or exit codes. Documentation MAY describe the repository's own Reffy workflow only as repository-specific context.

#### Scenario: Repository declares Reffy but the FDE does not use it
- **WHEN** the repository declares pnpm/Reffy planning tooling and those tools are absent on the workstation
- **THEN** setup performs no Reffy or planning-only pnpm checks or installations
- **AND** their absence does not change readiness results or the exit code

#### Scenario: FDE chooses an alternative framework or none
- **WHEN** an FDE uses another SDD framework or has selected no framework
- **THEN** setup checks the same common development prerequisites
- **AND** it does not recommend migrating to Reffy, modify planning configuration, or report the framework choice as a missing prerequisite

### Requirement: Company-compatible installation routes

Setup SHALL use an available permitted Homebrew route on macOS or WinGet route on Windows for supported repairs. It SHALL provide manual guidance when a route is absent, blocked, or unsuitable. It SHALL NOT automatically install a package manager, change security policy, or invoke implicit privilege elevation.

#### Scenario: Corporate policy blocks installation
- **WHEN** an installer is unavailable, requires approval/elevation, or is rejected by company controls
- **THEN** setup reports the blocked prerequisite and approved-route/manual next steps
- **AND** it returns incomplete readiness without bypassing the policy

#### Scenario: Installation requires a new session
- **WHEN** an installer reports success but the tool is not usable until PATH refresh or restart
- **THEN** setup reports the required restart/new-terminal action and exits with code 2
- **AND** it does not report that prerequisite as verified

### Requirement: Explicit Databricks profile selection

Setup SHALL list configured profile names and workspace hosts without secrets and SHALL use only a profile supplied by `--profile` or explicitly selected in interactive install mode. Every workspace command SHALL pass that profile explicitly. Setup SHALL NOT infer consent from `DEFAULT`, environment settings, the POC configuration, or the existence of only one profile.

#### Scenario: No profile is selected
- **WHEN** check mode runs without `--profile`, even if exactly one profile exists
- **THEN** setup lists profile choices and reports action required
- **AND** it makes no workspace call

#### Scenario: A profile containing spaces is selected
- **WHEN** an FDE supplies an explicit profile whose name contains spaces
- **THEN** setup preserves the full name as one argument on both platforms and validates the corresponding current user
- **AND** expired or invalid authentication is reported without falling back to another profile

### Requirement: Independent Git identity and transport evidence

Setup SHALL check effective Git author name/email and GitHub authentication separately from Databricks identity. It SHALL report Git transport verification separately and SHALL NOT change author settings, switch accounts, register keys, accept unknown SSH host keys, or create repositories automatically.

#### Scenario: GitHub API authentication succeeds but Git transport is unverified
- **WHEN** `gh` authentication succeeds and the intended Git transport has not been verified
- **THEN** setup reports API authentication as passed and transport as requiring a check
- **AND** it does not claim a successful Git push or repository-access test

#### Scenario: Git author is missing
- **WHEN** Git author name or email is unset
- **THEN** setup reports the missing configuration as action required
- **AND** it does not populate it from the Databricks account or POC owner

### Requirement: Databricks skills and documentation integration

Setup SHALL inspect and, in authorized install mode, repair the Codex Databricks skills integration and enabled `devhub-docs` registration through supported tooling. It SHALL verify resulting status, preserve unrelated integrations, and distinguish MCP registration from a successful authenticated tools/documentation call.

#### Scenario: Docs MCP is registered but no functional probe is available
- **WHEN** the enabled expected MCP endpoint is registered but setup cannot perform a supported live tools call
- **THEN** setup reports registration as passed and functional verification as manual
- **AND** it supplies a concrete Codex follow-up rather than claiming full integration readiness

#### Scenario: Existing integration conflicts with the expected endpoint
- **WHEN** `devhub-docs` is registered to a different endpoint
- **THEN** setup reports the conflict and requires a separate explicit choice to replace it
- **AND** `--yes` alone does not authorize replacement

### Requirement: Repeatability and configuration preservation

Setup SHALL skip compatible installed prerequisites, verify each attempted repair, and preserve existing profiles, environment files, editor configuration, shell startup files, SSH material, unrelated integrations, and project lockfiles. It SHALL operate without hard-coded personal identities or POC resource bindings and SHALL NOT disclose credentials in output.

#### Scenario: Setup is run a second time
- **WHEN** the same FDE reruns install mode after successful prerequisite repair
- **THEN** verified compatible prerequisites are not reinstalled
- **AND** existing user configuration and unrelated integration entries remain unchanged

#### Scenario: Diagnostics encounter sensitive configuration
- **WHEN** setup diagnoses authentication or integration failures
- **THEN** it reports only relevant non-secret evidence and remediation
- **AND** no token values, credential-file dumps, or `.env` contents appear in output

### Requirement: Honest readiness reporting and exit codes

Each check SHALL report a status of `PASS`, `ACTION_REQUIRED`, `MANUAL`, `NOT_APPLICABLE`, or `ERROR`, with evidence and relevant next steps. Exit 0 SHALL mean only that required automated checks passed, with summary `AUTOMATED_CHECKS_PASSED`. Exit 2 SHALL indicate incomplete required checks or unsupported environments. Exit 1 SHALL indicate invocation/internal failure. Network checks SHALL be bounded and failures SHALL NOT be presented as passes.

#### Scenario: Automated checks pass but human evidence remains
- **WHEN** required automated checks pass but editor sign-in or live MCP verification remains manual
- **THEN** setup exits with code 0 and labels the result as automated checks passed
- **AND** it prominently lists outstanding manual checks without claiming full app readiness

#### Scenario: Network verification is blocked
- **WHEN** a required authentication check times out or fails because the service is unreachable
- **THEN** setup reports incomplete verification and exits with code 2
- **AND** it does not misclassify the result as verified authentication or prompt indefinitely

### Requirement: Workstation and project boundaries

Setup SHALL separate machine/integration checks from repository creation, app dependencies, resource permissions, `.env` creation, schema setup, local runtime checks, and deployed OBO verification. It SHALL provide next steps for those project tasks without executing them. For this POC, onboarding SHALL identify the local app process and unique developer schema as the per-FDE isolation boundary and SHALL identify the deployed development and BA apps as shared environments rather than per-FDE apps. No mode SHALL provision, start, deploy, or mutate Databricks resources, query warehouse data, or write application records.

#### Scenario: Authenticated developer lacks app resource configuration
- **WHEN** workstation authentication is valid but no warehouse/Lakebase configuration or app environment file is supplied
- **THEN** setup reports project-specific follow-ups separately
- **AND** it does not select resources, generate `.env`, initialize schemas, or start compute

#### Scenario: FDE completes the local-development handoff
- **WHEN** an FDE completes workstation checks and follows the project-specific onboarding sequence
- **THEN** onboarding directs the FDE to run the app locally with a unique developer schema
- **AND** it does not create or deploy a per-FDE Databricks App

#### Scenario: FDE wants to operate a shared deployment
- **WHEN** an FDE wants to deploy, start, inspect, or stop the shared development or BA app
- **THEN** onboarding requires a separate explicit request and the documented environment target/profile pair
- **AND** it does not treat local-development approval as deployment authorization

### Requirement: Documentation and platform verification

The environment guide, playbook, repository README, and app README SHALL describe consistent macOS and Windows invocation, bootstrap prerequisites, mode/exit semantics, installation limits, FDE-owned SDD framework choice, and project follow-ups. A root `init.md` and the environment guide's expanded prompt SHALL provide agent-harness entry points that begin with non-mutating workstation checks, require explicit identity and repair decisions, and continue through the separately documented local-app workflow. Validation SHALL include meaningful failure-path tests plus actual macOS Bash and Windows Git Bash smoke evidence. Stubbed OS detection SHALL NOT be labeled as live platform verification.

#### Scenario: Validation is performed on only one platform
- **WHEN** tests pass locally and simulated adapter tests cover the other OS but no live run has occurred there
- **THEN** the change records that platform's live verification as pending
- **AND** it does not claim that both platforms were verified or mark the corresponding task complete

#### Scenario: FDE delegates onboarding to a coding harness
- **WHEN** the FDE points a harness at the repository and supplies the documented onboarding prompt
- **THEN** the harness can discover the supported setup and local-app sequence without inventing resource bindings
- **AND** installs, login flows, identities, existing environment files, and cloud mutations retain their documented approval boundaries
