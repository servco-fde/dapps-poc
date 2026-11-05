# Change: Refocus the FDE reference repository on Databricks Apps

## Status

Reviewed and implementation authorized by the user on November 5, 2026. The repository scope correction, tooling retirement, and documentation updates are implemented and verified locally; evidence and baseline formatting limitations are recorded in tasks.md. No cloud deployment was performed, so the updated in-app guide will become live only after a separately requested deployment.

## Why

This repository is an FDE reference for building and adapting Databricks Apps, with Metric View Hub as its working example. Its workstation preparation scripts and general DevOps recommendations have expanded the maintenance surface beyond that purpose. A colleague is developing a separate project with skills and scripts for FDE DevOps needs; maintaining overlapping tooling here would blur ownership.

Focus the repository on the application and the Databricks Apps resources, identities, configuration, and runtime behavior that make the example work.

## What Changes

- State the repository's reference purpose and ownership boundary in the root README, app README, ReffySpec project context, agent instructions, and FDE guide.
- Retire the general workstation setup capability: remove `setup.sh`, `scripts/setup-json.cjs`, `tests/test_setup.py`, and `tests/setup_fixture.cjs` after checking for other consumers.
- Replace `dapps-env-setup.md` with a short handoff notice. Refocus `init.md` on app-specific configuration and startup, assuming an already prepared workstation.
- Remove maintained recommendations and links for workstation installers, editor/agent integration setup, general local/remote environment certification, CI/CD design, and broad DevOps automation.
- Retain app prerequisites and project commands; app manifests and target/profile selection; resource bindings; service-principal/OBO permissions; secret references; warehouse/Unity Catalog/Lakebase dependencies; developer-schema isolation; local proxy behavior; and Databricks Apps deployment, readiness, and lifecycle guidance.
- Preserve archived decisions and historical build evidence, visibly distinguishing superseded DevOps material from current recommendations.
- Add an ownership handoff to the colleague's project without inventing its name, URL, commands, readiness, or a completed code transfer.

## Impact

- Specs: remove all 13 requirements in `fde-workstation-setup`; modify the FDE-guide requirement in `in-app-reference-documentation`; add the repository scope contract in `refocus-databricks-app-reference`.
- Files: the setup script/helper/tests above; `README.md`, `metric-view-hub/README.md`, `init.md`, `dapps-env-setup.md`, `AGENTS.md`, `.reffy/reffyspec/project.md`, `reference-app-poc-playbook.md`, and the in-app guide/content and relevant documentation tests.
- Compatibility: `setup.sh` is intentionally retired; existing onboarding callers must use the handoff notice and app-specific entry point instead. This repo will not certify readiness for the colleague's project.
- Product behavior, application routes, data, app resource identifiers, secrets, dependencies, and deployment targets remain outside the implementation's behavior-change scope. No cloud operation or deployment is required to retire the tooling and update repository documentation; publishing the changed in-app guide is a separate deployment action.
- Existing uncommitted edits include an archived workstation-setup change and updated canonical spec. Preserve that work and its accepted history; do not re-archive or rewrite it to model this pivot.

## Acceptance Summary

An FDE can identify what the repository demonstrates, what to customize, and how to configure and operate the reference Databricks App. Its current instructions do not invoke a workstation installer, certify a general development environment, or prescribe CI/CD. The retired setup command and its exclusive helper/tests are absent, active links and agent instructions are consistent, and the historical record remains navigable. The app's existing functionality, credential boundaries, and resource safeguards remain intact.

## Supersedes
- `add-fde-workstation-setup` — reverses ownership of the reusable workstation checker, repair workflow, and general onboarding material. Preserve `.reffy/reffyspec/changes/archive/2026-09-29-add-fde-workstation-setup/` unchanged.
- `add-in-app-reference-documentation` — narrows the FDE guide's operational recommendations and source links; preserves its two-audience model, routes, reference classification, static availability, and accessibility requirements.

## Reffy References
- `databricks-app-reference-scope-pivot.md` — user direction, retained/retired scope, file-level consequences, and the external ownership handoff.
- `fde-workstation-readiness.md` — original setup intent and constraints being superseded.
- `in-app-reference-documentation.md` — retained reference identity and two-audience documentation architecture.
