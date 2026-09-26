# DATA_MODEL.md — Newshelf MVP

This document describes the PostgreSQL schema introduced by MVP-005. Supabase owns authentication infrastructure; Newshelf owns the five tables in the `public` schema described below.

## Conventions

- Primary keys use PostgreSQL-generated UUIDs.
- Timestamps use `timestamptz`.
- Every user-owned row includes `user_id` referencing `auth.users(id)` with `ON DELETE CASCADE`.
- Every Newshelf table has Row Level Security enabled. No policies exist yet, so Data API access remains denied until a later issue deliberately adds policies for authenticated data access.
- Cross-table relationships include `user_id` in composite foreign keys wherever ownership could otherwise cross users.
- `updated_at` defaults to `now()` and is maintained by application writes; no update triggers are installed.

## Supabase User

Supabase Auth owns `auth.users`. Drizzle declares only the `id` column needed as a foreign-key target. Newshelf migrations must never create, alter, or drop this table.

## `inbound_addresses`

Represents an inbound address owned by a user.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key, defaults to `gen_random_uuid()` |
| `user_id` | `uuid` | Not null, references `auth.users(id)` with cascade delete |
| `alias` | `text` | Not null, globally unique |
| `email` | `text` | Not null, globally unique |
| `active` | `boolean` | Not null, defaults to `true` |
| `created_at` | `timestamptz` | Not null, defaults to `now()` |

Indexes and constraints:

- Index on `user_id`.
- Unique `(user_id, id)` target for ownership-preserving foreign keys.
- No one-address-per-user constraint; lifecycle rules remain application concerns.

## `raw_emails`

Preserves a recoverable provider delivery before product normalization.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key, defaults to `gen_random_uuid()` |
| `user_id` | `uuid` | Not null, references `auth.users(id)` with cascade delete |
| `inbound_address_id` | `uuid` | Not null |
| `provider` | `text` | Not null |
| `provider_message_id` | `text` | Not null |
| `from_address` | `text` | Not null |
| `to_address` | `text` | Not null |
| `subject` | `text` | Nullable |
| `raw_payload_location` | `text` | Nullable; must not be a public URL |
| `status` | `text` | Not null, defaults to `received` |
| `failure_reason` | `text` | Nullable; must not contain secrets |
| `received_at` | `timestamptz` | Not null |
| `processed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Not null, defaults to `now()` |

Constraints:

- Unique `(provider, provider_message_id)` provides provider-delivery idempotency.
- `status` is checked against `received`, `queued`, `processing`, `processed`, and `failed`.
- `(user_id, inbound_address_id)` references `inbound_addresses(user_id, id)` with `ON DELETE CASCADE`. This proves common ownership and removes dependent raw messages when an address is removed.
- Unique `(user_id, id)` supports downstream ownership-preserving references.

Indexes:

- `user_id`
- `inbound_address_id`
- `(user_id, received_at DESC)`
- `status`

## `newsletters`

Represents a user-owned publication or sender grouping.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key, defaults to `gen_random_uuid()` |
| `user_id` | `uuid` | Not null, references `auth.users(id)` with cascade delete |
| `name` | `text` | Not null |
| `sender_name` | `text` | Nullable |
| `sender_email` | `text` | Not null |
| `sender_domain` | `text` | Nullable |
| `created_at` | `timestamptz` | Not null, defaults to `now()` |
| `updated_at` | `timestamptz` | Not null, defaults to `now()` |

Indexes and constraints:

- Index on `user_id`.
- Index on `(user_id, sender_email)` for sender grouping.
- Unique `(user_id, id)` target for ownership-preserving foreign keys.
- `sender_email` is intentionally not unique because ingestion may distinguish multiple newsletter identities from one sender.

## `issues`

Represents one safe, readable newsletter issue.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `uuid` | Primary key, defaults to `gen_random_uuid()` |
| `user_id` | `uuid` | Not null, references `auth.users(id)` with cascade delete |
| `newsletter_id` | `uuid` | Not null |
| `raw_email_id` | `uuid` | Not null, unique |
| `title` | `text` | Not null |
| `content_html` | `text` | Nullable; accepts sanitized output only |
| `content_text` | `text` | Nullable; fallback rendering and future search source |
| `published_at` | `timestamptz` | Nullable |
| `received_at` | `timestamptz` | Not null |
| `created_at` | `timestamptz` | Not null, defaults to `now()` |
| `updated_at` | `timestamptz` | Not null, defaults to `now()` |

Constraints:

- Unique `raw_email_id` ensures at most one Issue per RawEmail.
- `(user_id, newsletter_id)` references `newsletters(user_id, id)` with `ON DELETE CASCADE`.
- `(user_id, raw_email_id)` references `raw_emails(user_id, id)` with `ON DELETE CASCADE`.
- These composite foreign keys prevent cross-user Newsletter or RawEmail attachment and ensure dependent Issues are removed during account-data cleanup.
- Unique `(user_id, id)` supports ownership-preserving IssueState references.

Indexes:

- `user_id`
- `newsletter_id`
- `(user_id, received_at DESC)` for Inbox reads
- `(newsletter_id, received_at DESC)` for newsletter history

## `issue_states`

Stores interaction state separately from Issue content.

| Column | Type | Rules |
| --- | --- | --- |
| `user_id` | `uuid` | Not null, references `auth.users(id)` with cascade delete |
| `issue_id` | `uuid` | Not null |
| `read_at` | `timestamptz` | Nullable |
| `saved_at` | `timestamptz` | Nullable |
| `archived_at` | `timestamptz` | Nullable |

Constraints and indexes:

- Composite primary key `(user_id, issue_id)` allows one state row per user and Issue.
- `(user_id, issue_id)` references `issues(user_id, id)` with `ON DELETE CASCADE`, proving ownership and removing state when its Issue is removed.
- Partial index `(user_id, saved_at)` where `saved_at IS NOT NULL` supports Saved queries.
- Partial index `(user_id, archived_at)` where `archived_at IS NOT NULL` supports Archive queries.

## Relationships and deletion behavior

```text
auth.users
  1 -> n inbound_addresses  (cascade on user deletion)
  1 -> n raw_emails         (cascade on user deletion)
  1 -> n newsletters        (cascade on user deletion)
  1 -> n issues             (cascade on user deletion)
  1 -> n issue_states       (cascade on user deletion)

inbound_addresses
  1 -> n raw_emails         (cascade raw-email deletion)

raw_emails
  1 -> 0..1 issues          (cascade issue deletion)

newsletters
  1 -> n issues             (cascade issue deletion)

issues
  1 -> 0..1 issue_states    (cascade state deletion)
```

User deletion intentionally removes all user-owned Newshelf data. Internal cascade paths ensure account-data cleanup can traverse the full Newshelf graph, while composite keys continue to prevent cross-user relationships.

## Authorization invariant

Database constraints prevent cross-user ownership mismatches between the core tables. They complement rather than replace authorization in repositories, server actions, route handlers, and future RLS policies. IDs alone are never authorization.

## Deferred schema work

- A later issue will define RLS policies alongside authenticated Newshelf data access.
- MVP-036 will add Postgres-native full-text search indexes after the query shape is implemented.
- No external search service, vector database, or global publication graph is planned for the MVP.
