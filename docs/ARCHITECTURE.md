# ARCHITECTURE.md — Newshelf MVP

## Architecture style
Use a modular monolith for the web application plus durable asynchronous email processing. Do not introduce microservices for the MVP.

## Deployment
- Web application/API: Vercel
- Database/Auth/Storage: Supabase
- Inbound email: Resend
- Durable queue: Supabase Queues (`pgmq`)

## System flow

```text
                         Internet
                            |
               +------------+------------+
               |                         |
            Browser                  Newsletter
               |                         |
               v                         v
          +---------+                +--------+
          | Vercel  |                | Resend |
          | Next.js |                |Inbound |
          +----+----+                +---+----+
               |                         |
               |                  email.received
               |                         |
               |                         v
               |              /api/webhooks/resend
               |                         |
               |                  verify + persist
               |                         |
               |                         v
               |                     RawEmail
               |                         |
               |                      enqueue
               |                         |
               |                         v
               |                  PROCESS_EMAIL
               |                         |
               |               parse / sanitize /
               |                 normalize / group
               |                         |
               +-------------------------+
                                         v
                                Supabase/PostgreSQL
                                         |
                                         v
                                  Inbox / Reader
```

## Critical boundary: webhook vs processing
The inbound webhook must do only what is necessary to accept delivery safely:
1. Validate provider authenticity/signature.
2. Validate the event shape.
3. Resolve the inbound address/user.
4. Persist enough provider/raw metadata for recovery.
5. Enforce idempotency.
6. Enqueue processing.
7. Return promptly.

It must not perform expensive parsing, sanitization, newsletter grouping or UI transformations synchronously.

## Processing pipeline

```text
RawEmail
  -> processing lock/status
  -> retrieve raw/provider content if necessary
  -> MIME/provider payload parsing
  -> metadata extraction
  -> choose HTML/text body
  -> sanitize HTML
  -> normalize links/content
  -> identify or create Newsletter
  -> create Issue
  -> mark RawEmail processed
```

Failures must be observable and retryable. A failed processing attempt must not create duplicate Issues.

## Idempotency
Inbound provider delivery must be treated as at-least-once. Use the provider's stable message/event identifier where available and enforce database uniqueness. Queue retries must also be safe.

## Data ownership
All user-owned domain records carry or derive a `user_id`. Repository/query functions should make ownership explicit rather than relying on UI filtering.

## Raw data strategy
Keep a recoverable representation of inbound messages. Small metadata belongs in PostgreSQL; large raw MIME/payload data may be stored in Supabase Storage with a database pointer. Do not prematurely duplicate all remote newsletter images.

## Search
For the MVP, use PostgreSQL full-text search or an equivalently simple Postgres-native solution. Do not add Elasticsearch, embeddings or a vector database.

## Suggested source layout

```text
src/
  app/
    (auth)/
    (app)/
      inbox/
      saved/
      archive/
      newsletters/
      issue/
    api/
      webhooks/
  modules/
    auth/
    inbound-email/
    newsletters/
    issues/
    reader/
    search/
  jobs/
    process-email/
  db/
    schema/
    migrations/
  lib/

tests/
  fixtures/emails/
  integration/
  e2e/
```

## Module rules
- `inbound-email`: provider/webhook/raw-message concerns; no React UI logic.
- `newsletters`: publication grouping and newsletter-level queries.
- `issues`: Issue creation/state/query domain logic.
- `reader`: presentation-safe reading behavior; never trusts raw HTML.
- `search`: Postgres search behavior; no provider ingestion logic.
- `auth`: session/user boundaries.

## Observability
At minimum, capture structured events for inbound acceptance, enqueue, processing start, processing success/failure and retries. Include stable internal IDs for correlation, not secrets or unnecessarily complete email bodies.

## Architecture decision rule
Prefer the smallest design that preserves:
- durability
- idempotency
- security
- reprocessability
- user isolation

Do not optimize for hypothetical scale before MVP usage demonstrates the need.
