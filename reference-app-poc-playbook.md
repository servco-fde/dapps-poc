# Building the Reference Databricks App POC

This document records the key moves, prompts, decisions, commands, and troubleshooting lessons used to bootstrap this reference Databricks App proof of concept. It is intended to help other Forward Deployed Engineers repeat the same workflow with Codex on a Windows company workstation.

## Current state

This POC has completed environment setup, product framing, architecture research, source-control setup, the first functional implementation slice, and its first successful Databricks Apps deployment. The application is running against dedicated development resources.

| Artifact or capability | Status |
|---|---|
| Product seed | Captured in [`seed-1.md`](./seed-1.md) |
| Architecture and delivery proposal | Captured in [`seed-1-proposal.md`](./seed-1-proposal.md) |
| FDE workstation setup guide | Captured in [`dapps-env-setup.md`](./dapps-env-setup.md) |
| Databricks AI tools and skills | Installed for Codex |
| Developer Hub Docs MCP | Installed and verified |
| GitHub repository | Created at `rdelgd/dapps-poc` |
| Databricks profile | `hawaii-dev-workspace` selected |
| Initial metric scope | `hawaii_prod.testing.vw__metrics_test` selected |
| Databricks App scaffold | Built with AppKit 0.74.0 and validated |
| Lakebase project | `projects/metric-view-hub` created and verified |
| SQL warehouse | Dedicated `metric-view-hub-dev` created and verified |
| Read identity | OBO authorized; live metric-view data verified |
| Application roles | Reviewers collaborate; only configured admins can accept |
| Databricks App | `metric-view-hub` is deployed and running |
| Current deployment | `01f1ad67c8de1c5f927254412885db2a` succeeded |
| App URL | `https://metric-view-hub-4192082222593323.3.azure.databricksapps.com` |

The deliberate stopping point matters: the proposal was written before any application code or Databricks resources were created.

## Working method

The POC followed five principles:

1. Put the business objective in a short seed file rather than starting with implementation details.
2. Equip Codex with Databricks skills, CLI access, and live documentation before asking it to design the app.
3. Require a written proposal before scaffolding, provisioning, or deploying anything.
4. Establish GitHub source control before implementation begins.
5. Ask Codex to verify each external tool or registration rather than treating a successful-looking command as proof.

## Move 1: Capture the product idea in a seed file

The first artifact was [`seed-1.md`](./seed-1.md). It describes a coordination application where business users and engineers collaborate on existing and proposed Unity Catalog metric views. Business users should not need Unity Catalog write access or knowledge of metric-view SQL/YAML syntax.

The seed focused on:

- The users: business stakeholders and engineers
- The governed object: Unity Catalog metric views
- The workflow: discovery, drafting, discussion, review, and development
- The security boundary: business users read published objects but do not write to Unity Catalog
- The abstraction goal: business users work in domain language instead of engineering syntax

This was intentionally a problem statement, not a technical specification. Codex was asked to research the implementation options rather than being told which stack to use.

## Move 2: Install the Databricks AI tools and agent skills

The initial prompt was:

> I'm trying to install the Databricks AI skills using this command: `databricks aitools install`, but getting an error. Can you try?

Codex ran:

```powershell
databricks aitools install
```

The command installed the Databricks plugin for Codex. GitHub Copilot was skipped because its CLI was not on `PATH`; that did not affect Codex.

The installation was verified with:

```powershell
databricks aitools list
databricks aitools version
```

An important clarification followed: `aitools` is included in the modern Databricks CLI. It is not a separate executable. The `install` subcommand installs Databricks skills/plugins into supported coding agents.

### Reusable prompt

```text
Use the Databricks CLI to install the Databricks AI tools for Codex. Capture the full output, explain any skipped agents, and verify the resulting installation with `databricks aitools list` and `databricks aitools version`.
```

## Move 3: Install and verify the Developer Hub Docs MCP server

The original prompt supplied the documented command:

> Install the Docs MCP server using `npx add-mcp https://developers.databricks.com/api/mcp --name devhub-docs -g`.

The first attempt downloaded `add-mcp` but failed with:

```text
ERR_TTY_INIT_FAILED
```

The installer was trying to display an interactive agent picker in a non-interactive terminal. Codex inspected the command help, identified the supported Codex agent name, and reran the installation without prompts:

```powershell
npx add-mcp https://developers.databricks.com/api/mcp `
  --name devhub-docs `
  --agent codex `
  --global `
  --yes
```

Registration was verified in two ways:

