# Databricks Apps Environment Setup for Forward Deployed Engineers

Use the same workstation setup workflow on macOS and Windows. [`setup.sh`](./setup.sh) checks the common toolchain and integrations, reports gaps, and offers explicitly authorized repairs. Each FDE chooses their own spec-driven development (SDD) framework; setup does not check or install Reffy or any other SDD framework.

## 1. Obtain the setup files and open the right terminal

Keep `setup.sh` together with `scripts/setup-json.cjs`. Clone this repository if Git is already available, or download/extract its archive using your organization's approved access route. The script works from any working directory, including paths containing spaces.

| Workstation | Bootstrap                                                                                                                                  | Run setup in                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| macOS       | Use the built-in Bash; obtain missing tools through your approved company portal/installers or existing Homebrew.                          | Terminal: `bash ./setup.sh`                                             |
| Windows     | Install [Git for Windows](https://git-scm.com/install/windows) through the company portal or an approved installer if Git Bash is missing. | Open **Git Bash** in the extracted/cloned repository: `bash ./setup.sh` |

PowerShell cannot directly execute this Bash script. Windows FDEs accustomed to PowerShell should open Git Bash for setup; they can continue using PowerShell for subsequent shared development commands. WSL/Linux are outside this script's current support scope. On Windows, setup verifies that Node is the native Windows runtime.

Neither Homebrew nor WinGet is mandatory for checks. Setup does not install a package manager, request administrator elevation, change execution policy, or bypass corporate controls. Windows repairs request user-scope installers; packages without an eligible user installer require a company-approved manual installation.

## 2. Check readiness

Start without choosing a workspace implicitly:

```sh
bash ./setup.sh --check
```

The report lists configured Databricks profiles without selecting one. Rerun with your chosen profile; replace `YOUR_PROFILE` with its exact name, retaining quotes for names containing spaces:

```sh
bash ./setup.sh --check --profile "YOUR_PROFILE"
```

`DEFAULT`, environment variables, this POC's bindings, and the existence of only one profile do not select a profile automatically. Check mode is non-interactive and does not run installers or login flows. It can contact services using existing credentials, and vendor CLIs may refresh their own authentication caches.

Checks cover:

| Area                | Automated check                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Git                 | Version 2+ and effective author name/email                                                                                                   |
| GitHub CLI          | Version 2+ and active github.com account authentication                                                                                      |
| Node.js / npm       | Node.js 22+; runnable npm (version 1+ baseline)                                                                                              |
| Databricks CLI      | Version 1.0.0+ and required Apps/agent-scoped AI-tools command availability; legacy Python CLI is incompatible                               |
| VS Code             | Version/launcher evidence, including standard app locations when `code` is not on PATH                                                       |
| Codex               | Runnable CLI (version 0.1+ baseline), MCP command compatibility, and default VS Code profile's `openai.chatgpt` registration where queryable |
| Databricks identity | Current-user lookup only for the explicitly selected profile                                                                                 |
| Databricks skills   | Codex global integration from structured AI-tools status                                                                                     |
| Docs MCP            | Enabled `devhub-docs` registration at the expected endpoint                                                                                  |

These are setup's compatibility baselines, not a claim that every future tool version supports the same commands. Unsupported or changed CLI responses produce action-required results. The script detects duplicate executable paths and reports them for review, preserves compatible installations, and leaves existing outdated/version-managed tools to their current updater or IT.

Service checks have a 30-second per-command deadline. For a slower network, set `FDE_SETUP_TIMEOUT_SECONDS` to an integer from 1 to 300 in your shell. Repairs have a ten-minute deadline. Raw vendor output and credential-file contents are not printed; temporary command output is private and removed on exit. To investigate an error, rerun the specific diagnostic command yourself without sharing credentials.

## 3. Repair missing prerequisites

Review repairs one at a time in an interactive terminal:

```sh
bash ./setup.sh --install --profile "YOUR_PROFILE"
```

When company policy permits unattended package and integration installation:

```sh
bash ./setup.sh --install --yes --profile "YOUR_PROFILE"
```

`--yes` authorizes the displayed supported repairs, including package/source agreements. It does not log in, select an account/profile, accept SSH host keys, or replace conflicting MCP settings. Without `--yes`, non-interactive install mode exits instead of waiting for input.

Installation adapters use these package identities:

| Missing tool   | macOS with existing Homebrew | Windows with existing WinGet                               |
| -------------- | ---------------------------- | ---------------------------------------------------------- |
| Git            | `git`                        | `Git.Git` (Git Bash itself needs the bootstrap step first) |
| GitHub CLI     | `gh`                         | `GitHub.cli`                                               |
| Databricks CLI | `databricks/tap/databricks`  | `Databricks.DatabricksCLI`                                 |
| Node.js + npm  | `node`                       | `OpenJS.NodeJS.LTS`                                        |
| VS Code        | `visual-studio-code` cask    | `Microsoft.VisualStudioCode`                               |

Codex CLI installation uses `npm install --global @openai/codex` after npm is available. The default VS Code extension uses `code --install-extension openai.chatgpt`. Installation errors, unavailable user-scope installers, permission failures, and missing PATH updates stay incomplete. Setup never falls back to `sudo`, force flags, or another package manager. Restart the terminal when required and rerun checks. Updates to existing tools and repairs to custom installation paths remain manual.

The integration repair commands use the supported native CLIs:

```sh
databricks aitools install --agents codex --scope global -o json
codex mcp add devhub-docs --url https://developers.databricks.com/api/mcp
```

Setup inspects status first, skips installed integrations, and rechecks after repairs. It does not target other agents. An existing disabled or conflicting `devhub-docs` entry is preserved for explicit review in Codex; repair that specific entry yourself. No unrecognized/network-failed status response is treated as proof that an integration is absent.

## 4. Resolve identity and functional checks

Authenticate only after choosing the intended workspace and account. Run vendor login flows yourself; setup does not launch them automatically:

```sh
databricks auth login --host "https://YOUR_WORKSPACE" --profile "YOUR_PROFILE"
databricks current-user me --profile "YOUR_PROFILE"
gh auth login --hostname github.com --git-protocol ssh --web
gh auth status
```

Use your own Git author identity at the intended repository/global scope. Setup never copies the Databricks identity into Git settings:

```sh
git config --global user.name "YOUR NAME"
git config --global user.email "YOUR_EMAIL"
```

Verify your chosen Git transport separately. For SSH, independently verify GitHub's host key before accepting it, then run `ssh -T git@github.com`. GitHub's successful authentication message can accompany exit code 1 because it provides no interactive shell. For HTTPS, confirm your credential-helper configuration and access to the intended repository. A successful `gh auth status` does not prove Git transport or repository permissions.

Open VS Code and Codex, sign in through your approved account, and verify the editor profile you use. In a new Codex session, confirm the Databricks skills are available and ask `devhub-docs` to list documentation pages. This live tool call verifies more than registration or an endpoint HTTP response. The script leaves this as a manual check because the inspected Codex MCP CLI exposes registration management rather than a general tools-call probe.

## 5. Interpret the result

Each line has a status, check name, and evidence or next action:

- `PASS`: the stated automated check succeeded.
- `ACTION_REQUIRED`: a required check is incomplete or needs repair.
- `MANUAL`: human/integration verification remains.
- `NOT_APPLICABLE`: outside the applicable inventory (reserved for future checks).
- `ERROR`: internal/operational error (invalid invocation also prints an error).

| Exit code | Meaning                                                                                |
| --------- | -------------------------------------------------------------------------------------- |
| `0`       | `AUTOMATED_CHECKS_PASSED`; complete the listed manual and project follow-ups.          |
| `2`       | Required checks incomplete, unsupported OS, network/policy blocked, or restart needed. |
| `1`       | Invalid invocation or internal failure.                                                |

The script does not claim full app readiness when automated checks pass. Profile names/hosts and authenticated user identity are displayed as evidence; credentials and raw configuration are not.

## 6. Continue with your app project

After workstation preparation:

1. Establish source control using your intended GitHub account and repository. Choose your own SDD framework, if any.
2. Confirm the needed workspace permissions: Apps access, selected SQL warehouse `CAN USE`, appropriate Unity Catalog `USE CATALOG`/`USE SCHEMA`/`SELECT`, and Lakebase access when needed.
3. Explicitly select resources and inspect the current Apps manifest before scaffolding; do not inherit this POC's IDs.
4. Install application dependencies separately with the project's package manager. Setup does not execute project lifecycle scripts or change lockfiles.
5. Create the ignored `.env` only if it does not already exist, then populate it with your selected resource configuration. Keep credentials in approved local/vendor mechanisms.
6. For this POC, use a unique developer `METRIC_HUB_SCHEMA` and your own development identity. See the [app README](./metric-view-hub/README.md) for the shared-database and local/OBO boundaries.
7. Validate the app, verify local data access, and separately smoke-test deployed browser-user OBO authorization.

Copy the environment template from the app directory using the appropriate shell:

| Shell                             | One-time command              |
| --------------------------------- | ----------------------------- |
| macOS Terminal / Windows Git Bash | `cp .env.example .env`        |
| Windows PowerShell                | `Copy-Item .env.example .env` |

Setup never creates repositories, provisions or starts cloud compute, queries warehouse data, writes app records, creates schemas, or deploys apps.

## Maintainer verification and current limits

Run syntax checks and the isolated integration tests without installing app dependencies:

```sh
bash -n setup.sh
node --check scripts/setup-json.cjs
python3 -m unittest discover -s tests -p 'test_setup.py' -v
```

The test harness uses Python 3 and Node.js, with temporary homes and stub vendor executables; Python is not a setup prerequisite. The current harness uses POSIX pseudo-terminals and runs on macOS/Linux. Windows adapter tests on that harness do not substitute for actual Windows Git Bash smoke checks.

Actual macOS check-mode evidence and test results are recorded in the [playbook](./reference-app-poc-playbook.md). Live Windows Git Bash verification and real package-install verification on approved test workstations remain pending. The ReffySpec change stays open for that evidence; Reffy is a maintainer workflow in this repository, not an FDE setup requirement.

## Installer and integration references

These primary sources and local CLI help informed the implementation:

- [Databricks CLI installation](https://docs.databricks.com/aws/en/dev-tools/cli/install): Homebrew and WinGet routes.
- [Git for Windows](https://git-scm.com/install/windows): Git Bash bootstrap.
- [GitHub CLI installation](https://github.com/cli/cli#installation): supported package-manager routes.
- [VS Code on macOS](https://code.visualstudio.com/docs/setup/mac) and [Windows](https://code.visualstudio.com/docs/setup/windows): installation and launcher behavior.
- [Codex CLI](https://developers.openai.com/codex/cli/) and [official Codex repository](https://github.com/openai/codex#installing-and-running-codex-cli): CLI installation.
- [Codex MCP documentation](https://developers.openai.com/codex/mcp/): registration and runtime inspection.
- [Codex editor extension](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt): extension identity.
- [WinGet install options](https://learn.microsoft.com/en-us/windows/package-manager/winget/install): exact IDs, user scope, and non-interactive flags.

The command surface was inspected with Databricks CLI 1.16.1 and Codex CLI 0.154.0. Package availability and enterprise policy still need verification on the workstation running setup.
