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

The database structure is intentionally designed with future scalability in mind.

### Main Tables

#### 1. Pipeline
Stores the main pipeline configuration.

- `id`
- `name`
- `processing_action_type`
- timestamps

#### 2. Source
Represents the webhook source for a pipeline.

- unique token
- `is_active`
- linked to pipeline
- separated from pipeline to support future multi-source expansion

#### 3. Event
Stores each incoming webhook payload before processing.

#### 4. Job
Tracks asynchronous processing state.

- status
- attempts
- timestamps

#### 5. Subscriber
Stores subscriber destination URLs.

#### 6. Pipeline_Subscribers
Join table for the many-to-many relationship between pipelines and subscribers.

#### 7. Delivery
Tracks delivery attempts for each subscriber.

- status
- retries
- response code
- timestamps

---

## Design Decisions

### 1. Source is separated from Pipeline
Although the current implementation may use one source per pipeline, this separation allows the system to support multiple webhook sources per pipeline in the future.

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

1. A webhook request is received
2. The payload is stored as an **event**
3. A **job** is created and pushed to the queue
4. The worker picks up the job
5. The selected processing action transforms the payload
6. The processed result is delivered to all active subscribers
7. Delivery results are stored in the database

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

Features:
- detects high-value transactions
- classifies severity levels
- generates alert messages
- appends audit metadata

---

#### 2. Post Notification
Used for post-style payloads.

Features:
- validates required fields
- builds a readable message
- adds audit information

---

#### 3. Sanitize
Used for sensitive payloads that may contain private user information.

Features:
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
