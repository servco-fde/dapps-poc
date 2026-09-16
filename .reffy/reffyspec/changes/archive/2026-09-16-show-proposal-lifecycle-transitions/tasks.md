## 1. Plan and implementation

- [x] 1.1 Confirm that status-transition endpoints are already persisted in audit event details.
- [x] 1.2 Record the approved presentation-only scope and deployment targets.
- [x] 1.3 Add a typed formatter for explicit, humanized lifecycle transitions with a safe fallback.
- [x] 1.4 Use the formatter in the existing proposal history list.
- [x] 1.5 Add focused regression tests for transition formatting and malformed details.

## 2. Verification

- [x] 2.1 Run formatting, lint, typechecking, tests, and the production build.
- [x] 2.2 Validate the change with `reffy plan validate show-proposal-lifecycle-transitions`.
- [x] 2.3 Strictly validate the existing `hawaii-dev` and `hawaii-ba` deployment targets.

## 3. Deploy and verify

- [x] 3.1 Deploy the tested source to `hawaii-dev` using the explicit development target and profile.
- [x] 3.2 Deploy the same source to `hawaii-ba` using the explicit BA target, profile, and resource bindings.
- [x] 3.3 Confirm both apps and deployments are healthy, then manually verify a status transition is explicit in
  history.
- [x] 3.4 Stop both POC apps after verification unless continued runtime is explicitly approved.
