# show-proposal-lifecycle-transitions Specification

## Purpose
Define how proposal activity history presents lifecycle transitions and remains readable for incomplete or unknown
audit events.

## Requirements

### Requirement: Show proposal lifecycle transitions in history
The proposal history SHALL display the source and destination lifecycle stages for every well-formed
`status_changed` audit event.

#### Scenario: Reviewer reads a lifecycle transition
- **WHEN** a history event has type `status_changed` with `from` equal to `draft` and `to` equal to `in_review`
- **THEN** the history displays `Status changed: Draft → In review`

#### Scenario: Reviewer reads another known lifecycle transition
- **WHEN** a history event contains any other known proposal lifecycle stages in its `from` and `to` details
- **THEN** both stages are displayed using human-readable labels in their original transition direction

### Requirement: Preserve readable history for incomplete events
The proposal history SHALL remain readable when an event is unknown or lacks valid lifecycle-transition details.

#### Scenario: Status details are incomplete
- **WHEN** a `status_changed` event lacks a string `from` or `to` detail
- **THEN** the history displays the generic label `Status changed`
- **AND** the proposal detail page continues rendering

#### Scenario: Event type is not a lifecycle transition
- **WHEN** history contains another event type
- **THEN** the event type is displayed as a human-readable label