```powershell
codex mcp list
npx add-mcp list --agent codex --global
```

Codex then made a live call to the MCP server's documentation index. That final read proved that the server was operational, not merely present in a configuration file.

### Reusable prompt

```text
Install the Databricks Developer Hub Docs MCP globally for Codex. Avoid interactive agent selection, verify that `devhub-docs` is enabled in `codex mcp list`, and make one live documentation request to prove the server works.
```

## Move 4: Require a proposal before implementation

The prompt that set the main working boundary was:

> Read `seed-1.md` and use the tools you have access to via Databricks CLI, skills, and AI tools to write a proposal for how you would accomplish it. Write the proposal as a Markdown file and save it to the root directory before you actually implement anything.

This prompt worked well because it specified:

- The source artifact to read
- The tools Codex should consult
- The expected output format and location
- A hard stop before implementation

Codex used the installed Databricks capabilities to:

1. Verify the Databricks CLI version.
2. List all configured Databricks profiles without selecting one.
3. Load the Databricks core, Apps, App Design, and Metric Views skills.
4. Query the live Developer Hub Docs MCP for Apps, AppKit, and Lakebase guidance.
5. Inspect the current `databricks apps manifest` rather than guessing plugin and resource names.
6. Inspect the installed AI-tools command surface.
7. Write [`seed-1-proposal.md`](./seed-1-proposal.md).

No workspace profile was chosen because multiple valid profiles existed. That decision prevented accidental work in the wrong workspace and was recorded as an implementation prerequisite.

### Resulting architecture decision

The proposal recommends a hybrid AppKit application:

- Use the AppKit `analytics` plugin and `useMetricView` to discover and preview governed Unity Catalog metric views through a SQL warehouse.
- Use the AppKit `lakebase` plugin for drafts, versions, comments, approvals, validation results, publication links, and audit events.
- Keep business-user actions out of the Unity Catalog write path.
- Generate deterministic metric-view artifacts for engineering review and source-controlled deployment.
- Use a DAB-managed SQL job for eventual metric-view publication because DABs do not provide a native metric-view resource.

### Reusable proposal prompt

```text
Read <seed-file>. Use the installed Databricks CLI, Databricks agent skills, AI tools, and Developer Hub Docs MCP to research a solution.

Before implementing anything:
1. Verify the CLI and list every configured Databricks profile. Do not select a profile for me.
2. Inspect the current Databricks Apps manifest and relevant AppKit documentation.
3. Identify the required data-access, persistence, identity, and deployment decisions.
4. Write a concrete proposal to <proposal-file> in the repository root.
5. Include architecture, user workflow, persistence, permissions, implementation phases, validation, risks, and acceptance criteria.

Do not scaffold an app, create workspace resources, run workspace queries, or deploy anything during this step.
```

## Move 5: Establish source control explicitly

The proposal referred to Git-based engineering handoff, but GitHub repository creation required a separate instruction:

> You should have access to the `gh` CLI tool, and this computer should have SSH access to my account. Create a new repository, commit, and push.

Codex verified:

- GitHub CLI authentication
- SSH authentication to GitHub
- Git author name and email
- Repository-name availability
- The files that would be committed

SSH authentication worked, but the GitHub CLI had an invalid token for a different account. This exposed an important distinction: working Git-over-SSH credentials do not automatically authenticate `gh` for GitHub API operations such as repository creation.

Codex used the GitHub device flow:

```powershell
gh auth login --hostname github.com --git-protocol ssh --web
```

Two device codes were entered incorrectly or expired. Each failed flow was canceled and restarted because GitHub device codes cannot be reused. After authentication succeeded as the intended account, Codex initialized and committed the repository:

```powershell
git init -b main
git add -- seed-1.md seed-1-proposal.md
git commit -m "Add metric view collaboration proposal"
```

It then created a private GitHub repository and pushed `main`:

```powershell
gh repo create rdelgd/dapps-poc `
  --private `
  --source . `
  --remote origin `
  --push
```

The final checks confirmed that `main` tracked `origin/main`, the remote used SSH, the repository was private, and the working tree was clean at that point.

### Reusable source-control prompt

```text
Before app implementation, establish source control for this directory.

1. Verify the active GitHub CLI account, SSH access, and Git author identity.
2. Check whether <owner>/<repository> already exists.
3. Review `.gitignore` and the exact files that will be committed so no credentials or environment files are included.
4. Initialize `main`, make an initial commit, create a private repository, and push over SSH.
5. Verify visibility, remote URL, branch tracking, latest commit, and clean working-tree status.
```

