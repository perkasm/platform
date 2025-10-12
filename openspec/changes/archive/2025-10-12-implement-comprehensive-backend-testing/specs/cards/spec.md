## ADDED Requirements

### Requirement: Cards API Testing
The credit cards API endpoints SHALL have comprehensive test coverage for all CRUD operations and business logic.

#### Scenario: Create card success testing
- **GIVEN** an authenticated user and valid card data
- **WHEN** a POST request is made to `/api/v1/cards/`
- **THEN** the endpoint SHALL create a new credit card
- **AND** return the created card data with generated ID
- **AND** the card SHALL be associated with the authenticated user

#### Scenario: Create card validation failure testing
- **GIVEN** invalid card data (missing required fields)
- **WHEN** a POST request is made to `/api/v1/cards/`
- **THEN** the endpoint SHALL return HTTP 400 status
- **AND** the response SHALL contain validation error details

#### Scenario: Get user cards testing
- **GIVEN** an authenticated user with multiple cards
- **WHEN** a GET request is made to `/api/v1/cards/`
- **THEN** the endpoint SHALL return all user's active cards
- **AND** the response SHALL include card details and metadata

#### Scenario: Get user cards with inactive filter testing
- **GIVEN** an authenticated user with active and inactive cards
- **WHEN** a GET request is made to `/api/v1/cards/?active_only=false`
- **THEN** the endpoint SHALL return all cards including inactive ones

#### Scenario: Get specific card testing
- **GIVEN** an authenticated user with a specific card
- **WHEN** a GET request is made to `/api/v1/cards/{card_id}`
- **THEN** the endpoint SHALL return the card details
- **AND** the response SHALL match the CreditCardResponse schema

#### Scenario: Get other user's card testing
- **GIVEN** a user attempts to access another user's card
- **WHEN** a GET request is made to `/api/v1/cards/{other_card_id}`
- **THEN** the endpoint SHALL return HTTP 404 status
- **AND** the response SHALL contain "Card not found" message

#### Scenario: Update card success testing
- **GIVEN** an authenticated user with a card and valid update data
- **WHEN** a PUT request is made to `/api/v1/cards/{card_id}`
- **THEN** the endpoint SHALL update the card data
- **AND** return the updated card information

#### Scenario: Update non-existent card testing
- **GIVEN** a card ID that doesn't exist
- **WHEN** a PUT request is made to `/api/v1/cards/{card_id}`
- **THEN** the endpoint SHALL return HTTP 404 status
- **AND** the response SHALL contain "Card not found" message

#### Scenario: Delete card testing
- **GIVEN** an authenticated user with a card
- **WHEN** a DELETE request is made to `/api/v1/cards/{card_id}`
- **THEN** the endpoint SHALL deactivate the card
- **AND** return HTTP 204 status
- **AND** subsequent GET requests SHALL not return the card

## ADDED Requirements

### Requirement: CreditCard Service Testing
The CreditCardService business logic SHALL be thoroughly tested for all operations.

#### Scenario: Card creation service testing
- **GIVEN** valid card data and user ID
- **WHEN** create_card is called
- **THEN** a card SHALL be created in the database
- **AND** the card SHALL be associated with the user
- **AND** the card object SHALL be returned

#### Scenario: Card retrieval service testing
- **GIVEN** a card exists with known ID and user ID
- **WHEN** get_card is called
- **THEN** the card object SHALL be returned
- **AND** access SHALL be verified for the correct user

#### Scenario: Card update service testing
- **GIVEN** a card exists and update data
- **WHEN** update_card is called
- **THEN** the card SHALL be updated in the database
- **AND** the updated card object SHALL be returned

#### Scenario: Card deletion service testing
- **GIVEN** a card exists
- **WHEN** delete_card is called
- **THEN** the card SHALL be marked as inactive
- **AND** the operation SHALL return success status</content>
<parameter name="filePath">/Users/mlim/Projects/perkasm/platform/openspec/changes/implement-comprehensive-backend-testing/specs/cards/spec.md