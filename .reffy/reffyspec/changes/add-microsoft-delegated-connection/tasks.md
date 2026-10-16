## 1. Resolve prerequisites

- [ ] 1.1 Obtain owner confirmation of the exact local Web redirect URI and later deployed HTTPS callback; do not edit the registration without separate authorization.
- [ ] 1.2 Confirm trusted Databricks principal attributes and an identity-match policy for local and deployed sessions.
- [ ] 1.3 Obtain approval for MSAL Node installation; preserve the ignored `.env` and do not implement raw OAuth as a workaround.

## 2. Implement the delegated connection

- [ ] 2.1 Add server-side authorization-code/PKCE start and callback handling with short-lived, single-use state and CSRF-safe session binding.
- [ ] 2.2 Acquire and cache a delegated Graph `User.Read` token server-side; support disconnect and safe reconnection.
- [ ] 2.3 Verify the Microsoft account matches the authenticated Databricks user, then expose selected `/me` profile fields and optional bounded photo through same-origin APIs.
- [ ] 2.4 Add safe connection/error states and server-only configuration, keeping Hawaii BA and unrelated routes independent of the dev Graph secret.
- [ ] 2.5 Document local redirect setup, secret handling, session lifetime, and the distributed-session decision required before shared deployment.

## 3. Verify

- [ ] 3.1 Test state replay/cross-session rejection, PKCE, identity mismatch, no arbitrary target, redaction, Graph mapping, photo fallback, and configuration/permission failures.
- [ ] 3.2 Run lint, typecheck, tests, build, and documented full-stack local proxy with `hawaii-dev-workspace` and `metric_hub_local_roberto`; confirm `/api/proposals`.
- [ ] 3.3 After redirect registration, perform a live user-delegated `/me` and photo check and a second-account isolation check. App-only photo access does not satisfy this task.
- [ ] 3.4 Validate dev and Hawaii BA configuration boundaries and obtain explicit authorization before shared deployment.
- [ ] 3.5 Validate this ReffySpec change after implementation and keep its status aligned with observed results.
