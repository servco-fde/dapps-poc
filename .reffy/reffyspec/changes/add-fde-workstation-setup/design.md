## Context

The repository has a Windows-origin setup guide, an updated macOS/Windows playbook, and an AppKit application with separate npm dependencies. The user requested a reusable `setup.sh` and review of this change before implementation. Implementation was approved on 2026-09-14. The implementation follows this design with the concrete choices and verification limits recorded below.

## Goals / Non-Goals

Goals:
- One discoverable entry point and consistent readiness semantics for macOS and Windows.
- Useful diagnostics on company-managed machines, including restricted installation and network access.
- Explicit installation intent, identity selection, and evidence-based verification.
- Reuse across FDEs and Databricks Apps projects without hard-coded POC settings or a prescribed SDD framework.

Non-goals:
- A universal installer for every OS, shell, enterprise software portal, or package manager.
- Selecting, installing, or validating an SDD tool/framework for the FDE, including Reffy CLI and its planning-only package-manager prerequisites.
- Changing workstation security policies, auto-installing a package manager, or implicitly elevating privileges.
- Creating GitHub repositories, changing Git remotes, scaffolding applications, running app lifecycle scripts, or provisioning/deploying/starting cloud resources.
- Copying credentials between computers or generating the app's `.env` and database schema.
- Treating a local setup pass as proof of deployed OBO authorization or production readiness.

## Decisions

### 1. Entry point and platform bootstrap

Place `setup.sh` at the repository root. Resolve helpers from the script's own directory, quote paths and arguments, and support invocation from another working directory and paths containing spaces. Target Bash 3.2-compatible syntax so macOS does not need a shell upgrade solely for setup. Store shell scripts with LF line endings and executable mode where applicable.

On macOS, document `bash ./setup.sh` from Terminal. On Windows, document the same command from Git Bash. Git Bash must invoke the native Windows toolchain and WinGet adapter; do not accidentally configure a WSL distribution. Unsupported hosts, including WSL for this initial scope, receive an explanation and no installation actions.

Git for Windows/Git Bash and access to the script are unavoidable bootstrap prerequisites for the Windows `.sh` entry point. The guide must explain installation through the company portal or an approved installer before instructing a new FDE to run the script. A repository archive is an alternative to cloning when Git is not yet installed. Git Bash is a terminal dependency; it does not replace VS Code as the editor.

The user accepted Git Bash in proposal review. A separate `setup.ps1` is outside scope to avoid maintaining two setup engines. Because the original company workstation used PowerShell, the guide must explicitly explain switching to Git Bash for this script. This entry-point choice does not require FDEs to abandon PowerShell for other development commands.

### 2. CLI and execution modes

| Invocation | Proposed behavior |
| --- | --- |
| `bash setup.sh` or `bash setup.sh --check` | Run checks without prompting or installing/configuring tools. |
| `bash setup.sh --check --profile "chosen-profile"` | Also validate the explicitly supplied workspace profile. |
| `bash setup.sh --install` | Detect gaps, display concrete proposed actions, and ask before installation/configuration. |
| `bash setup.sh --install --yes --profile "chosen-profile"` | Permit documented missing/incompatible tool and integration repairs without per-package prompts; report identity/interactive blockers. |
| `bash setup.sh --help` | Explain modes, bootstrap prerequisites, limits, and exit codes without making changes. |

Reject conflicting modes, unknown flags, missing option values, and `--yes` without `--install`. In a non-interactive terminal, `--install` without `--yes` must report the pending actions and exit without waiting on input. Login flows require a separate interactive choice; `--yes` does not select accounts/profiles, accept a new SSH host key, change Git identity, or trigger unattended browser/device authentication.

Check mode may contact services through existing authenticated CLIs. It must not run installers, login flows, configuration writes, package lifecycle scripts, or resource mutations. Existing vendor CLIs may refresh their own authentication cache; the script must not read or print token storage. Bound network operations and report unavailable checks without hanging the run.

### 3. Readiness inventory and evidence

