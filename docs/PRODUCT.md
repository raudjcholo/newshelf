# PRODUCT.md — Newshelf MVP

## Product statement
Newshelf is an inbox built specifically for newsletters.

A user gets a unique email address such as:

```text
<random-alias>@in.newshelf.app
```

The user subscribes to newsletters with that address. Newshelf receives those emails, converts them into safe structured Issues, and presents them in a reading-focused Inbox and Reader.

## Problem
Newsletters compete with personal and work email, making both the inbox and the reading experience worse. Newshelf separates subscription reading from normal email while preserving the convenience of email-based newsletter delivery.

## MVP user
The initial user is someone who already subscribes to multiple email newsletters and wants a dedicated place to receive, organize, find and read them.

## Core user journey
1. User creates an account.
2. Newshelf creates a unique inbound email address.
3. User copies the address and subscribes to a newsletter.
4. Newsletter sends an issue to that address.
5. Newshelf receives and processes the email.
6. The issue appears in the user's Inbox.
7. User opens it in the Reader.
8. Opening marks it read.
9. User can save or archive it.
10. User can later search previously received issues.

## MVP capabilities
- Authentication
- One active personal inbound address per user initially
- Inbound newsletter reception
- Durable asynchronous processing
- Newsletter identification/grouping
- Safe HTML normalization/sanitization
- Inbox ordered by newest received issue
- Reader
- Read/unread
- Saved
- Archive
- Newsletter detail/history
- Basic full-text search
- Basic onboarding
- Responsive web UI

## Product invariants
- Newshelf is not a general-purpose email client.
- The primary product object is an `Issue`, not an email message.
- A `Newsletter` groups Issues from a publication/sender for one user in the MVP.
- Raw inbound data must remain recoverable/reprocessable.
- Reading must never require executing sender-provided JavaScript.
- A user must never be able to access another user's content.

## Out of scope
- AI summaries, semantic search or chat
- RSS
- Native mobile apps
- Browser extension
- Highlights and annotations
- Tags/folders/collections
- Social/discovery/recommendations
- Payments and subscription tiers
- Sending/replying to email
- Contact management
- Calendar/tasks
- Importing a user's existing Gmail/Outlook newsletter history

## MVP success criterion
The product reaches MVP when an early user can independently sign up, obtain their address, subscribe to real newsletters, reliably receive them, read them comfortably, manage basic state, and find previously received issues.

## First release philosophy
Correctness, security and reliability of the inbound-to-reader pipeline are more important than feature breadth. If a secondary feature threatens the critical path, defer it.
