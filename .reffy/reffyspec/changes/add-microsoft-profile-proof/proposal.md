# Change: Add a Microsoft profile connection proof

## Status

The current app-only prototype and photo were previewed locally, but text-profile lookup returned Graph 403. This change is being narrowed to the profile experience and the high-level `Connect Microsoft` action. Neither delegated sign-in nor a working `/me` profile has been implemented or validated. The app has not been deployed.

## Why

People using Metric View Hub should be able to see their own Microsoft profile. The existing client-secret connection proves the app registration can be reached and can read a photo, but an application token does not identify the signed-in person. The registration's delegated `User.Read` permission is the right basis for a personal profile; the deeper authentication work belongs in `add-microsoft-delegated-connection`.

## What Changes

- Keep a `My Microsoft profile` destination in desktop and mobile navigation.
- When the user has not connected Microsoft, explain the benefit and offer a clear `Connect Microsoft` action. That action uses the separate delegated-connection capability when available; it must not imply an app-only photo is a connected account.
- Once the connection capability confirms the user's identity, show their available display name, job title, department, employee ID, office location, and optional photo.
- Show useful unavailable, not-connected, mismatch, missing-field, no-photo, and temporary-error states. Preserve responsive photo spacing and accessible labels.
- Keep the page from exposing credentials, tokens, or another person's profile. Existing metric and proposal features remain usable when Microsoft is not connected.

## Scope and dependency

This change specifies the product-facing profile experience, not Microsoft authorization-code mechanics, callback registration, token storage, or identity binding. Those are owned by `add-microsoft-delegated-connection`. The profile page can be finished and live-validated only after that capability is available. Manager, Teams, mail, and SharePoint remain out of scope.

## Impact

- New capability: `microsoft-profile-proof`.
- Expected app areas: profile page, navigation, display contract, API integration, UI tests, and documentation.
- No Lakebase schema change or shared deployment is authorized by this proposal.
- Local work continues with `hawaii-dev-workspace` and the personal `metric_hub_local_roberto` schema; Hawaii BA must not depend on dev-only Graph configuration.

## Acceptance Summary

A user can find the profile page, understand whether Microsoft is connected, and use `Connect Microsoft` when the separate connection capability is configured. A successfully connected user sees only their own available profile information and optional photo. Missing or failed connection states are honest and do not break the rest of the app. A live delegated `/me` check—not an app-only photo—is required to call the feature connected.

## Supersedes

None. This revises the same active, unshipped profile change.

## Reffy References

- `azure-app-services-seed.md` - registration and dev-first goal.
- `azure-app-services-integration-response.md` - server-side credential boundary.
- `azure-app-configs.png` - distinction between delegated `User.Read` and application photo permission.
