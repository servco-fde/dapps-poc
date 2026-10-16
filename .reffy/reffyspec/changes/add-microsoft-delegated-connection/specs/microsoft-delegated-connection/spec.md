## ADDED Requirements

### Requirement: Establish a user-delegated Microsoft connection

Metric View Hub SHALL initiate a user-directed Microsoft authorization flow for delegated Graph `User.Read` using the configured app registration. It SHALL use a registered redirect URI and a supported server-side authorization library. A client secret or Databricks-scoped token alone SHALL NOT be treated as a delegated Graph connection.

#### Scenario: Authenticated user starts connection

- **WHEN** an authenticated Metric View Hub user chooses `Connect Microsoft`
- **THEN** the app starts a user-specific Microsoft authorization transaction
- **AND** requests delegated `User.Read` without exposing the client secret to the browser

#### Scenario: Connection configuration is missing

- **WHEN** the Microsoft registration or redirect configuration is absent
- **THEN** connection is reported unavailable
- **AND** existing Metric View Hub features remain usable

### Requirement: Bind the connection to the correct user

The server SHALL validate callback state, PKCE, transaction expiry, and the initiating Databricks session. It SHALL accept a Microsoft account only when it can reliably match the authenticated Databricks user. It SHALL NOT use a client-supplied Graph target or fall back to an application-token lookup of another user.

#### Scenario: Callback belongs to another session or account

- **WHEN** callback state is reused, belongs to a different session, or returns an account that cannot be matched reliably
- **THEN** the connection is rejected without exposing that account's profile

### Requirement: Keep Microsoft credentials and tokens server-side

The client secret, delegated access/refresh tokens, and authorization code SHALL remain server-side and SHALL NOT be logged, persisted in Lakebase, or returned in browser JSON. Connection state SHALL be partitioned by authenticated user and removable through disconnect.

#### Scenario: User disconnects

- **WHEN** a connected user disconnects Microsoft
- **THEN** their local connection and cached token state are removed
- **AND** another user's connection is unaffected

### Requirement: Serve only the connected user's Graph profile

After a verified connection, the server SHALL call delegated Graph `/me` for selected profile fields and MAY proxy the current user's photo through a bounded same-origin response. It SHALL map Graph permission, session, and transient failures to sanitized states.

#### Scenario: Verified connection loads profile

- **WHEN** the connected user requests their profile
- **THEN** the server uses that user's delegated token for Graph `/me`
- **AND** returns only selected display fields without allowing a target user parameter

#### Scenario: Photo is unavailable

- **WHEN** Graph returns no readable photo
- **THEN** the profile fields remain available
- **AND** the photo service reports absence without leaking a token or raw Graph response

### Requirement: Preserve development and BA isolation

The development registration's secret and redirect configuration SHALL be optional for app startup and SHALL NOT be required by the Hawaii BA target. A live delegated Graph call SHALL be required before describing the connection as proven.

#### Scenario: BA target has no Microsoft configuration

- **WHEN** the Hawaii BA app runs without the dev registration binding
- **THEN** its existing routes remain usable
- **AND** Microsoft connection is reported unavailable
