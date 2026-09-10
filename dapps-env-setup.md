# Databricks Apps Environment Setup for Forward Deployed Engineers

This guide captures the steps and common problems involved in preparing a Windows workstation with VS Code and Codex for Databricks Apps development.

## Prerequisites

The local machine needs:

- Visual Studio Code with Codex available (API or ChatGPT?)
- Git
- GitHub CLI (`gh`)
- Databricks CLI v1.0.0 or newer
- Node.js 22 or newer for AppKit applications
- Access to a Databricks workspace where Apps is enabled

Verify the local tools from PowerShell:

```powershell
git --version
gh --version
databricks version
node --version
npm --version
```

If a tool is missing, install it with WinGet and restart PowerShell so the updated `PATH` is loaded:

```powershell
winget install --id Microsoft.VisualStudioCode
winget install --id Git.Git -e
winget install --id GitHub.cli
winget install Databricks.DatabricksCLI
winget install --id OpenJS.NodeJS.LTS
```

Use the modern Databricks CLI binary. Do not install the legacy `databricks-cli` Python package from PyPI.

## Required Databricks permissions

An FDE should have access to the development workspace and only the permissions needed by the application being built. Coordinate with the workspace administrator to confirm:

- Databricks Apps is enabled and the FDE can create and manage development apps.
- The FDE has `CAN USE` on the selected SQL warehouse.
- The FDE has `USE CATALOG`, `USE SCHEMA`, and appropriate `SELECT` permissions for Unity Catalog data used by the app.
- The app's service principal can receive the permissions declared for its Databricks resources during deployment.
- Lakebase access is available when the app needs persistent forms, comments, workflow state, or other write-back data.
- User authorization is enabled if the application must query Databricks as the signed-in user rather than as the app service principal.

Avoid using a broad “power user” role as the long-term permission model. Document the specific resources and permissions each application needs.

## 1. Authenticate the Databricks CLI

Use OAuth with a descriptive, workspace-specific profile name:

```powershell
databricks auth login --host <workspace-url> --profile <profile-name>
```

The CLI opens a browser for authentication and stores the resulting profile locally. Do not create or rely on a profile named `DEFAULT` unless that behavior is explicitly desired.

List every configured profile and verify the selected one:

```powershell
databricks auth profiles
databricks current-user me --profile <profile-name>
databricks apps list --profile <profile-name>
```

When multiple profiles exist, Codex should show them to the user and ask which one to use. Every workspace command should then include the explicit flag:

```powershell
--profile <profile-name>
```

This prevents a command from accidentally targeting the wrong workspace.

## 2. Install the Databricks AI tools and agent skills

Run:

```powershell
databricks aitools install
```

The command detects supported coding agents and installs the Databricks plugin for Codex. A message that another agent, such as GitHub Copilot, was skipped is harmless when that agent's CLI is not installed.

Verify the installation:

```powershell
databricks aitools list
databricks aitools version
```

The output should show the Databricks plugin installed and up to date for Codex.

## 3. Install the Databricks Developer Hub Docs MCP server

Ask Codex to run the following non-interactive command:

```powershell
npx add-mcp https://developers.databricks.com/api/mcp `
  --name devhub-docs `
  --agent codex `
  --global `
  --yes
```

Specifying `--agent codex --yes` avoids the interactive agent-selection prompt, which can fail with `ERR_TTY_INIT_FAILED` when an AI coding harness does not expose a full terminal.

Verify that Codex registered the server:

```powershell
codex mcp list
```

The result should contain an enabled entry similar to:

```text
Name         Url                                        Status
devhub-docs  https://developers.databricks.com/api/mcp  enabled
```

Start a new Codex session after installation if the MCP tools or Databricks skills are not visible in the current session. As a functional test, ask Codex to use `devhub-docs` to list the available Databricks Developer Hub pages.

## 4. Authenticate GitHub CLI and verify SSH

Databricks Apps do not automatically create a GitHub repository, commit source code, or push application changes. Databricks deployment records are not a replacement for source control. Create and maintain the Git repository separately.

Authenticate GitHub CLI:

```powershell
gh auth login --hostname github.com --git-protocol ssh --web
gh auth status
```

If an SSH key is already registered with GitHub, choose **Skip** when `gh auth login` asks whether it should upload a public key.

Verify SSH access:

```powershell
ssh -T git@github.com
```

A response such as the following means authentication succeeded, even though GitHub does not provide an interactive shell:

