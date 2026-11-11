# Prompt recap: connect the Hawaii dev app to the Azure app registration

Recorded November 9, 2026 from the November 5 conversation and its command results. This is a historical recap and reusable prompt, not a new workspace inspection or a request to repeat provisioning. No credential values are included.

## What the user asked

The sequence began by asking where the Azure app registration's credentials were stored and whether the README was accurate. The user then selected the workspace explicitly: **“go with hawaii-dev-workspace.”**

After starting the deployed app, the user explained that `/profile` was unavailable because the deployed environment lacked the app registration connection, while the local app worked. The follow-up **“is that something you can do?”** authorized making the connection. When another UI change interrupted the work, the user explicitly asked to continue the interrupted update after that change.

These messages together supplied the scope and authorization. There was no single original prompt containing every implementation detail below.

## Reusable summary prompt

> Connect the existing `metric-view-hub` Databricks App in `hawaii-dev-workspace` to the same existing Azure app registration that works in my local app. Use the Databricks core and Apps skills and pass `--profile hawaii-dev-workspace` explicitly.
>
> Inspect the app's current resources and the configured Graph secret scope/key first. Read the existing `MICROSOFT_GRAPH_TENANT_ID`, `MICROSOFT_GRAPH_CLIENT_ID`, and `MICROSOFT_GRAPH_CLIENT_SECRET` from the ignored `metric-view-hub/.env` without printing them or changing that file. Confirm that the tenant/client IDs match the intended development configuration.
>
> Provision the missing Databricks-backed scope `metric-view-hub-dev-graph` and store the existing client secret as key `client-secret`. Pass its value privately through standard input, not a terminal argument, tracked file, or chat. If the scope/key already exists, inspect and preserve it rather than blindly overwriting it.
>
> Attach the app resource `microsoft-graph-client-secret` with `READ` permission, preserving all existing SQL warehouse and Lakebase bindings. Set the tenant/client IDs as server environment configuration and inject `MICROSOFT_GRAPH_CLIENT_SECRET` through that secret resource. Verify the app service principal's read access, deploy the updated app configuration to Hawaii dev, and wait for successful startup.
>
> Make read-only checks of the proposal API, Microsoft profile, and profile photo. Report credential-connection success separately from Graph permission limitations. Update the README with the verified storage location and results. Keep the Hawaii BA target unchanged.

## Variables and storage that were configured

| Server variable | Local source | Hawaii dev configuration |
| --- | --- | --- |
| `MICROSOFT_GRAPH_TENANT_ID` | Existing ignored app `.env` | Non-secret tenant ID in app environment configuration |
| `MICROSOFT_GRAPH_CLIENT_ID` | Existing ignored app `.env` | Non-secret client ID in app environment configuration |
| `MICROSOFT_GRAPH_CLIENT_SECRET` | Existing ignored app `.env` | Databricks scope `metric-view-hub-dev-graph`, key `client-secret`, injected through app resource `microsoft-graph-client-secret` |

Only the client secret was stored as a secret. The scope backend was **`DATABRICKS`**, not Azure Key Vault. The existing Azure registration and its Graph permissions were reused; creating the secret binding did not create a registration or grant new Graph permissions.

## Commands and configuration used

The session used Databricks CLI **1.16.1**. These commands document the successful approach; verify the installed CLI's help before reusing them. Payload/manifest files below contain references and non-secret configuration, never the secret value.

1. Inspected the deployed resources and secret metadata. The scope was initially absent and the app had only SQL warehouse and Postgres bindings:

   ```sh
   databricks apps get metric-view-hub --profile hawaii-dev-workspace --output json
   databricks secrets list-scopes --profile hawaii-dev-workspace --output json
   databricks secrets list-secrets metric-view-hub-dev-graph --profile hawaii-dev-workspace --output json
   ```

2. Created the dedicated scope and uploaded the existing local secret. A private process read `.env` and supplied the secret to `put-secret` through standard input; the value was not included in the command arguments:

   ```sh
   databricks secrets create-scope metric-view-hub-dev-graph --scope-backend-type DATABRICKS --profile hawaii-dev-workspace
   databricks secrets put-secret metric-view-hub-dev-graph client-secret --profile hawaii-dev-workspace
   ```

3. Constructed `/tmp/metric-view-hub-dev-graph-update.json` by reading the app's current resources, preserving them, and appending the Graph secret resource. The body used `{"app":{"resources":[...]},"update_mask":"resources"}`. The successful update and verification commands were:

   ```sh
   databricks apps create-update metric-view-hub --json @/tmp/metric-view-hub-dev-graph-update.json --no-wait --profile hawaii-dev-workspace --output json
   databricks apps get-update metric-view-hub --profile hawaii-dev-workspace --output json
   databricks secrets list-acls metric-view-hub-dev-graph --profile hawaii-dev-workspace --output json
   ```

   CLI lesson: with `--json`, this version accepted only the app name as a positional argument. Passing `resources` as a second positional argument failed; putting `update_mask` in the JSON succeeded. The app resource declared `secret.scope`, `secret.key`, and `secret.permission: READ`. The subsequent ACL check confirmed the app service principal had `READ`; the scope creator retained `MANAGE`.

4. Preserved the existing workspace `app.yaml` settings and added the three Graph environment entries. Tenant/client IDs used literal configuration values; the secret used `valueFrom: microsoft-graph-client-secret`. The corresponding bundle configuration already used `value_from` under the development target in `databricks.yml`.

   The assistant exported/imported the workspace manifest with `--format AUTO --file ...`, using the existing source directory returned by the app. A `RAW` export attempt had failed for this workspace file. After importing the prepared manifest, it deployed that existing workspace source:

   ```sh
   databricks apps deploy metric-view-hub --source-code-path "EXISTING_WORKSPACE_SOURCE_PATH" --mode SNAPSHOT --no-wait --profile hawaii-dev-workspace --output json
   databricks apps get-deployment metric-view-hub 01f1d957f98e108dbc5fcd3739ed4dfe --profile hawaii-dev-workspace --output json
   ```

   `EXISTING_WORKSPACE_SOURCE_PATH` is a placeholder, not a new source path to create. The original used `/Workspace/Users/roberto.delgado@servco.com/.bundle/metric-view-hub/default/files`. Runtime manifest changes were uploaded before deployment; attaching a resource alone would not set the server environment variables.

## Verified outcome and limits

The deployment succeeded. Authenticated, read-only application checks returned:

- `/api/me`: **200**.
- `/api/proposals`: **200**.
- `/api/microsoft/profile/photo`: **200**, JPEG image.
- `/api/microsoft/profile`: **403**, `permission_denied`.

Successful photo access demonstrated that the deployed app could authenticate to Graph with the configured application credential. It did not prove user-delegated Microsoft sign-in or permission to read profile text. The text-field permission issue remained; no broader directory permissions were granted by this work. The README was updated accordingly. At the user's later request, the deployed app was stopped; this artifact does not recheck its current state.

## Related repository context

- [App README: Microsoft profile proof](../../metric-view-hub/README.md#microsoft-profile-proof) — recorded storage location and observed permission limitation.
- [Development target configuration](../../metric-view-hub/databricks.yml) — environment names and resource binding.
- `azure-app-services-integration-response.md` — earlier context for reusing an existing Azure app registration.

This is app-specific resource, secret-injection, and permission guidance within the repository's narrowed Databricks Apps reference scope. Recording it does not authorize another secret upload, deployment, or remote Reffy publication.
