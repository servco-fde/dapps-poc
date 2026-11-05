## Context

The repo combines a working business app, an FDE learning reference, and general workstation/DevOps guidance. The user wants the first two to remain here and the third to belong to a colleague's separate project. This is an ownership and documentation pivot, not an app rewrite or resource migration.

## Decisions

### Apply a resource-specific scope test

Keep a recommendation when it explains how this Databricks App consumes a resource, runs under an identity, is configured, or is validated and operated. Delegate preparation or certification of an FDE's general workstation and delivery environment. Merely mentioning Databricks does not bring a workstation-wide installer or MCP setup script into scope.

| Area | Maintained here | External DevOps ownership |
| --- | --- | --- |
| Prerequisites | Required versions and already-prepared-workstation assumption | OS/bootstrap, package managers, installers, repair scanners |
| Local app | Locked app dependencies, existing `.env`, selected profile, personal schema, full-stack proxy | General machine/editor/agent setup and environment certification |
| Identity | App SP grants, OBO scopes, secret resources, app-specific integration permissions | General Git/GitHub identity, editor sign-in, broad identity-platform provisioning |
| Resources | App manifests, warehouses, UC bindings, Lakebase state, local/deployed differences | General cloud landing zones and infrastructure automation |
| Delivery | App build/test/validate/deploy commands and explicit target/profile; app start/stop/readiness | CI/CD platform choices, pipeline templates, runner setup, release automation |
| Evidence | App checks and observed permission limits | Certification of either project's general tooling or installer support |

Ordinary repository maintenance, source control, application tests, and the engineering handoff of an exported metric candidate remain necessary. Retiring DevOps guidance does not remove those activities or require deleting the app's proposal/export workflow.

### Retire the implementation rather than leave a competing toolkit

Remove `setup.sh` and its exclusive helper/test files. Check references before removal and preserve anything with a separate app purpose. Do not replace the checker with another workstation script or keep it as a supported legacy command. Keep `dapps-env-setup.md` as a short compatibility notice so old guide links can explain the scope change and point to the app README. `init.md` remains an app-specific entry point, not an installer.

The new entry point lists prerequisites, preserves existing `.env`, requests missing app-specific inputs, selects a profile explicitly, and follows the existing full-stack proxy/personal-schema instructions. It makes no automated workstation-readiness claim. Missing general prerequisites lead to the external ownership notice rather than installation instructions.

### Keep the reference surfaces consistent

Update the root/app READMEs and ReffySpec project context together. Preserve the app's user guide; revise `/docs/fde` and its structured source links to describe the narrowed reference purpose. Reuse the existing AppKit documentation components and stable sections; no new screen or live environment scanner is needed. Replace the `Workstation onboarding` link with an app-configuration entry point and an ownership note where useful.

Remove active recommendations for general CI/CD/environment setup from the playbook's current guidance. Keep chronological historical observations, clearly mark the superseded sections, and link to the scope decision. Preserve prior Reffy artifacts and archived changes without rewriting them. Update canonical specs through the normal archive step only after implementation is delivered.

### Make the external handoff honest and optional

The colleague's project name and URL are unknown. Use a plain statement that general FDE DevOps tooling is owned by a separate colleague-led project. Add a verified link when supplied; do not invent placeholders that look like working links or block this repo's scope correction on an external release. No copying scripts, publishing shared references, contacting the colleague, or changing their project is included.

### Preserve app behavior and operational safeguards

Retain explicit profile and target selection, secret protection, existing `.env` preservation, SP/OBO distinctions, personal Lakebase schema isolation, and separately authorized shared-app lifecycle operations. Do not alter app bindings, rotate credentials, start stopped compute, provision resources, or change the metric/proposal/Microsoft integration behavior for this pivot. Existing Databricks Apps-specific deployment requirements remain applicable.

## Migration and validation

1. Inventory active setup/DevOps references and distinguish current guidance from historical evidence.
2. Update entry points and documentation with the retained app-specific path before removing their general-tooling dependencies.
3. Remove the script and exclusive helpers/tests, then check for dangling commands, links, and installer/readiness claims.
4. Run documentation checks, app type/lint/build checks, and relevant existing content tests. Use focused assertions where they protect the scope boundary; do not recreate the retired workstation test suite.
5. Review static FDE-guide navigation on desktop/mobile. App checks do not require new live cloud mutations; record anything needing an explicitly authorized runtime separately.
6. Validate and archive this change once delivered so canonical specs reflect the new scope and the earlier archive stays intact.

## Open detail

Which colleague-owned project should the handoff link to? The missing name/URL is nonblocking; the implementation can state ownership without a link.