| Area | Automated evidence | Remaining boundary |
| --- | --- | --- |
| Git / GitHub CLI | Executables, versions, effective author name/email, and `gh` authentication status | Report account/transport mismatch; do not change identity or create repositories. |
| Node.js / npm | Parse versions and verify the project's supported minimum (currently Node.js 22+) | Do not infer compatibility from a major-number string comparison or install app dependencies. |
| Databricks CLI | Modern binary, baseline version (currently repository minimum 1.0.0), required Apps/AI-tools command availability | Legacy Python CLI is incompatible; verify exact commands against installed CLI help during implementation. |
| VS Code / Codex | Editor installation evidence, Codex CLI availability, and editor-extension evidence where supported | Missing `code` on PATH alone is not proof the macOS app is absent; editor sign-in/access may require a manual check. |
| Databricks profile | List names/hosts without secret fields; current-user lookup only for the selected profile | Authentication success does not prove all resource privileges. |
| Databricks agent skills | Supported CLI installation/status output for the Codex integration | Do not treat an installer exit code alone as proof that the integration is usable in a new session. |
| Developer Hub Docs MCP | Enabled `devhub-docs` registration with the expected endpoint | An endpoint HTTP response or registration is not a successful MCP tools call. |

For the common toolchain's minimums and installer identities, prefer declarations in the target project where available, then documented script baselines. Do not expand the inventory from project dependencies to include SDD frameworks or planning-only tools. Each FDE chooses their SDD approach separately; the existence or absence of Reffy, another framework, or root pnpm planning tooling must not affect setup results or exit codes. ReffySpec commands in this change's tasks apply only to maintaining this repository's proposal. Do not blindly upgrade compatible installations to the latest release. At implementation time, confirm official installation and CLI integration commands for the supported tools; the historical playbook is not a current package registry.

For live MCP verification, use a supported authenticated tools-list/documentation call if the available tooling exposes it. Otherwise provide a precise follow-up to run in Codex and label it `MANUAL`, not `PASS`. Likewise, report editor sign-in and the intended Git transport as manual when they cannot be verified reliably. If checking SSH, distinguish GitHub's successful authentication response from shell availability, use a bounded non-interactive check, and never accept unknown host keys automatically.

### 4. Installation adapters and existing state

Detect Homebrew on macOS and WinGet on Windows only in the matching platform adapter. Their presence does not establish company permission to install packages; interactive action review or the explicit install flag plus `--yes` supplies the operator's installation intent. When the approved route is a software portal/manual installer, print the missing tools and verification commands instead.

Do not bootstrap package managers, use an unreviewed download-to-shell pipeline, change execution policy, or wrap commands in implicit elevation. If an installer requires elevation or company approval, stop that repair and report its requirement. Continue independent checks and summarize the incomplete result.

Skip compatible existing tools. For an older or legacy/conflicting installation, explain the proposed update and detected executable paths rather than uninstalling unrelated tools. Respect version managers and user-managed installs; where an adapter cannot safely target them, provide manual guidance.

Use supported CLI installers for the Databricks skills and Docs MCP. Restrict actions to the Codex integration. Inspect existing registration first; preserve unrelated MCP servers and skills. A conflicting `devhub-docs` endpoint requires a separate explicit choice and must not be overwritten by `--yes`. Recheck each install/update and account for installer success/reboot codes, PATH refresh, and new-terminal requirements on Windows. A restart requirement is incomplete readiness, not an automatic pass.

### 5. Identity and configuration boundaries

Never embed `hawaii-dev-workspace`, Roberto's email, personal paths, or the POC's warehouse/Lakebase/catalog IDs as operational defaults. Honor only an explicit `--profile` argument or a profile chosen interactively after showing all available names/hosts. An environment variable or `DEFAULT` profile is not implicit consent.

When no profile is supplied in check mode, list choices and report `ACTION_REQUIRED` without making a workspace call. Even a single profile requires selection. In interactive install mode, the user may explicitly select an existing profile. Creating/authenticating a profile is a separate manual vendor-CLI action using the displayed guidance, in all modes; setup never launches browser/device login or switches accounts.

Check Git author settings and authentication separately; do not copy Databricks identity into Git configuration. Preserve `.databrickscfg`, `.env`, editor settings, shell profiles, SSH material, and credential stores through supported CLI operations rather than direct rewrites. Never print tokens, dump full credential files, or write secrets into a report.

### 6. Results and readiness limits

Each check reports its name, status, concise evidence, and a next action if needed. Statuses are `PASS`, `ACTION_REQUIRED`, `MANUAL`, `NOT_APPLICABLE`, or `ERROR`.

