# Change: Show proposal lifecycle transitions in history

## Status

Implementation and deployment to both `hawaii-dev` and `hawaii-ba` were explicitly approved by the user on
2026-09-15. The tested source was deployed successfully in both workspaces. The user confirmed the rendered
transition on 2026-09-15, and both POC app computes were then stopped.

- `hawaii-dev` deployment: `01f1b16785d016cba2d7a25210a10e16`
- `hawaii-ba` deployment: `01f1b167be5512219cdf89b1fb7bae2e`

## Why
The proposal history currently renders the audit event type `status_changed` without showing the lifecycle stages
already stored in that event's `details.from` and `details.to` fields. Reviewers therefore cannot tell which
transition occurred without inferring it from surrounding activity.

## What Changes
- Render a status-change history entry as an explicit transition, such as
  `Status changed: Draft → In review`.
- Humanize all known proposal lifecycle stage identifiers.
- Preserve a readable generic event label when a legacy or malformed status event lacks either endpoint.
- Add focused formatter tests and deploy the same tested source to the existing `hawaii-dev` and `hawaii-ba`
  Databricks Apps.

## Impact
- Affected specs: `show-proposal-lifecycle-transitions`
- Affected code: proposal-history presentation and its focused unit tests.
- No API, database schema, persisted audit-event shape, resource binding, or access-control change.

## Supersedes
_Optional. If this change reverses or replaces the direction of a prior change (a pivot, deprecation, or wind-down), name the prior change-id(s) here, e.g. `- add-old-direction`. Leave as "None" otherwise. The spec delta remains the authoritative record of what changed; this is a navigational pointer._
None

## Reffy References
- `hawaii-ba-app-deployment-readiness.md` - deployment and verification context in which the history-display gap
  was observed.
