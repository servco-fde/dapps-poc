# Azure App Services Integration Response

## Understanding

The Azure app registration `servco-adb-app-workshop-appreg-dev` has already been configured with the intended level of access to specific Azure services. Databricks and Azure use the same Microsoft Entra tenant, so this should be treated as a straightforward application connection rather than a new permissions-design exercise.

The goal is to connect Metric View Hub to that existing registration, test its approved services in the development environment, and then decide which capabilities belong in the app.

## The one remaining identity detail

Sharing an Entra tenant removes cross-tenant complexity, but the Databricks App still needs to authenticate as the registered Azure application. The implementation needs to use whichever method was configured for it:

- client secret;
- certificate; or
- federated credential.

The colleague who created the registration should be able to identify that method and provide the appropriate secure handoff or configuration instructions. The client ID and tenant ID can be normal configuration; secrets, private keys, and access tokens must remain outside source control and browser responses.

## Proposed integration

1. Confirm the registration's configured authentication method and the Azure services or resource endpoints that are ready to test.
2. Add the tenant ID, client ID, and service configuration to the Metric View Hub server environment.
3. Make the existing credential or federation available to the server through the approved secure mechanism.
4. Acquire an Entra access token for each target service from the server.
5. Add a small server-side connection test for each approved service, beginning with harmless read operations.
6. Run the complete app locally with Roberto's explicit Databricks development profile and `metric_hub_local_roberto` schema.
7. Confirm successful service responses without exposing credentials or tokens.
8. After local validation, separately approve deployment to the shared Databricks development app and repeat the connection tests there.

Azure access should remain server-side. The React client can display service status or returned business data, but it should not receive the Azure application's credentials or raw bearer tokens.

## Definition of success

- Metric View Hub authenticates using the existing Azure app registration.
- The app can call the Azure services already assigned to that registration.
- Initial tests are read-only and run against development resources.
- Authentication failures are clear enough to diagnose without leaking sensitive details.
- Existing metric queries and proposal storage continue to work.
- Local testing remains isolated in `metric_hub_local_roberto`.
- No credential or access token is committed, logged, persisted in Lakebase, or returned to the browser.

## Immediate next step

Ask the registration owner for only these operational details:

1. Which authentication method was configured, and how should the Databricks App receive or use it?
2. Which Azure service endpoints or resources should be used for the first connection tests?

Once those details are available, the implementation can proceed directly without redesigning permissions or identity architecture.

## Source context

- `azure-app-services-seed.md` - provides the existing Azure app registration and dev-first objective.
- `metric-view-hub-database-architecture-brief.md` - establishes the local and deployed development boundaries.
- `metric-view-hub/README.md` - documents the explicit Databricks dev profile and local schema isolation.