## Move 6: Clarify Git versus Databricks deployment responsibilities

The following question was sent to the Docs MCP server:

> Do Databricks Apps include a pre-built GitHub repository, or are deployed apps automatically version controlled?

The answer was no. `databricks apps init` scaffolds a local project, and `databricks apps deploy` creates a deployment. Neither operation creates a GitHub repository, commits changes, or pushes source code.

The Git-related deployment flags have a narrower purpose:

- `--git-branch` selects an existing branch.
- `--git-commit` selects an existing commit SHA.
- `--git-tag` selects an existing tag.
- `--git-source-code-path` selects the app directory within an existing repository.
- `--mode SNAPSHOT` or `AUTO_SYNC` controls how Databricks manages the deployment source.

Git and GitHub operations remain the responsibility of `git` and `gh`.

### Git-backed deployment credential lesson

For a private Git-backed deployment, Databricks—not the developer's laptop—must fetch the repository. The app service principal therefore needs its own Git credential. Local `gh` authentication and SSH keys are not available to the Databricks control plane.

This creates two practical paths:

| Development path | App service-principal Git credential | Recommended use |
|---|---:|---|
| Agent edits locally and runs `databricks apps deploy` | No | Fast development loop |
| Databricks deploys from a private Git repository | Yes | Shared test and production environments |
| Automatic deployment on repository push | Yes, plus provider integration/webhook | Mature CI/CD workflow |

The emerging recommendation is to keep the agentic inner loop local and simple, while using an exact Git commit/tag and Git-backed or CI/CD deployment for controlled environments.

## Move 7: Create the FDE environment setup guide

The guide began as a short checklist. The prompt was:

> I'm creating a guide to help other FDEs in my company. Here's what I have so far: `dapps-env-setup.md`.

After review, Codex identified missing details:

- The prerequisite and step counts did not match their lists.
- Git and GitHub CLI were not listed as prerequisites.
- The Docs MCP command needed non-interactive flags.
- Databricks profile selection needed to be explicit.
- “Power user” needed to be replaced with resource-specific permissions.
- GitHub authentication and repository creation needed actual commands.
- Secret and `.env` handling needed to be documented.

The follow-up prompt was:

> Go ahead and make those changes to the Markdown file yourself.

Codex rewrote [`dapps-env-setup.md`](./dapps-env-setup.md) into an ordered Windows/PowerShell guide with prerequisites, OAuth authentication, AI-tools installation, MCP setup, GitHub setup, source-control bootstrap, Databricks Apps initialization guidance, troubleshooting, and a completion checklist.

### Reusable documentation-improvement prompt

```text
Read <guide-file> and update it directly into a repeatable guide for other FDEs. Preserve the original intent, replace vague permissions with concrete resource permissions, include verification after every installation, add troubleshooting based on failures observed in this session, and do not commit or push unless I ask.
```

## Move 8: Test assumptions on the company computer

The next prompt challenged whether the guide's package-manager commands would work under corporate controls:

> I have a company computer and I don't know if the WinGet commands in the guide will work. Test some to see.

Codex performed read-only checks rather than installing or upgrading software:

```powershell
winget --info
winget source list
winget show --id Microsoft.VisualStudioCode --exact --accept-source-agreements
winget show --id Git.Git --exact --accept-source-agreements
winget show --id GitHub.cli --exact --accept-source-agreements
winget show --id Databricks.DatabricksCLI --exact --accept-source-agreements
winget show --id OpenJS.NodeJS.LTS --exact --accept-source-agreements
```

The checks established that:

- WinGet was installed and functional.
- The Microsoft Store and community WinGet sources were configured.
- No explicit Windows App Installer policy restriction was visible in the standard policy locations.
- Every package ID in the guide resolved.
- Every required executable was already installed and runnable.

The checks did not run an installer. Package resolution cannot prove that an endpoint-security product or an administrator policy will allow a particular MSI or elevation prompt. This limitation was stated explicitly rather than treating a lookup as an installation test.

### Reusable corporate-workstation prompt

```text
Test whether the package-manager commands in <guide-file> are viable on this company computer. Keep the checks read-only: verify the package manager, sources, relevant policy indicators, package IDs, installed versions, executable paths, and available updates. Do not install or upgrade anything. Report what the checks prove and what they cannot prove about administrator or endpoint-security controls.
```

## Move 9: Turn the build journal into a living implementation record

The implementation authorization was:

