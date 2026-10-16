# Design: Microsoft delegated connection

## Proposed authentication flow

The current Databricks session remains the primary Metric View Hub sign-in. A separate `Connect Microsoft` action starts a top-level browser redirect to the tenant-specific Microsoft authorization endpoint. The server uses a supported confidential-client library (MSAL Node), authorization code with PKCE, delegated `User.Read`, a one-time state value, and a server-side callback. Microsoft redirects only to an exact registered Web URI. The server redeems the code using its server-only client secret and retains tokens server-side. It then calls Graph `/v1.0/me`, not `/users/{email}` with an app-only token. Microsoft documents this [authorization-code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow) and [delegated `/me` permission](https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0).

The callback validates the transaction's state, PKCE verifier, expiry, single-use property, and binding to the initiating Databricks user/browser session before accepting a connection. It then verifies that the Microsoft account is the intended Databricks user. Prefer a stable shared Entra identifier if the trusted Databricks identity supplies one; otherwise require a reviewed same-tenant email/UPN matching rule and fail closed on ambiguity. `LOCAL_DEV_EMAIL` is a local stand-in only and cannot prove production identity binding. Do not use an app-only `/users/{email}` fallback after a delegated failure.

## Token and API boundary

The browser sees an opaque, `HttpOnly`, `SameSite=Lax` connection cookie, `Secure` on HTTPS, but no Graph access/refresh token, client secret, authorization code after callback, or raw Graph response. Rotate the cookie on connection; protect start/disconnect against CSRF and open redirects. Use a short-lived, single-use authorization transaction and server-side per-user token cache. A local single-process in-memory cache is acceptable for the first proof, with reconnection after restart. Before shared deployment, decide how to secure and partition session/cache state across instances. Disconnect removes local connection state and cached tokens. Do not write Graph tokens or profile fields to Lakebase or logs.

The profile service exposes only selected `/me` fields and a bounded same-origin `/me/photo/$value` proxy. It verifies the Databricks-to-Microsoft binding on every request and accepts no browser-supplied target email, user ID, or Graph path. Missing photo is nonfatal. Missing configuration, not connected, identity mismatch, consent/permission failure, expired session, throttling, and network error map to distinct sanitized states. A token-expiry path may attempt silent renewal, then require reconnection.

## Configuration and deployment gate

Keep `MICROSOFT_GRAPH_TENANT_ID`, `MICROSOFT_GRAPH_CLIENT_ID`, `MICROSOFT_GRAPH_CLIENT_SECRET`, and `MICROSOFT_GRAPH_REDIRECT_URI` server-only. Preserve the existing ignored `.env`. The registration owner must add `http://localhost:8001/api/microsoft/auth/callback` as a Web redirect URI for the documented local full-stack proxy; a shared dev deployment needs its exact HTTPS callback and approved secret binding. The Hawaii BA target must remain healthy without this dev registration. No registration change or deployment occurs as part of planning.

MSAL Node installation was declined during the planning session. Do not bypass that decision with a hand-written token exchange. Microsoft recommends a supported authentication library rather than manually issuing protocol requests. The implementation begins only after dependency approval and redirect URI ownership are resolved.

## Verification and open decisions

Tests should cover replay/cross-session state rejection, PKCE, cookie properties, identity mismatch, no arbitrary target, token redaction, `/me` mapping, optional photo, and all error states. Live local validation requires the exact registered redirect URI, selected Databricks profile, personal Lakebase schema, successful Microsoft sign-in, a real `/me` response, and a mismatched-account attempt. Verify existing `/api/proposals` remains usable.

Before implementation, confirm (1) which trusted Databricks principal attributes are available in local and deployed requests, (2) whether the registration owner will register local and deployed Web callbacks, and (3) the session/cache mechanism acceptable for a shared multi-instance deployment. These decisions do not broaden the first proof beyond `User.Read`.
