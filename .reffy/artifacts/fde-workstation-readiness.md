# FDE workstation readiness

## Request and corrected assumption

The implementation review corrected the assumption that every FDE uses Windows. The playbook now targets both macOS and Windows. The user requests a reusable `setup.sh` that prepares an FDE to develop Databricks Apps using this workflow, with a ReffySpec change reviewed before any script implementation.

## Source context

- `reference-app-poc-playbook.md`: shared workflow, OS-specific shell conventions, functional verification, explicit profile selection, and historical Windows observations.
- `dapps-env-setup.md`: toolchain, Databricks authentication and skills, Docs MCP, GitHub identity and source-control prerequisites; currently Windows-oriented.
- `.reffy/reffyspec/project.md`: Node.js 22+, modern Databricks CLI, separate root pnpm planning tooling and app npm dependencies, and local developer isolation.
- `metric-view-hub/README.md`: local app runtime requires existing cloud services and developer-specific environment settings.

## Planning constraints

The script must be useful to other FDEs without Roberto's profile, email, home directory, or resource IDs. Supporting both workstation OSes does not mean PowerShell can execute a shell script directly. The proposed Windows entry route needs an explicit Bash bootstrap prerequisite. Tool installation alone cannot prove workspace permissions, editor integration, live MCP availability, or app runtime readiness.

The user accepted Git Bash for Windows setup in proposal review, noting that the original company workstation used PowerShell. The user also clarified that each FDE must be free to choose their own SDD tool/framework. The common script must not impose Reffy or check its planning-only dependencies; ReffySpec remains this repository's mechanism for reviewing this change. Installation behavior and the boundary between general machine readiness and project/resource configuration remain proposed pending overall approval. No script, installation, authentication, resource provisioning, or app deployment is authorized during this planning turn.

## Implementation authorization

On 2026-09-14, the user approved implementing the revised proposal. The setup script and onboarding documents preserve FDE choice of SDD framework. Actual platform evidence and remaining live verification belong in the change design/tasks and playbook.