> Treat this Markdown file as a living document that you can add to as you observe me continuing to develop this POC. Implement `seed-1-proposal.md` phase by phase, ideally reaching a deployed POC today.

Codex began Phase 0 by reloading the installed Databricks CLI, Apps, AppKit UX, metric-view, and Lakebase guidance before touching application code. It then reran the current AppKit manifest and checked local state.

The checks established that:

- Databricks CLI v1.15.0 is installed.
- The AppKit manifest supports a combined `analytics,lakebase` scaffold.
- `analytics` requires a running SQL warehouse with `CAN_USE`.
- Lakebase requires explicit project, branch, and database resource paths with `CAN_CONNECT_AND_CREATE`.
- The app should be deployed before local Lakebase development so its service principal creates and owns the application schema.
- Four named Databricks profiles currently authenticate; no profile was selected automatically.
- Deployment will be presented for explicit approval only after the implementation is built and validated.

The user selected `hawaii-dev-workspace`. Read-only discovery in that workspace found four metric views. The strongest POC asset is `hawaii_prod.testing.vw__metrics_test`, a live Auto Retail sales and F&I metric view with measures such as deal count, GPVR, PVR, and product penetration. Its `hawaii_dev` counterpart currently has a broken dependency; the other two metric views are internal objects managed by a call-center dashboard and are poor direct app dependencies.

Four SQL warehouses are available and all were stopped at discovery time: `app-dev-test`, `Test Warehouse`, `Serverless Starter Warehouse`, and `Default Serverless Job Warehouse`. The sole Lakebase project, `projects/app-dev-connection-dev`, belongs to another engineer and its only `production` branch is archived. No resource was started, changed, or created during discovery.

The user then authorized a new dedicated Lakebase project. Codex created and verified:

- Project: `projects/metric-view-hub`, owned by `roberto.delgado@servco.com`
- Branch: `projects/metric-view-hub/branches/production`, state `READY`
- Endpoint: `projects/metric-view-hub/branches/production/endpoints/primary`, state `ACTIVE`
- Database resource: `projects/metric-view-hub/branches/production/databases/databricks-postgres`
- PostgreSQL database: `databricks_postgres`

The first create attempt failed before reaching the API because PowerShell stripped quotes from inline JSON. Writing the exact request body to a temporary JSON file and passing it as `--json @<file>` succeeded. The temporary request file was removed immediately afterward.

The user selected `vw__metrics_test` for the app. Because the dev-catalog object with that name has a broken dependency, the implementation will use the verified live object `hawaii_prod.testing.vw__metrics_test` as its read-only governed metric view.

The implementation data-access decision remains the hybrid proposed in the architecture: SQL warehouse analytics for read-only Unity Catalog metric views, plus Lakebase OLTP for drafts, comments, reviews, and audit history.

The source tree also gained a Node/AppKit `.gitignore` before scaffolding so dependencies, generated output, local environment files, logs, test output, and coverage artifacts do not enter source control.

### Reusable phase-by-phase implementation prompt

```text
Treat <build-journal.md> as a living implementation record. Implement <proposal.md> phase by phase and update the journal with decisions, commands, verification evidence, failures, and corrections as they occur.

Before scaffolding, reload the relevant product skills, inspect the current template manifest, list authenticated profiles and selectable resources, and let me choose workspace-specific resources. Keep each phase in its own reviewable commit. Build and validate the application before asking for deployment approval.
```

## Move 10: Scaffold, correct resource assumptions, and build the first functional slice

The user required on-behalf-of access for governed metric reads. Codex initially used `app-dev-test` because both the warehouse list and `get-default-warehouse` returned its ID. The user clarified that they did not want to depend on a warehouse created by another engineer. This was corrected before any commit or deployment.

Codex created a dedicated SQL warehouse:

- Name: `metric-view-hub-dev`
- ID: `d789a5e994a1ea33`
- Creator: `roberto.delgado@servco.com`
- Compute: serverless, 2X-Small, Photon enabled
- Capacity: one cluster minimum and maximum
- Auto-stop: five minutes
- Verification: `RUNNING` and `HEALTHY`

The generated app now binds this warehouse with `CAN_USE`, declares the `sql` user API scope, and registers `hawaii_prod.testing.vw__metrics_test` with `executor: "user"`. A real query through the new warehouse returned dealership deal counts and GPVR, confirming the warehouse and metric-view access path.

