## REMOVED Requirements

### Requirement: Shared macOS and Windows entry point

**Reason:** The root general workstation setup entry point is retired.

**Migration:** The short dapps-env-setup.md handoff notice replaces setup instructions; init.md covers the app only.

#### Scenario: FDE seeks workstation preparation

- **WHEN** an FDE follows the current repository onboarding path
- **THEN** the path does not invoke setup.sh or prescribe OS/Bash bootstrap

### Requirement: Check mode is the default

**Reason:** The repository no longer owns a general workstation check mode.

**Migration:** Remove the setup command and its active check-mode references; retain app-specific validation commands.

#### Scenario: FDE seeks a readiness report

- **WHEN** an FDE reads the current app prerequisites
- **THEN** the documentation lists requirements without offering a general workstation scanner or readiness certification

### Requirement: Explicit guided repair

**Reason:** General tool installation and repair belong to the colleague-led DevOps project.

**Migration:** Remove setup install modes and their exclusive tests; provide the ownership notice instead.

#### Scenario: A general prerequisite is missing

- **WHEN** an FDE lacks an app prerequisite on their workstation
- **THEN** the reference identifies the prerequisite and external ownership without executing or recommending a maintained repair workflow

### Requirement: Common toolchain inventory

**Reason:** Workstation-wide tool/editor inventory is outside the app reference scope.

**Migration:** Keep declared app prerequisites while removing machine, editor, and coding-agent discovery code.

#### Scenario: FDE reads prerequisite guidance

- **WHEN** an FDE opens the app-specific entry point
- **THEN** the reference states the required tools and versions without scanning the general toolchain or claiming editor readiness

### Requirement: FDE choice of SDD framework

**Reason:** The setup-specific SDD-independence contract is retired with the general setup capability.

**Migration:** Keep Reffy as repository planning context, without introducing an external onboarding or SDD-framework requirement.

#### Scenario: FDE uses a different planning tool

- **WHEN** an FDE uses another SDD framework or none
- **THEN** the app-specific instructions do not require installing or adopting Reffy to run the reference app

### Requirement: Company-compatible installation routes

**Reason:** The repository no longer maintains Homebrew/WinGet installation or corporate workstation repair guidance.

**Migration:** Replace current installer instructions with the external ownership notice; retain historical evidence as superseded.

#### Scenario: FDE needs tool installation

- **WHEN** an FDE seeks a supported workstation installation route
- **THEN** current reference instructions delegate general preparation rather than maintaining package-manager or security-policy repair steps

### Requirement: Explicit Databricks profile selection

**Reason:** The general setup profile checker is retired; explicit identity selection remains required for app-specific commands.

**Migration:** Preserve explicit profile/target guidance in the app README, init.md, and agent instructions under the new app-scope contract.

#### Scenario: FDE chooses an app workspace

- **WHEN** an FDE configures or operates the reference app
- **THEN** the app instructions require the selected profile explicitly without requiring a general setup scanner

### Requirement: Independent Git identity and transport evidence

**Reason:** Git/GitHub workstation diagnostics and repair are general DevOps concerns.

**Migration:** Remove exclusive identity/transport checks and onboarding claims; preserve ordinary repository collaboration instructions.

#### Scenario: FDE needs Git environment verification

- **WHEN** an FDE looks for workstation Git or GitHub certification
- **THEN** the reference directs the general tooling need to external ownership rather than checking or repairing accounts, transport, or keys

### Requirement: Databricks skills and documentation integration

**Reason:** Installing or certifying machine-wide skills and MCP integrations is outside this app reference.

**Migration:** Remove setup-specific integration discovery/repair and installation guidance; retain source references useful for app implementation.

#### Scenario: FDE needs agent integration setup

- **WHEN** an FDE needs skills or MCP installed on a workstation
- **THEN** current reference guidance delegates that setup and does not maintain an integration installer or certification check

### Requirement: Repeatability and configuration preservation

**Reason:** The generic installer repeatability requirement is retired with its implementation.

**Migration:** Preserve existing .env, credentials, profiles, and user configuration under app-specific guidance; do not build a replacement general installer.

#### Scenario: FDE reuses existing local app configuration

- **WHEN** an FDE follows the new app-specific entry point with an existing .env
- **THEN** that file is preserved without invoking a general configuration repair or installer workflow

### Requirement: Honest readiness reporting and exit codes

**Reason:** General setup status vocabulary and exit-code semantics are no longer a maintained interface.

**Migration:** Remove the setup report engine and exclusive tests; describe app-specific checks with their actual evidence and limits.

#### Scenario: FDE assesses app verification

- **WHEN** an FDE reads validation or runtime-check results
- **THEN** the reference reports app-specific evidence without promising a general workstation certification or retired setup exit-code contract

### Requirement: Workstation and project boundaries

**Reason:** The former workstation-first sequence is replaced by an app-only path that assumes a prepared workstation.

**Migration:** Retain local proxy, personal-schema isolation, shared-environment distinctions, explicit profiles, and separately authorized cloud operations.

#### Scenario: FDE starts local application work

- **WHEN** an FDE follows current local-development instructions
- **THEN** app configuration and startup are directly discoverable without a workstation checker or implied shared-resource mutation approval

### Requirement: Documentation and platform verification

**Reason:** Cross-platform installer/checker verification is no longer a delivery obligation of this reference repo.

**Migration:** Update current docs and links, preserve labeled historical platform evidence, and verify the retained app instructions rather than a retired installer.

#### Scenario: Maintainer validates the narrowed reference

- **WHEN** a maintainer verifies the scope correction
- **THEN** active instructions and links are consistent and app checks pass without claiming new general workstation or installer verification
