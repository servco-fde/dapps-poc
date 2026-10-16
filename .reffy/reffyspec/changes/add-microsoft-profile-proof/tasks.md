## 1. Profile experience

- [x] 1.1 Add the initial `My Microsoft profile` route, navigation entry, profile card, and optional-photo layout.
- [x] 1.2 Record local app-only photo success and text-profile 403 as historical evidence, not completion of the personal profile.
- [ ] 1.3 Add a clear `Connect Microsoft` action and not-connected/unavailable states, using the separate connection capability when available.
- [ ] 1.4 Replace the app-only text lookup with the connected user's delegated profile service after `add-microsoft-delegated-connection` is delivered.
- [ ] 1.5 Show verified profile fields, missing-field placeholders, optional photo, account-mismatch and temporary-error states without leaking tokens or raw errors.

## 2. Verify

- [ ] 2.1 Test the user journey, responsive photo spacing, no arbitrary target, and all display states.
- [ ] 2.2 Run lint, typecheck, unit tests, build, and full-stack local preview with the selected Databricks profile and personal Lakebase schema; verify `/api/proposals` remains usable.
- [ ] 2.3 After the connection change is available, validate live delegated `/me`, optional photo, and second-account isolation. Do not count app-only photo access as this check.
- [ ] 2.4 Validate dev and Hawaii BA configuration boundaries before any authorized shared deployment.
- [x] 2.5 Validate this revised ReffySpec change.