The first `databricks apps init` attempt wrote the project files but its background dependency install exited with Windows code `0xfffff030`. Running `npm install` directly completed successfully. The template pinned AppKit 0.57.0, while the metric-view hook requires at least 0.59.0; package-registry verification showed 0.74.0 as current, so both AppKit packages were upgraded to 0.74.0 before implementation.

The first functional slice includes:

- A governed Auto Retail metric catalog with OBO KPI, dealership, and monthly GPVR queries through `useMetricView`
- Loading, empty, error, and warehouse-readiness behavior
- A guided proposal form for business context, sources, dimensions, measures, formats, and acceptance criteria
- An app-owned Lakebase `metric_hub` schema with proposals, immutable versions, comments, and audit events
- Optimistic version checks and server-enforced workflow transitions
- A review page with published-versus-proposed context, comments, history, and status actions
- Deterministic SQL/YAML artifact generation and download without direct Unity Catalog publication

Validation caught a Windows-specific server-build issue: the scaffold's `external` predicate treated resolved drive-letter paths as package imports, leaving a TypeScript route import outside `dist`. The predicate was corrected so local server modules are bundled. The emitted server grew from 0.37 KB to 17.30 KB and was inspected to confirm it contains the `metric_hub` schema and routes.

Verification completed before deployment:

- AppKit type generation produced 32 typed measures and 14 typed dimensions for `auto_retail`.
- TypeScript type checking passed.
- ESLint passed with no warnings after dynamic form rows received stable client-side keys.
- Three focused tests for artifact generation and workflow transitions passed.
- The production server and client build passed.
- `databricks apps validate --profile hawaii-dev-workspace` passed type generation, AST-grep lint, type checking, build, and tests.

An npm production audit initially reported 21 transitive findings. Compatible updates, patched React Router and Vitest releases, and same-major overrides for DOMPurify, ECharts, `qs`, and `yaml` reduced the result to eight high-severity findings in AppKit/MLflow's remaining OpenTelemetry and `js-yaml` dependency chain. npm's proposed forced fix would downgrade AppKit and is incompatible with the current metric-view implementation, so it was not applied. The complete validation suite passed after the compatible updates.

The validated implementation was committed and pushed to `feat/metric-view-collab-poc` before the deployment approval checkpoint.

## Move 11: Deploy, diagnose the remote identity boundary, and redeploy

After the user explicitly approved deployment, Codex ran:

```powershell
databricks apps deploy --profile hawaii-dev-workspace
```

The first remote build failed even though local validation had passed. The Databricks build logs showed that the scaffold's `postinstall` and `prebuild` lifecycle scripts were rerunning metric-view type generation as the app service principal. That identity correctly had access to the bound SQL warehouse and Lakebase resource, but it did not have `USE CATALOG` on `hawaii_prod`. Granting that direct catalog privilege would have weakened the intended OBO boundary.

The fix was to keep the generated metric metadata and TypeScript contract in source control and stop regenerating them during the remote package-install/build lifecycle. Development and `databricks apps validate` still regenerate and verify the contract under the developer's selected profile. Runtime metric queries still use `executor: "user"` and the app's `sql` user API scope, so they execute with the signed-in user's OBO authorization.

After the lifecycle change, the full local validation suite passed again. The fix was committed and pushed as `61e958a`, then the approved deployment was retried.

Post-deployment evidence:

- Deployment ID: `01f1ad63f706191abc229e805abb4c04`
- Deployment state: `SUCCEEDED`
- App state: `RUNNING`
- Compute state: `ACTIVE`
- SQL warehouse binding: `metric-view-hub-dev` (`d789a5e994a1ea33`)
- Lakebase binding: `projects/metric-view-hub/branches/production`
- Startup log: `[lakebase] metric_hub schema is ready`
- App URL: `https://metric-view-hub-4192082222593323.3.azure.databricksapps.com`
- Interactive OBO smoke test: the signed-in user authenticated successfully and saw live metric-view data
- Lakebase smoke test: a version 1 proposal persisted, accepted a comment, and transitioned from `draft` to `in_review`
- Authorization finding: the submitting user can also see the Accept action because reviewer-role enforcement is not implemented yet

This exposed a useful OBO deployment rule: build-time metadata discovery and runtime data access use different identities. Generate and validate typed metric contracts during development, commit them, and avoid requiring the app service principal to inspect governed data solely to compile the application.

## Move 12: Add admin and reviewer tiers

The first interactive proposal test completed creation, version 1 persistence, commenting, submission for review, and acceptance. It also showed that the initial implementation allowed the proposal author to accept because it enforced valid workflow transitions without enforcing application roles.

