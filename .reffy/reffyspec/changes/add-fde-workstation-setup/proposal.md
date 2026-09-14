# Change: Add reusable macOS and Windows FDE workstation setup

## Status

Implementation approved by the user on 2026-09-14. Script, tests, and onboarding documentation are implemented. macOS check-mode verification passed; actual Windows Git Bash and real installer verification remain pending, so this change is not ready to archive.

## Why

FDE onboarding currently requires following a largely manual, Windows-oriented setup guide. The corrected workstation policy supports both macOS and Windows, but there is no repeatable readiness check or guided repair path. A developer can have executables installed while still lacking valid authentication, the Databricks skills, or a working documentation integration.

An FDE should be able to run `bash setup.sh`, see what is ready and what needs attention, and explicitly choose installation assistance without inheriting this POC's workspace, identity, or resource bindings.

## What Changes

- Add a reusable repository-root `setup.sh`, compatible with macOS Bash and Windows Git Bash, with a documented bootstrap path when Bash is not available.
- Default to non-interactive readiness checks. Offer `--install` for guided installation and `--install --yes` for an explicitly authorized set of unattended tool/plugin installation actions.
- Check Git, GitHub CLI, modern Databricks CLI, Node.js/npm, VS Code, Codex CLI and editor integration evidence, Databricks agent skills, and the Developer Hub Docs MCP registration.
- Validate Git author configuration, GitHub authentication, and a user-selected Databricks profile. Keep Git transport, live MCP, and resource-permission evidence distinct from executable presence.
- Use an available, company-permitted installation route: Homebrew on macOS or WinGet on Windows. Report manual steps when automated installation is unavailable or blocked.
- Recheck after changes, preserve compatible installations and existing settings, and produce an actionable result with stable exit codes.
- Update the environment guide, playbook, repository README, and app README to describe the same OS-neutral setup workflow and its limits.
- Keep onboarding guidance neutral about SDD framework choice; any mention of this repository's Reffy workflow must be clearly local to this repository.
- Add meaningful failure-path tests and record actual macOS and Windows verification before claiming both platforms are verified.

## Review Decisions

1. **Windows execution — accepted in review:** use Git Bash, supplied by Git for Windows, as the single Windows setup entry point. The original company workstation used PowerShell, so onboarding must explicitly explain opening Git Bash to run `setup.sh`. A machine without Bash first installs Git for Windows through an approved route. WSL and a second PowerShell setup engine are outside scope; FDEs can continue using PowerShell for subsequent shared development commands.
2. **Default behavior — approved:** `bash setup.sh` checks readiness; `bash setup.sh --install` offers repairs. Installation is opt-in, and profile/account selection stays explicit.
3. **Scope — approved:** prepare the common FDE workstation and integrations. App scaffolding, repository creation, app dependency installation, `.env` generation, workspace provisioning, and deployment remain subsequent project tasks.
4. **SDD framework choice — confirmed in review:** each FDE chooses their own spec-driven development (SDD) tool or framework. The shared setup does not select, install, validate, or require Reffy CLI or any other SDD framework. This repository uses ReffySpec to review this change; that does not make Reffy an onboarding prerequisite.

The Windows entry-point and SDD-choice decisions incorporate the user's proposal comments. The user subsequently approved implementing the full proposal.

## Impact

- New capability: `fde-workstation-setup`; no existing canonical specs or active changes were present when this proposal was drafted.
- Planned files: root `setup.sh`, narrowly scoped shell helpers/tests if needed, shell line-ending rules in `.gitattributes`, and the four onboarding documents named above.
- No application runtime, resource binding, database, or deployment changes. Verification ran in check mode; no live software installation was performed.
- SDD framework setup is left to each FDE. Existing root pnpm/Reffy declarations are repository-specific and excluded from shared workstation readiness checks; application dependencies remain npm-managed.
- Existing Windows troubleshooting remains historical evidence. macOS support must receive its own verification evidence.

## Acceptance Summary

An FDE can run the same entry point on both supported OSes, obtain an honest readiness report, repair supported missing prerequisites with explicit authorization, and rerun it without resetting existing configuration. Partial or manual-only checks never appear as fully verified app readiness. Setup operates without hard-coded POC identities or an SDD-framework requirement and never implicitly provisions or starts Databricks resources.

## Supersedes

None. This is the first formal workstation-setup capability; it incorporates the corrected macOS/Windows assumption in the playbook.

## Reffy References

- `fde-workstation-readiness.md` - user request, corrected OS assumption, source documents, and planning boundaries.
