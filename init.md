# Initialize this repository for local development

Codex: prepare this workstation and repository for local development of the Databricks App.

1. Read [`AGENTS.md`](./AGENTS.md), [`dapps-env-setup.md`](./dapps-env-setup.md), and [`metric-view-hub/README.md`](./metric-view-hub/README.md) before making changes.
2. Detect the operating system and current shell. Run the non-mutating `setup.sh --check` workflow using macOS Bash or Windows Git Bash. If running from Windows PowerShell, invoke an existing Git Bash executable directly; do not use WSL.
3. Show the configured Databricks profiles and ask the FDE to select the intended profile. Never infer an account or profile.
4. Summarize missing prerequisites and obtain approval before running `setup.sh --install`, changing workstation software, or starting a login flow. The FDE's request to follow this file authorizes the repository-local dependency installation in the next step.
5. After workstation checks pass, follow the app README to run `npm ci`, create `.env` from `.env.example` only when `.env` is absent, collect missing non-secret resource values, and configure a unique developer `METRIC_HUB_SCHEMA`.
6. Validate the app, start the full app locally, and report the local URL and any remaining manual checks.

Never print credentials, overwrite an existing `.env`, change the selected identity, provision or reconfigure Databricks cloud resources, deploy the app, or explicitly start stopped remote compute without an explicit request.
