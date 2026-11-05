## 1. Reference purpose and ownership

- [x] 1.1 Review the proposed scope boundary before implementation; inventory current setup/CI/CD/environment recommendations and preserve unrelated uncommitted work.
- [x] 1.2 Update root `README.md` and `.reffy/reffyspec/project.md` to identify this repository as an FDE Databricks Apps reference and Metric View Hub as its working example.
- [x] 1.3 Document the external DevOps ownership handoff using a verified project link if supplied, otherwise a plain ownership notice with no invented commands or migration claims.

## 2. App-specific entry points and retirement

- [x] 2.1 Refocus `init.md` and `AGENTS.md` on the app-specific local path; preserve selected profiles, `.env`, full-stack proxy, personal-schema, and cloud-action safeguards.
- [x] 2.2 Replace `dapps-env-setup.md` with a short scope/handoff notice and link to the app README; remove general workstation/installer directions from both READMEs.
- [x] 2.3 Retain app prerequisites, npm project commands, target/resource configuration, service-principal/OBO identity, secret references, readiness checks, and Databricks Apps lifecycle guidance.
- [x] 2.4 Confirm the helper/test files have no independent consumers; remove `setup.sh`, `scripts/setup-json.cjs`, `tests/test_setup.py`, and `tests/setup_fixture.cjs`. Remove only exclusive setup references/configuration discovered by the inventory.
- [x] 2.5 Remove current CI/CD, workstation, editor/agent/MCP installation, and general environment-certification recommendations. Keep historical playbook evidence labeled as superseded; preserve archived changes and original artifacts.

## 3. In-app reference guidance

- [x] 3.1 Update `client/src/content/documentation.ts` and `FdeReferenceGuidePage.tsx` as needed to explain the narrowed scope and replace the workstation-onboarding source link.
- [x] 3.2 Preserve the user guide, guide routes, reference marker/classifications, stable anchors, static availability, and accessible desktop/mobile navigation.

## 4. Verify and finalize

- [x] 4.1 Check active documentation, agent instructions, configuration, and source links for dangling `setup.sh` calls, deleted helpers, general installer steps, and readiness/CI/CD ownership claims; distinguish intentional historical mentions.
- [x] 4.2 Run relevant documentation tests and app formatting, lint, type checking, and build checks. Adjust only tests affected by the retired links and narrowed content.
- [x] 4.3 Inspect the FDE guide on desktop/mobile and verify that the app-specific configuration/startup instructions remain complete without the workstation checker. Record runtime checks requiring separate cloud authorization rather than starting resources for this documentation change.
- [x] 4.4 Confirm that no secrets, `.env`, app resource bindings, runtime workflows, or deployment state changed as a consequence of the retirement.
- [x] 4.5 Run `reffy validate` and `reffy plan validate refocus-databricks-app-reference`; resolve errors before delivery.
- [x] 4.6 After implementation is delivered, archive this superseding change to update canonical specs. Do not edit the prior archived changes or claim retirement is complete during planning.

## Verification evidence — November 5, 2026

- Inventory confirmed the retired helper and fixtures were only used by the workstation checker and its test suite. Removed all four exclusive files; no active app/agent instructions invoke them.
- Updated the reference purpose, ownership handoff, app entry points, app README, FDE guide/content, and playbook. General setup commands remain only in explicitly historical records or retirement/handoff descriptions.
- `npm run lint`, `npm run lint:ast-grep`, `npm run typecheck`, `npm test` (6 files, 29 tests), and `npm run build` passed. The build retains its existing large-chunk advisory.
- Prettier passed on changed app/content/test files and the updated entry-point documents. The full `npm run format` check reports six unchanged HEAD files: `client/src/lib/audit-events.test.ts`, `client/src/lib/audit-events.ts`, `server/routes/microsoft/graph-client.test.ts`, `server/routes/microsoft/graph-client.ts`, `server/routes/microsoft/profile-routes.test.ts`, and `server/routes/proposals/proposal-routes.ts`. These baseline formatting issues were left outside this scope change.
- A documentation-only headless Chrome check loaded the built app with every data/API service intercepted as unavailable. At 1440px and 390px it verified both guide routes, tab navigation, the reference marker, scope/handoff text, local-configuration link, and absence of page overflow. Screenshots were visually inspected. This is static documentation verification, not a full-stack local-start or live-cloud readiness claim.
- Updated the existing documentation smoke assertions and corrected the Sample Orders option selectors to match its already-shipped non-Servco label.
- Preservation hashes confirmed `.env`, app manifests/target bindings, dependency manifests/lockfile, backend files, and all pre-existing archive files were unchanged. No cloud resource operation or deployment was performed.
- `git diff --check`, `reffy validate`, and `reffy plan validate refocus-databricks-app-reference` passed before archival. The normal archive operation records the completed delta in canonical specs; original archived changes remain unchanged.
