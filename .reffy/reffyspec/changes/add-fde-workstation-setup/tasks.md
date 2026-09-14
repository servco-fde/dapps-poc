## 1. Review gate

- [x] 1.1 Overall implementation approval received on 2026-09-14, including Git Bash, SDD choice, check-by-default behavior, and workstation-only scope.

## 2. Confirm implementation inputs after approval

- [x] 2.1 Verify current official installer/package identities and supported CLI commands for the common toolchain, Codex, Databricks skills, and Docs MCP; record compatibility baselines.
- [x] 2.2 Confirm a supported live MCP probe or document its manual fallback, and decide reliable VS Code/editor evidence on both OSes.
- [x] 2.3 Define the required automated check set, bounded network behavior, result/exit-code contract, and platform test environments.

## 3. Implement the entry point and diagnostics

- [x] 3.1 Add root `setup.sh` with Bash 3.2-compatible parsing, help, mode validation, host detection, path handling, and shell line-ending rules.
- [x] 3.2 Implement common-toolchain version/conflict detection without checking or installing SDD frameworks, planning-only pnpm/Reffy tooling, or project dependencies.
- [x] 3.3 Implement explicit Databricks profile selection and read-only authentication checks; handle no profile, names with spaces, invalid credentials, and unreachable services.
- [x] 3.4 Implement Git author/GitHub checks, scoped transport evidence, Databricks skills checks, and MCP registration/functional-evidence reporting.
- [x] 3.5 Implement check statuses, scoped readiness summary, stable exit codes, and separate project/manual follow-ups.

## 4. Implement authorized repairs

- [x] 4.1 Add platform-specific Homebrew/WinGet adapters, manual-route guidance, interactive action review, and the bounded `--yes` behavior.
- [x] 4.2 Add supported Codex skills/MCP repairs with conflict handling and preservation of unrelated configuration.
- [x] 4.3 Recheck repairs, preserve compatible tools and version managers, and handle installer failures, elevation requirements, PATH refresh, and reboot/new-terminal conditions.
- [x] 4.4 Verify that no mode selects identities implicitly, exposes credentials, rewrites project settings, installs app dependencies, or mutates/starts cloud resources.

## 5. Document and verify

- [x] 5.1 Update `dapps-env-setup.md`, `reference-app-poc-playbook.md`, root `README.md`, and `metric-view-hub/README.md` with matching macOS/Windows bootstrap and setup instructions, explicit guidance for PowerShell users to open Git Bash for setup, and FDE-owned SDD framework choice.
- [x] 5.2 Add isolated shell tests for parsing, paths with spaces, unsupported hosts, missing/old tools, check-mode non-mutation, install authorization, policy/network failures, profile handling, integration conflicts, redaction, exit codes, and unchanged results with Reffy, another SDD framework, or no SDD framework.
- [x] 5.3 Test repeated runs and preservation of existing configuration; run shell syntax and appropriate static checks.
- [x] 5.4 Run actual macOS Bash smoke checks and record versions, commands, outcomes, and manual-verification limits.
- [x] 5.5 Run actual Windows Git Bash smoke checks, including native executable resolution, WinGet behavior, and line endings; record evidence and limits.
- [ ] 5.6 Exercise authorized repair paths on suitable test environments; distinguish stub tests from actual installation evidence and record unavailable coverage.
- [x] 5.7 Validate this repository's change with `reffy plan validate add-fde-workstation-setup` and verify its Reffy manifest after planning edits. These maintainer checks are not FDE setup requirements.
- [ ] 5.8 Present the implemented result and verification evidence for review; archive only after approved scope and required platform checks are complete.
- [x] 5.9 Add an agent-guided handoff that runs workstation checks first and continues through the separately documented local-app setup without implicit identity or cloud-resource choices.

## Verification notes

- Actual macOS check mode passed; the script made no installation or cloud-resource changes.
- Shell/Node syntax checks and all 27 isolated integration tests passed. Tests cover both platform adapters; the harness uses POSIX pseudo-terminals and does not claim native Windows execution.
- Windows Git Bash check mode passed on the company workstation. Actual approved-workstation installer checks remain outstanding. Keep this change active and do not archive it until those repair paths are exercised or explicitly accepted as a remaining limit.
