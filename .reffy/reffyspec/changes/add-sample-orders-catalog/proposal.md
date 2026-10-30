# Change: Add selectable Sample Orders metric catalog example

## Why
The catalog currently only displays Auto Retail. Users need to select the existing `hawaii_dev.testing.vw__sample_orders_test` view as a second working example.

## What Changes
- Register Sample Orders with user/OBO execution and generate its metadata and types.
- Add an accessible catalog selector, preserving Auto Retail as the default.
- Switch source context, headline measures, charts, and member lists together, with loading, empty, and error states.
- Document the examples and verify switching and live local queries.

## Impact
Client catalog, metric bindings, generated metadata/types, documentation, and browser coverage. Uses the existing warehouse and local developer schema. No deployment, catalog writes, grants, or resource provisioning.

## Reffy References
No Reffy references used. Scope comes from the user request and existing implementation.
