# DATA_MODEL.md — Newshelf MVP

This document defines the initial logical model. Exact SQL/Drizzle types may be refined during implementation, but semantic relationships and security invariants should remain stable unless documented.

## User
Authentication identity is managed by Supabase Auth. Application tables reference the Supabase user UUID.

## InboundAddress
Represents an address owned by a user.

Suggested fields:

```text
id                 uuid pk
user_id            uuid not null
alias              text not null unique
email              text not null unique
active             boolean not null default true
created_at         timestamptz not null
updated_at         timestamptz not null
```

Rules:
- Alias must be random/non-guessable enough to avoid exposing internal user identifiers.
- Do not derive alias directly from `user_id`.
- MVP may enforce one active inbound address per user.

## RawEmail
Represents a provider-delivered inbound message before product normalization.

Suggested fields:

```text
id                     uuid pk
user_id                uuid not null
inbound_address_id     uuid not null
provider               text not null
provider_message_id    text not null
provider_event_id      text null
from_address           text null
from_name              text null
to_address             text not null
subject                text null
raw_payload_location   text null
status                 enum/text not null
failure_reason         text null
received_at            timestamptz not null
processing_started_at  timestamptz null
processed_at           timestamptz null
created_at             timestamptz not null
updated_at             timestamptz not null
```

Status values:

```text
received
queued
processing
processed
failed
```

Constraints/indexes:
- Unique provider identity sufficient to prevent duplicate ingestion.
- Index `user_id, received_at desc`.
- Index/status support for retry/operations queries.

Do not store secrets in `failure_reason`.

## Newsletter
Represents a publication/sender grouping for a specific user in the MVP.

Suggested fields:

```text
id              uuid pk
user_id         uuid not null
name            text not null
sender_name     text null
sender_email    text null
sender_domain   text null
created_at      timestamptz not null
updated_at      timestamptz not null
```

Important: newsletter identity is imperfect. Start with deterministic, explainable sender-based grouping and design so grouping logic can improve later. Do not build a global publication graph in the MVP.

## Issue
Product representation of one readable newsletter issue.

Suggested fields:

```text
id              uuid pk
user_id         uuid not null
newsletter_id   uuid not null
raw_email_id    uuid not null unique
title           text not null
content_html    text null
content_text    text null
published_at    timestamptz null
received_at     timestamptz not null
created_at      timestamptz not null
updated_at      timestamptz not null
```

Rules:
- `content_html` must contain only sanitized output.
- Never copy raw sender HTML into this field without sanitization.
- `raw_email_id` uniqueness prevents duplicate Issues from retries.
- Preserve `content_text` for fallback rendering and search.

## IssueState
User-specific state for an Issue.

Suggested fields:

```text
user_id       uuid not null
issue_id      uuid not null
read_at       timestamptz null
saved_at      timestamptz null
archived_at   timestamptz null
created_at    timestamptz not null
updated_at    timestamptz not null

primary key (user_id, issue_id)
```

Although Issues are user-owned in the MVP, keeping state separate avoids mixing content identity with interaction state and leaves room for future model evolution.

## Relationships

```text
User
  1 -> n InboundAddress
  1 -> n RawEmail
  1 -> n Newsletter
  1 -> n Issue
  1 -> n IssueState

InboundAddress
  1 -> n RawEmail

RawEmail
  1 -> 0..1 Issue

Newsletter
  1 -> n Issue

Issue
  1 -> 0..1 IssueState
```

## Authorization invariant
For every read/write path, the authenticated user must own the requested resource directly or through a verified ownership relationship. IDs alone are never authorization.

## Deletion
MVP implementation should prefer database foreign keys and explicit cascade/restrict behavior rather than application assumptions. Account deletion/export behavior can be hardened before public release, but schema design must not make it impossible.

## Search indexes
When MVP-036 is implemented, add Postgres-native indexes for title, newsletter metadata and `content_text` as appropriate. Measure before introducing external search infrastructure.
