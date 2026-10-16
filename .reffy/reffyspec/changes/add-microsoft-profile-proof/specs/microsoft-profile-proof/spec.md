## ADDED Requirements

### Requirement: Offer a Microsoft connection from the profile page

Metric View Hub SHALL offer an explicit `Connect Microsoft` action to an authenticated user who has not connected their Microsoft account. The action SHALL start the separate delegated-connection capability when it is available. This profile feature SHALL NOT claim a connection merely because an application credential can read a photo.

#### Scenario: User is not connected

- **WHEN** an authenticated user opens `My Microsoft profile` without a Microsoft connection
- **THEN** the page explains that Microsoft profile access needs a connection
- **AND** offers `Connect Microsoft` when the connection capability is configured

#### Scenario: Connection capability is unavailable

- **WHEN** the delegated-connection capability is not configured
- **THEN** the page shows a safe unavailable state
- **AND** other Metric View Hub features remain usable

### Requirement: Show the connected user's available profile

After the separate delegated-connection capability confirms the signed-in Microsoft account belongs to the current Databricks user, the profile page SHALL show that user's available display name, job title, department, employee ID, and office location. Missing values SHALL display `Not provided`. The page SHALL NOT offer a browser-controlled target user selector.

#### Scenario: Profile has available and missing values

- **WHEN** a connected user's profile contains some requested fields but not others
- **THEN** the page displays available values with clear labels
- **AND** shows `Not provided` for missing values

### Requirement: Treat profile photo as optional

The page SHALL show the connected user's photo when available through the delegated connection. Missing or inaccessible photos SHALL display a neutral placeholder without blanking the text profile. The photo layout SHALL remain spaced and readable on narrow screens.

#### Scenario: Photo is unavailable

- **WHEN** the connected user has no readable photo
- **THEN** the page displays a placeholder
- **AND** retains any available text fields

### Requirement: Distinguish connection and profile failures

The page SHALL distinguish not-connected, connection-unavailable, account-mismatch, and temporary profile-load failures. It SHALL offer retry for a temporary failure without exposing credentials, tokens, or raw upstream responses.

#### Scenario: Profile request fails temporarily

- **WHEN** a connected user's profile cannot be loaded because of a temporary upstream error
- **THEN** the page shows a safe error and retry action
- **AND** unrelated Metric View Hub routes remain usable