```text
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

Confirm the Git author used for commits:

```powershell
git config --global user.name
git config --global user.email
```

Configure these values if needed:

```powershell
git config --global user.name "<full-name>"
git config --global user.email "<email-address>"
```

## 5. Create the GitHub repository before implementation

Source control should be established before app scaffolding or implementation begins. From the project directory, create a `.gitignore` appropriate for Node/AppKit development before staging files. At minimum, exclude:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
server/.env
*.log
```

Never commit Databricks profiles, OAuth tokens, GitHub tokens, client secrets, or local environment files.

Review the files that will be committed, then initialize and commit:

```powershell
git status --short
git init -b main
git add .
git status --short
git commit -m "Initial commit"
```

Create a private repository and push the initial commit:

```powershell
gh repo create <owner-or-organization>/<repository-name> `
  --private `
  --source . `
  --remote origin `
  --push
```

Verify the result:

```powershell
git status --short --branch
git remote -v
gh repo view <owner-or-organization>/<repository-name>
```

The branch should track `origin/main`, and the working tree should be clean.

For an existing remote repository, clone it instead of running `git init` and `gh repo create`:

```powershell
git clone git@github.com:<owner-or-organization>/<repository-name>.git
```

## 6. Start a Databricks App project

Before scaffolding, ask the user to select the Databricks profile and the resources the app will use. Do not guess among multiple workspaces, warehouses, Lakebase projects, or other resources.

Inspect the current AppKit template manifest:

```powershell
databricks apps manifest -o json
```

The manifest is the source of truth for plugin names, required resource fields, permissions, and scaffolding rules. A typical AppKit application is then created with `databricks apps init`, using the selected features and resources and including `--run none` so the generated code can be reviewed before execution.

After scaffolding:

1. Review the generated files and update `.gitignore` if necessary.
2. Commit the scaffold as a separate change.
3. Develop on a feature branch.
4. Run type generation, builds, tests, and `databricks apps validate` as required by the selected AppKit plugins.
5. Open a pull request for review.
6. Deploy an approved commit and record its Git commit SHA with the deployment.

`databricks apps deploy` uploads and starts application code in a workspace, but it does not commit or push the code to GitHub. CI/CD can later deploy an approved branch, tag, or commit automatically.

## Troubleshooting

### `databricks` is not recognized after installation

Restart PowerShell. If the problem continues, locate duplicate or missing binaries:

```powershell
where.exe databricks
```

### Databricks reports `cannot configure default credentials`

List profiles and rerun the command with an explicit valid profile:

```powershell
databricks auth profiles
databricks <command> --profile <profile-name>
```

Reauthenticate with OAuth when necessary:

```powershell
databricks auth login --host <workspace-url> --profile <profile-name>
```

### Docs MCP installation fails with `ERR_TTY_INIT_FAILED`

Use the non-interactive command from step 3 with `--agent codex --global --yes`.

### `gh auth status` reports an invalid account

Confirm which account is active. Authenticate or switch to the intended account before creating the repository:

```powershell
gh auth login --hostname github.com --git-protocol ssh --web
gh auth switch --hostname github.com --user <username>
gh auth status
```

### GitHub device code was entered incorrectly or expired

Cancel the pending command and rerun `gh auth login` to generate a new code. Device codes cannot be reused.

### Git push uses the wrong transport

Set GitHub CLI to use SSH and inspect the remote:

```powershell
gh config set git_protocol ssh --host github.com
git remote -v
```

The remote should resemble:

```text
git@github.com:<owner-or-organization>/<repository-name>.git
```

## Setup completion checklist

- [ ] Git, GitHub CLI, Databricks CLI, Node.js, npm, VS Code, and Codex are installed.
- [ ] A descriptive Databricks OAuth profile is valid.
- [ ] Required workspace, warehouse, Unity Catalog, and optional Lakebase permissions are confirmed.
- [ ] Databricks AI tools report the Codex plugin as installed and current.
- [ ] `devhub-docs` appears as enabled in `codex mcp list` and responds to a documentation request.
- [ ] GitHub CLI is authenticated as the intended user or organization member.
- [ ] SSH authentication to GitHub succeeds.
- [ ] A private GitHub repository exists before implementation starts.
- [ ] The local `main` branch tracks `origin/main` and the working tree is clean.
- [ ] `.gitignore` excludes dependencies, build output, environment files, logs, and secrets.

## References

- [Databricks CLI](https://developers.databricks.com/docs/tools/databricks-cli)
- [Databricks Apps quickstart](https://developers.databricks.com/docs/apps/quickstart)
- [Databricks Apps development](https://developers.databricks.com/docs/apps/development)
- [Databricks agent skills](https://developers.databricks.com/docs/tools/ai-tools/agent-skills)
- [Databricks Developer Hub](https://developers.databricks.com/)
