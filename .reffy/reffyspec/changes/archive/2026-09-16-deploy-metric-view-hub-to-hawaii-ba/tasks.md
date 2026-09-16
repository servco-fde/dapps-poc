## 1. Review gate

- [x] 1.1 Capture read-only source/target workspace findings in an indexed Reffy artifact.
- [x] 1.2 Review and approve or revise the warehouse, Lakebase naming, fresh-state, admin, OBO-group, and shutdown
  decisions in this change.
- [x] 1.3 Receive explicit implementation approval before modifying application or bundle files.
- [x] 1.4 Receive separate execution approval before creating or changing Databricks resources, permissions, compute,
  or deployments.

## 2. Configure the BA deployment target

- [x] 2.1 Add a `hawaii-ba` DAB target while preserving the existing development target and bindings.
- [x] 2.2 Require explicit overrides for the approved dedicated BA SQL warehouse and BA Lakebase
  project/branch/database resource paths, with no development-value fallback.
- [x] 2.3 Keep the `sql` user API scope, resource permissions, app name, runtime environment, and server authorization
  behavior intact.
- [x] 2.4 Update deployment documentation with explicit target/profile commands, resource inventory, fresh-state
  behavior, and stop-after-use guidance.
- [x] 2.5 Add or update narrowly scoped configuration tests if needed to prevent target/resource regression.

## 3. Prepare BA resources after execution approval

- [x] 3.1 Reconfirm app-name availability, metric-view identity, warehouse inventory, and Lakebase inventory.
- [x] 3.2 Create the approved dedicated serverless SQL warehouse with the reviewed initial size, scaling, auto-stop,
  tags, and least-privilege ACL; record its returned ID.
- [x] 3.3 Create the approved dedicated Lakebase Autoscaling project and record returned project, branch, endpoint,
  and database resource names.
- [x] 3.4 Validate the BA bundle target strictly with `hawaii-ba-workspace` and inspect the resolved configuration for
  development-resource leakage.
- [x] 3.5 Confirm intended BA admins and OBO test groups have warehouse and metric-view access without granting broad
  UC access to workspace `users`.

## 4. Deploy and verify after execution approval

- [x] 4.1 Deploy `metric-view-hub` with the explicit `hawaii-ba` target and `hawaii-ba-workspace` profile, allowing the
  new service principal to create and own `metric_hub` before any local production-schema initialization.
- [x] 4.2 Verify the new app URL, service principal, `sql` scope, warehouse/Lakebase bindings, successful deployment,
  and healthy compute/app state.
- [x] 4.3 Verify `/api/me` for the approving user's session through successful proposal-page loading and role
  behavior, authorized metric-view reads, and admin-only acceptance. Record that a separate live reviewer or
  unauthorized-user session was not tested and was accepted as a limitation, with automated server tests covering
  reviewer fallback, non-escalation, and admin-only acceptance.
- [x] 4.4 Verify proposal creation, versioning, comments, transitions, audit events, and persistence across an app
  restart using disposable POC records.
- [x] 4.5 Confirm the development app resources, state, and runtime status were not changed.
- [x] 4.6 Stop the BA app after verification unless continued runtime is explicitly approved, and verify its compute
  reports `STOPPED`.

## 5. Closeout

- [x] 5.1 Record actual BA resource identifiers and verification evidence without storing credentials.
- [x] 5.2 Run relevant application checks and `reffy plan validate deploy-metric-view-hub-to-hawaii-ba`.
- [x] 5.3 Present implementation and live verification evidence for review; archive only after the user accepts the
  result and any remaining limits.
