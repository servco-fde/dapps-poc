## Decisions
- Retain the analytic catalog layout: AppKit Select above source context, Card summaries, BarChart comparisons, LineChart trends, and Tabs for member lists/governance.
- Auto Retail remains the default. Mount only the selected example's query component, preventing inactive queries and stale results across selections.
- Use generated metadata for member lists/counts and explicit typed useMetricView calls per example. Sample Orders shows order count, revenue, unique customers, average order value, orders by market segment, and monthly revenue.
- Preserve user execution and metadata-driven formatting. State source coverage without inventing currency, freshness, or comparison periods.
- Proposal-builder defaults remain outside this catalog-only change. No schema migrations or remote mutations.

## Validation
Type generation with the selected Hawaii dev profile; typecheck, lint, unit tests, build, browser switching coverage with isolated analytics responses, and live read-only local analytics requests.
