# Connect a Databricks App to an Azure app registration: reusable FDE prompt

Replace the placeholders with your app, selected workspace profile, private credential source, and secret-binding names.

> Connect my existing Databricks App `<APP_NAME>` in `<DATABRICKS_PROFILE>` to an existing Azure app registration using client-secret authentication. Use the Databricks core and Apps skills and pass the selected profile explicitly.
>
> Inspect the app's configuration, resources, and secret scope/key first. Read the tenant ID, client ID, and client secret from `<CREDENTIAL_SOURCE>`, such as an existing ignored environment file, without displaying the secret or changing the source.
>
> Reuse or provision the approved secret scope `<SECRET_SCOPE>` and key `<SECRET_KEY>`. Preserve existing credentials; upload a missing secret through standard input or another approved secure mechanism, never through command-line arguments or tracked files.
>
> Bind the secret as `<APP_SECRET_RESOURCE>` with read access for the app service principal. Configure tenant/client IDs as server settings and inject the client secret through the resource reference, using the app's actual environment-variable names. Preserve existing resource bindings and update the maintained deployment configuration.
>
> Validate and deploy to the selected environment, wait for startup, and perform an authenticated read-only check of the intended service. Report credential-connection success separately from API permission limitations. Update the app documentation with the storage location and verified results, preserving other environments.
