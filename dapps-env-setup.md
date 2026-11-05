# Reference scope and DevOps handoff

This repository is an FDE reference for building and adapting Databricks Apps. Metric View Hub is the working example. Maintained operational guidance covers the app's resources, configuration, identities and permissions, local proxy, validation, deployment, readiness, and lifecycle.

General workstation preparation, editor/agent/skills/MCP integration setup, local and remote development-environment certification, CI/CD, and broader DevOps tooling belong to a separate colleague-led project. Its name and link have not yet been supplied. No scripts have been transferred or verified in that project as part of this scope change.

The former `setup.sh` workstation checker and installer, its helper, and its dedicated tests have been retired. This page remains so older guide links explain the ownership change. Historical setup observations in the [playbook](./reference-app-poc-playbook.md) and Reffy archives describe earlier work, not a supported setup workflow.

For this app, start with an already prepared workstation, the [app prerequisites and configuration](./metric-view-hub/README.md#app-prerequisites-and-configuration), and the [app-specific local entry point](./init.md). App project dependencies and build/test commands remain part of this reference. Follow the app README for explicit profile selection, existing `.env` preservation, personal Lakebase schemas, and the full-stack local proxy. Those instructions do not certify general environment readiness or authorize shared cloud resource changes.

The [scope decision](./.reffy/artifacts/databricks-app-reference-scope-pivot.md) records the rationale and ownership boundary.
