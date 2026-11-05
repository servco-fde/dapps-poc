# Focus the FDE reference repository on Databricks Apps

## User direction — November 5, 2026

This entire repository is a reference for other Forward Deployed Engineers. Metric View Hub is the working example through which FDEs learn how to compose and adapt a Databricks App; the repository's purpose extends beyond the example's metric-proposal business workflow.

The reference originally expanded into commentary and scripts for workstation readiness, local and remote development environments, CI/CD, and broader DevOps. The user now wants to stop owning that general DevOps guidance. A colleague is developing a separate project with skills and scripts for those needs. Operational recommendations here should concentrate on resources and behavior specific to Databricks Apps.

## Proposed ownership boundary

Keep the reference app, its architecture, source walkthroughs, customization guidance, and examples of governed data access and application state. Keep the operational context necessary to understand and run this app:

- App manifests and target-specific resource bindings.
- App service-principal access, user/OBO execution, application roles, secret references, and permission troubleshooting.
- SQL warehouse, Unity Catalog, and Lakebase dependencies as consumed by the app, including developer-schema isolation and the limits of that isolation.
- App-specific local configuration, dependency/build/test commands, the full-stack local proxy, and the distinction between local developer identity and deployed browser-user identity.
- Databricks Apps validation, deployment, startup, shutdown, readiness checks, and resource-specific cost/lifecycle notes.
- Optional application integrations such as Microsoft Graph as examples of app configuration and authorization, rather than a general identity-platform setup service.

Move general machine and delivery-tooling concerns out of this repository's maintained scope:

- Workstation-wide prerequisite scanners, installers, and repair automation.
- OS/package-manager bootstrap, editor/Codex setup, Git/GitHub identity and transport checks, and skills/MCP installation or distribution workflows.
- General local/remote environment certification, corporate workstation diagnostics, CI/CD design and pipeline templates, and broad cloud/DevOps automation.

A topic belongs here when it explains a resource, identity, configuration, command, or observed behavior of the reference Databricks App. It belongs in the colleague's project when it prepares or certifies an FDE's general development/delivery environment. App-specific deployment commands remain useful; prescribing a CI/CD platform does not. Listing required tool versions and assuming an already prepared workstation remains necessary; installing or certifying that workstation does not.

## Repository consequences to explore in implementation

- Reframe the root README and ReffySpec project context around the repository's FDE reference purpose and this ownership split.
- Retire `setup.sh`, its dedicated helper `scripts/setup-json.cjs`, and its isolated tests `tests/test_setup.py` and `tests/setup_fixture.cjs` rather than maintaining a second DevOps toolkit.
- Replace the current `dapps-env-setup.md` with a short scope/handoff notice and a path to the app README. Repurpose `init.md` as an app-specific starting point that assumes general workstation preparation is complete.
- Update `AGENTS.md` so local-app requests no longer invoke a retired general workstation checker. Preserve explicit identity selection, credential protection, and existing local-proxy/schema safeguards as app-specific guidance.
- Remove workstation-setup instructions from both READMEs and the in-app reference guide's source links. Keep app prerequisites, configuration, build/test commands, and resource-specific troubleshooting discoverable.
- Reconcile current recommendations in the playbook. Preserve historical build evidence and prior Reffy artifacts, but label superseded setup/DevOps material as historical so readers and agents do not mistake it for current guidance.
- Preserve existing product workflows, reference markers, sample-data disclosures, app resources, credentials, and deployment state.

## Relationship to earlier decisions

`add-fde-workstation-setup` deliberately introduced the capability now being retired. Its archive records the prior decision and should remain unchanged. The canonical `fde-workstation-setup` spec remains current until a superseding change is implemented and archived. The existing `in-app-reference-documentation` capability remains valuable; its FDE-guide requirement needs a narrower source-link and operational scope.

`fde-workstation-readiness.md` supplies the original setup intent. `in-app-reference-documentation.md` supplies the two-audience reference model. Earlier tooling-distribution notes are context, not evidence that this repo owns or should implement the colleague's project.

## Open handoff detail

The colleague's project name, repository URL, supported commands, and publication status were not supplied. Do not invent a link or claim that any scripts have been transferred or verified. The scope split and retirement can be implemented with a plain ownership notice; add a verified link later when available. No cross-repository migration is implied by this decision.

## Planning boundary

This request authorizes recording the ideation first and then creating a ReffySpec change to guide implementation. It does not request executing the retirement, editing runtime behavior, operating cloud resources, publishing references, or committing/pushing the plan. The proposed implementation should be reviewable before those changes are made.
