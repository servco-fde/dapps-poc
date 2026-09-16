## Context
The server persists immutable proposal audit events in Lakebase. Status transitions use the event type
`status_changed` and store exact lifecycle endpoints in JSON details as `from` and `to`. The client currently ignores
those details and displays only a humanized event type.

### Problem Summary
- Reviewers can see that a status changed, but not whether the proposal moved from draft to review, back for
  changes, or onward through approval and publication.

## Goals / Non-Goals
- Goals:
  - Make each well-formed lifecycle transition immediately understandable in history.
  - Keep formatting deterministic, typed, and independently testable.
  - Preserve useful output for unknown event types and incomplete legacy details.
- Non-Goals:
  - Change audit persistence, lifecycle rules, roles, or permissions.
  - Backfill or migrate existing records; their stored details already contain the required information.
  - Redesign the proposal detail page or add new history filters.

## Decisions
- Decision: Add a pure client-side audit-event formatter and use it in the existing history list.
  - Rationale: The API contract already supplies the data, and a pure function provides a narrow test seam without
    coupling tests to the full routed page.
- Decision: Render well-formed transitions as `Status changed: <From> → <To>`.
  - Rationale: The category and exact direction are both visible in one scannable line.
- Decision: Fall back to the humanized event type if `from` or `to` is absent or not a string.
  - Rationale: Historical or unexpected data remains readable and cannot break the page.
- Decision: Deploy unchanged resource configuration to the existing development and BA targets.
  - Rationale: This is a presentation-only source update and must not alter workspace-specific bindings.

## Reffy Inputs
- hawaii-ba-app-deployment-readiness.md

## Open Questions
- None.
