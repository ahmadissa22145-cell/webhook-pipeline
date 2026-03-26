# Webhook-Driven Task Processing Pipeline

## Overview

This project is a backend service that receives webhooks, processes them asynchronously through a job queue, and delivers the processed results to registered subscribers.

It follows a simple flow similar to a lightweight automation platform:

**Webhook → Processing → Delivery**

The system is designed to be modular, scalable, and easy to extend with new processing behaviors.

---

## Tech Stack

- **TypeScript**
- **Node.js + Express**
- **PostgreSQL**
- **Drizzle ORM**
- **Redis + BullMQ**
- **Docker & Docker Compose**
- **GitHub Actions (CI/CD)**

---

## Core Architecture

The system revolves around the concept of a **pipeline**.

Each pipeline is responsible for connecting three parts:

1. **Source**
   - A unique webhook endpoint identified by a token
   - Used to receive incoming payloads

2. **Processing Action**
   - Defines how the incoming payload should be transformed
   - Applied before the result is delivered

3. **Subscribers**
   - External endpoints that receive the processed output

---

## Database Design

The database is structured around the full lifecycle of a webhook event:
receiving the payload, storing it, processing it asynchronously, and delivering the result to subscribers.

### Main Tables

#### 1. `pipelines`

Stores the main pipeline configuration.

**Fields**

- `id`
- `name`
- `processing_action_type`
- `created_at`
- `updated_at`
- `deleted_at`

**Purpose**

- Represents the main processing pipeline
- Determines which processing action will be applied
- ***

#### 2. `sources`

Represents the webhook source attached to a pipeline.

**Fields**

- `id`
- `pipeline_id`
- `token`
- `is_active`
- `created_at`
- `updated_at`
- `deleted_at`

**Purpose**

- Holds the unique webhook token used to receive requests
- Allows enabling/disabling the webhook source
- Is separated from `pipelines` to support future expansion such as multiple sources per pipeline

---

#### 3. `events`

Stores every incoming webhook payload before processing.

**Common responsibility**

- Keeps the raw payload received from the external system
- Links the incoming request to the pipeline that received it
- Serves as the source record for later job processing

**Purpose**

- Preserves original webhook data
- Makes the system auditable and debuggable
- Ensures processing can happen asynchronously after the request is accepted

---

#### 4. `jobs`

Tracks asynchronous processing work.

**Known fields**

- `id`
- `event_id`
- `status`
- `attempts`
- timestamps

**Purpose**

- Represents a processing task in the queue
- Tracks whether the task is pending, processing, retrying, completed, or failed
- Stores retry attempts for background worker execution

---

#### 5. `subscribers`

Stores subscriber endpoints that will receive processed results.

**Fields**

- `id`
- `url`
- `created_at`
- `updated_at`
- `deleted_at`

**Purpose**

- Represents an external destination endpoint
- Can be linked to one or more pipelines
- Uses soft delete instead of hard delete

---

#### 6. `pipeline_subscribers`

Join table between pipelines and subscribers.

**Known fields**

- `id`
- `pipeline_id`
- `subscriber_id`
- `created_at`
- `unsubscribed_at`

**Purpose**

- Supports the many-to-many relationship between pipelines and subscribers
- Allows a subscriber to subscribe to multiple pipelines
- Allows a pipeline to have multiple subscribers
- Uses `unsubscribed_at` instead of hard deletion to preserve subscription history

---

#### 7. `deliveries`

Tracks delivery attempts for each subscriber separately.

**Known responsibility**

- Stores the delivery status for each subscriber
- Tracks retry attempts
- Can store delivery response information for inspection

**Purpose**

- Makes delivery failures observable
- Allows retries without losing history
- Improves debugging and reliability

---

## Database Triggers

The database includes triggers to automate important behaviors and keep related data consistent.

### 1. Auto-create source after pipeline creation

When a new pipeline is inserted, a source is created automatically for it.

#### Trigger

- `after_pipeline_insert`

#### Function

- `create_source_after_pipeline()`

#### Behavior

- Runs **AFTER INSERT** on `pipelines`
- Automatically inserts a new row into `sources`
- The inserted source is linked using:
  - `pipeline_id = NEW.id`

#### Why this exists

