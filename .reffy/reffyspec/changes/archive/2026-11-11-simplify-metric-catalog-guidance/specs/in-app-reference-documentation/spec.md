## MODIFIED Requirements

### Requirement: Layered reference guidance

The application SHALL keep detailed reference explanations in its documentation pages and provide concise contextual reference links on product screens. The metric catalog SHALL lead from its selector directly into the selected metric view without an introductory information box. Shared Documentation navigation and the reference marker SHALL provide paths to the user and FDE guides. Sample Orders SHALL retain a visible disclosure that its sample data is not Servco data.

#### Scenario: User selects a metric view

- **WHEN** a user selects Auto Retail or Sample Orders
- **THEN** the selected metric's hero, summaries, and charts appear without a preceding reference information box
- **AND** shared navigation still provides access to the documentation guides

#### Scenario: User selects Sample Orders

- **WHEN** Sample Orders is selected
- **THEN** its selector entry and hero badge identify the data as non-Servco sample data
- **AND** the disclosure does not depend on an introductory information box

#### Scenario: User follows a contextual cue

- **WHEN** a user activates a reference cue associated with the domain, metric view, execution identity, or proposal workflow
- **THEN** the application navigates to a stable visible section explaining that concept
- **AND** product screens do not duplicate the full guide content