The follow-up requirement was:

> Create two tiers for this app: admins and reviewers. Only admins can accept.

The implementation now applies this policy on both sides of the application:

- Every authenticated user defaults to the `reviewer` role.
- A comma-separated `APP_ADMIN_EMAILS` deployment setting identifies admins; `roberto.delgado@servco.com` is the initial admin.
- `GET /api/me` returns the signed-in user's normalized email and resolved role.
- Reviewers can create proposals, comment, submit for review, resubmit, and request changes.
- Only admins see the Accept action.
- The status API independently returns `403` if a reviewer attempts the `in_review` to `approved` transition directly.
- The proposal page displays the current application role and explains when admin acceptance is required.

Five focused tests now cover artifact generation, workflow transitions, case-insensitive admin matching, safe reviewer defaults, and admin-only acceptance. Formatting, ESLint, TypeScript, the production build, and the complete Databricks Apps validator passed before deployment.

The change was committed as `0275986` and deployed successfully:

- Deployment ID: `01f1ad67c8de1c5f927254412885db2a`
- Deployment state: `SUCCEEDED`
- App state: `RUNNING`
- Compute state: `ACTIVE`
- Lakebase startup check: `metric_hub schema is ready`

During replacement, the previous app process exceeded Databricks Apps' 15-second `SIGTERM` grace period. The replacement instance still started normally and is healthy. Graceful pool shutdown can be investigated if the message repeats on later deployments.

## Prompts that produced the best results

The most effective prompts in this POC shared several traits:

- They named the artifact Codex should read or create.
- They named the tools Codex should consult.
- They separated research/proposal work from implementation.
- They stated the expected stopping point.
- They required verification after installation or external changes.
- They gave Codex permission to act when an actual change was intended.
- They required profile/resource selection instead of allowing assumptions.

A compact pattern for future FDE work is:

```text
Read <source artifact> and accomplish <objective>.

Use <specific CLI>, the relevant installed skills, and <documentation source>. Verify current commands and resource schemas rather than relying on memory.

Before making changes, produce <reviewable artifact> at <path>. Do not <explicit boundary> during this phase.

When implementation is authorized:
- list choices instead of selecting workspaces or resources silently;
- keep source under Git from the beginning;
- validate each external action;
- report files changed, commands run, verification evidence, and remaining decisions.
```

## Important lessons for other FDEs

1. **Install capability before asking for architecture.** The Databricks skills and live docs materially improved the proposal.
2. **Verification should be functional.** A registered MCP entry is weaker evidence than a successful MCP tool call.
3. **Use an explicit Databricks profile on every workspace command.** Multiple workspaces are common, and `DEFAULT` may be stale or invalid.
4. **Inspect `databricks apps manifest` before scaffolding.** Plugin names, resource fields, permissions, and scaffolding rules can change.
5. **Write the proposal before creating resources.** This exposes identity, persistence, governance, and deployment choices while changes are still inexpensive.
6. **Create the repository before implementation.** Databricks Apps do not create or manage GitHub repositories for you.
7. **SSH and `gh` authentication are separate.** A successful `ssh -T git@github.com` does not guarantee that GitHub CLI API calls are authenticated.
8. **Use non-interactive installer flags with coding agents.** Interactive terminal UI can fail inside managed coding harnesses.
9. **Treat local and Git-backed deployments as different workflows.** Private Git-backed deployments need a Git credential for the app service principal; local CLI uploads do not.
10. **Test company-machine assumptions without mutating the machine.** Package lookup, policy inspection, and executable verification provide useful evidence before attempting installation.
11. **Never commit credentials or local environment files.** Review `.gitignore` and staged files before every initial push.
12. **Separate build-time discovery from runtime OBO access.** A remote builder runs as the app service principal; committed generated types let the build succeed without granting that principal direct catalog access.
13. **Enforce roles on the server.** Hiding an approval button improves the interface, but the API must independently reject unauthorized transitions.
14. **Record the current stopping point.** A strong build journal distinguishes completed work from proposals and next steps.

## Next moves for this POC

1. Refresh the app and verify that `roberto.delgado@servco.com` displays as `Admin`.
2. Sign in with an unlisted test user and verify that it displays as `Reviewer`, does not show Accept, and can still comment or request changes.
3. Smoke-test artifact download.
4. Record the remaining interactive smoke-test evidence and any corrections in this living document.
5. Decide whether the following increment adds Databricks-group role mapping, editable revisions in the UI, or automated Git pull-request handoff.