- Exit `0`: required automated workstation checks passed. Summary explicitly says `AUTOMATED_CHECKS_PASSED` and lists outstanding manual/integration checks; it does not claim full app readiness.
- Exit `2`: required automated checks are incomplete, unsupported, missing, unauthenticated, blocked by network/policy, or require a restart/user action.
- Exit `1`: invalid invocation or unexpected script/internal failure.

Project-specific follow-ups include repository setup, selected resource privileges, developer `.env` and unique Lakebase schema, app dependency installation, local startup and data access, and deployed OBO verification. The script reports them as a separate checklist. It must not start compute or execute test writes to prove workstation readiness. Read-only checks can access cloud services, but required workstation checks must not query warehouse data or wake app/database compute.

### 7. Verification strategy

Use a shell harness with stub executables and isolated temporary homes/configuration for deterministic checks of mode parsing, missing/incompatible tools, install failure, non-interactive runs, authentication/profile selection, preservation, redaction, and exit codes. Assert that forbidden commands are never invoked in check mode and that no resource mutation command is invoked in any mode. Test twice-run behavior and paths containing spaces. Also verify that absent Reffy/pnpm, a repository declaring Reffy, an alternative SDD framework, and no SDD framework all leave common-toolchain results unchanged and trigger no SDD checks or installs.

Exercise both platform adapters in tests, but do not count OS-detection stubs as actual platform support. Run syntax checks and appropriate shell static analysis, then actual smoke checks on macOS Bash and Windows Git Bash, including native Windows executable resolution and line endings. Validate install-mode behavior on approved disposable/test workstations when available; record missing live-install coverage honestly. Readiness commands must never be run with installation flags against a real FDE workstation solely as a test without authorization.

## Risks and Tradeoffs

- A `.sh` entry point needs a Windows Bash bootstrap step. The user accepted Git Bash; onboarding must make that prerequisite clear for FDEs accustomed to PowerShell.
- Corporate installation policies and unmanaged/version-manager installations may require manual repair; the script must remain useful in that state.
- CLI and agent-integration commands evolve. Centralize the inventory/adapter logic and verify command surfaces before implementation.
- IDE sign-in, live MCP access, selected transport, and resource permissions may require human evidence. A zero exit code has intentionally scoped meaning.

## Rollout

After approval, implement the script and focused tests, update the four onboarding documents together, and collect platform evidence. Do not archive the change or mark platform verification complete until the specified checks have been performed. Existing manual setup remains available throughout rollout. All four onboarding documents must leave SDD selection to the FDE and distinguish this repository's own Reffy workflow from the common setup requirements.

## Implementation evidence and remaining verification

- Entry point: `setup.sh`; structured vendor responses are projected by `scripts/setup-json.cjs` using the already-required Node runtime. No project dependencies are installed to run it.
- Missing-tool repair routes: existing Homebrew on macOS, user-scope WinGet on Windows, and npm for Codex CLI. Existing older/version-managed installations are diagnosed for update through their owner rather than replaced automatically.
- Skills: `databricks aitools install --agents codex --scope global -o json`; status comes from `agents[].installed.global`, not the raw-skills summary. Unknown schemas/network failures never trigger an install.
- MCP: native `codex mcp add devhub-docs --url https://developers.databricks.com/api/mcp`; conflicting/disabled entries remain for manual repair. The inspected CLI does not provide a general tools-call probe, so live MCP use is explicitly manual.
- Baselines: Node 22+, Git/GitHub CLI 2+, Databricks CLI 1.0+, plus successful command-surface checks. npm/Codex/editor versions are reported. Exact package and primary documentation references are recorded in `dapps-env-setup.md`.
- `bash -n setup.sh` and `node --check scripts/setup-json.cjs` passed. All 26 isolated integration tests passed. The POSIX Python harness runs the Bash script with isolated homes, native Node parsing, and stub vendor CLIs; Python is not required by FDE setup.
- Actual macOS Bash 3.2.57 check mode returned exit 0 with the explicitly selected development profile, and listed manual integration/project checks. See playbook Move 17 for tool versions and evidence.
- Actual Windows Git Bash validation and real package-install tests remain pending. Stubbed adapter/repair tests do not satisfy those live checks. No app or database compute was started for verification.

## Reffy Inputs

- `fde-workstation-readiness.md`
