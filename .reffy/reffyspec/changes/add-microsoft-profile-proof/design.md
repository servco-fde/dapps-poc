# Design: Microsoft profile experience

## User journey

The `My Microsoft profile` page first shows whether the current user has connected Microsoft. If not, it offers `Connect Microsoft` and briefly explains that connecting allows their own profile to appear. The action enters the flow owned by `add-microsoft-delegated-connection`; this change does not prescribe how that flow authenticates or stores tokens.

After that capability reports a verified connection for the current Databricks user, the page displays the user's name, job title, department, employee ID, office location, and optional photo. Missing text values display `Not provided`; missing photos use a neutral placeholder. The layout retains readable spacing around the photo on desktop and narrow screens. No client-supplied email, user ID, or Graph path selects a profile.

The page distinguishes `not connected`, `connection unavailable`, `account mismatch`, `profile temporarily unavailable`, and `connected`. A temporary error offers retry. Before the connection capability exists, the page must not present app-only photo access as proof that the user is connected.

## Boundaries and dependency

Databricks remains the app's primary sign-in. The Microsoft connection is optional and only for Microsoft profile data in this change. The browser receives display fields and bounded image bytes, never a client secret, Graph token, or raw Graph error. No profile data is persisted to Lakebase. When Graph configuration is absent, unrelated routes remain healthy; the Hawaii BA target does not require a dev secret.

`add-microsoft-delegated-connection` owns the authorization model, identity match, callback URI, token lifecycle, secure session handling, and validation of `/me`. This profile change consumes its connected/not-connected result and profile/photo service. Teams, mail, SharePoint, and manager are separate future features.

## Verification and current evidence

UI tests should cover the connect action and every display state, missing fields/photo, photo spacing, keyboard access, and no browser-chosen target. Integration validation must use a live delegated `/me` call after the dependency is delivered, plus a second-account isolation check.

On 2026-10-15, the existing app-only prototype loaded `/profile` and `/api/proposals` locally using `hawaii-dev-workspace` and `metric_hub_local_roberto`. Its photo endpoint returned 200, while `/users/{email}` text lookup returned 403 because the app token only had `ProfilePhoto.Read.All`. Mocked UI tests passed, but this is not proof of delegated profile access. The shared dev app has not been deployed.
