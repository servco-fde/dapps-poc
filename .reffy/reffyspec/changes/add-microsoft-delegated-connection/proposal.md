# Change: Add Microsoft delegated connection

## Status

Planned only. No delegated Microsoft sign-in, callback, or live Graph `/me` validation exists yet. This change is a prerequisite for the connected state in `add-microsoft-profile-proof`.

## Why

The existing client secret authenticates the Azure application, not the person using Metric View Hub. The local app-only token can read a photo but receives Graph 403 for text profile lookup. The registration screenshot shows delegated `User.Read`, which can authorize Graph `/me` for a signed-in user. A Databricks-scoped user token cannot simply be passed to Microsoft Graph even though both services use Entra ID.

## What Changes

- Add a user-initiated Microsoft connection using the existing Entra app registration and a supported authorization-code library.
- Obtain a delegated Graph token with `User.Read` for the signed-in user and call `/me`, without sending the client secret or token to the browser.
- Bind the Microsoft account to the current authenticated Databricks user and reject a mismatch or browser-selected target.
- Expose a small same-origin connection status and profile/photo service for `add-microsoft-profile-proof`; allow disconnect and reconnection.
- Keep Microsoft connection optional so existing Metric View Hub features and the Hawaii BA target work without dev-only Graph configuration.

## Prerequisites and boundaries

The registration owner must add an exact Web redirect URI for local testing (proposed: `http://localhost:8001/api/microsoft/auth/callback`) and another HTTPS URI for any deployed environment. No registration edit, permission grant, or shared deployment is authorized by this proposal. Installation of MSAL Node was declined in this session; implementation should wait for approval rather than substitute hand-written OAuth code. The existing ignored `.env` and client secret must be preserved and never printed.

This change only enables read-only `User.Read` profile access. Manager requires a different permission; Teams, mail, and SharePoint require separate changes. Entra SSO may make the user interaction brief but cannot be assumed to remove every prompt.

## Impact

- New capability: `microsoft-delegated-connection`.
- Expected app areas: server authentication and Graph client, secure session state, callback/status/disconnect routes, configuration, tests, and operational documentation.
- No Lakebase migration or persisted Graph token in the initial local proof.
- Local validation uses the explicitly selected `hawaii-dev-workspace` profile and personal `metric_hub_local_roberto` schema.

## Acceptance Summary

An authenticated user can connect their own Microsoft account and the server can call Graph `/me` with a delegated `User.Read` token. Mismatched accounts, missing configuration, denied consent, expired sessions, and Graph failures produce safe states. No client request can select another user; no token or secret reaches the browser or logs. Mocked tests and a live local sign-in are both required before declaring the connection working.

## Supersedes

None. This is a dependency of `add-microsoft-profile-proof`, not a replacement for its user-facing requirements.

## Reffy References

- `azure-app-services-seed.md` - registration identity and dev-first objective.
- `azure-app-services-integration-response.md` - server-side credential handling and read-only connection proof.
- `azure-app-configs.png` - observed delegated `User.Read` and application photo permissions.
