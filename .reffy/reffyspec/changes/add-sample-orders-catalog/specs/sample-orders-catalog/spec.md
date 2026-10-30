## ADDED Requirements

### Requirement: Selectable catalog examples
The catalog SHALL offer Auto Retail and Sample Orders through a labeled keyboard-accessible selector, default to Auto Retail, and display the selected source, summary measures, charts, and measure/dimension lists together. Sample Orders SHALL bind to `hawaii_dev.testing.vw__sample_orders_test` with user execution.

#### Scenario: User selects Sample Orders
- **WHEN** the user selects Sample Orders
- **THEN** the catalog displays its source, order summaries, orders by market segment, monthly revenue, and its own measure/dimension lists
- **AND** only Sample Orders analytics requests are started for that selection

#### Scenario: User returns to Auto Retail
- **WHEN** the user switches back to Auto Retail
- **THEN** the original Auto Retail summaries, charts, source, and user execution are available
- **AND** Sample Orders results are not displayed as Auto Retail results

### Requirement: Honest catalog query states
Each example SHALL display loading, empty, and query-error states without attributing another example's results to it. Member counts SHALL come from generated metadata.

#### Scenario: Selected example is unavailable
- **WHEN** an analytics request fails or returns no rows
- **THEN** the affected panel displays a useful error or empty message
- **AND** the selector and source remain available to choose another example