- Ensures every pipeline immediately has a source
- Prevents missing webhook source records
- Reduces manual setup logic in the application layer

---

### 2. Soft delete subscriber and unsubscribe related subscriptions

When a subscriber is deleted, it is not physically removed from the database.

#### Trigger

- `before_delete_subscriber`

#### Function

- `soft_delete_subscriber()`

#### Behavior

- Runs **BEFORE DELETE** on `subscribers`
- Updates the subscriber row:
  - sets `deleted_at = NOW()`
- Updates all active related rows in `pipeline_subscribers`:
  - sets `unsubscribed_at = NOW()`
- Cancels the physical delete by returning `NULL`

#### Why this exists

- Preserves subscriber history
- Prevents losing linked subscription data
- Keeps the system auditable
- Ensures active subscriptions are cleanly closed when a subscriber is removed

---

### 3. Soft delete pipeline and deactivate related records

When a pipeline is deleted, it is also soft deleted instead of being physically removed.

#### Trigger

- `before_delete_pipeline`

#### Function

- `soft_delete_pipeline()`

#### Behavior

- Runs **BEFORE DELETE** on `pipelines`
- Updates the pipeline row:
  - sets `deleted_at = NOW()`
- Updates all related active `sources` rows:
  - sets `deleted_at = NOW()`
  - sets `is_active = false`
- Updates all active related rows in `pipeline_subscribers`:
  - sets `unsubscribed_at = NOW()`
- Cancels the physical delete by returning `NULL`

#### Why this exists

- Preserves pipeline history
- Automatically deactivates its webhook source
- Automatically closes all active subscriptions linked to that pipeline
- Prevents orphaned records and inconsistent state

---

## Design Decisions

### 1. Source is separated from Pipeline

Although the current implementation creates one source per pipeline, this separation allows the system to support multiple webhook sources per pipeline in the future.

It also keeps source-specific behavior isolated, such as:

- token management
- activation/deactivation
- future source-level settings

---

### 2. Processing actions are stored as numeric values

Processing actions are stored as numbers instead of strings.

This was chosen to support:

- enum-based logic in the current implementation
- possible **bit flag combinations** in the future

That means a single pipeline could eventually apply multiple actions together, such as:

- filtering + masking
- masking + notification
- alerting + filtering

---

### 3. Asynchronous processing

Webhook requests are accepted quickly and stored first.

The heavy work is handled later through a background worker using **BullMQ**.

This improves:

- responsiveness
- reliability
- scalability under load

---

### 4. Delivery tracking and retry support

Each subscriber delivery is tracked independently.

Failed deliveries can be retried, and their status is stored for later inspection.

This makes the system more reliable and easier to debug.

---

## Processing Workflow

1. A webhook request is received through a source token
2. The payload is stored as an `event`
3. A `job` is created and pushed to the queue
4. The worker picks up the job
5. The selected processing action transforms the payload
6. The processed result is delivered to all active subscribers of that pipeline
7. Delivery results are stored for each subscriber separately

---

## Processing Actions

Processing actions define how incoming payloads are transformed before being sent to subscribers.

Each action is implemented as a separate function and selected using the pipeline's `processing_action_type`.

This approach makes it easy to:

- add new actions
- keep logic modular
- extend the system later

### Current Processing Actions

#### 1. High Value Alert

Used for transaction-like payloads.

**Features**

- detects high-value transactions
- classifies severity levels
- generates alert messages
- appends audit metadata

---

#### 2. Post Notification

Used for post-style payloads.

**Features**

- validates required fields
- builds a readable message
- adds audit information

---

#### 3. Sanitize

Used for sensitive payloads that may contain private user information.

**Features**

- masks card numbers
- masks emails
- can normalize strings
- filters invalid payloads
- returns clean output with audit metadata

This action is useful for scenarios where data should be shared safely with subscribers without exposing sensitive information.

---

## Scalability Notes

Even though the current implementation is intentionally simple, the architecture was designed with expansion in mind.

Examples of future improvements:

- multiple sources per pipeline
- multiple combined processing actions
- advanced filtering rules
- subscriber-specific delivery rules
- dead-letter queue handling
- rate limiting and delivery throttling

---

## Setup

```bash
docker compose up --build
```
