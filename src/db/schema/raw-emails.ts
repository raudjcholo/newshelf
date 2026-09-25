import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { authUsers } from './auth';
import { inboundAddresses } from './inbound-addresses';

export const rawEmailStatuses = [
  'received',
  'queued',
  'processing',
  'processed',
  'failed',
] as const;

export type RawEmailStatus = (typeof rawEmailStatuses)[number];

export const rawEmails = pgTable(
  'raw_emails',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    inboundAddressId: uuid('inbound_address_id').notNull(),
    provider: text('provider').notNull(),
    providerMessageId: text('provider_message_id').notNull(),
    fromAddress: text('from_address').notNull(),
    toAddress: text('to_address').notNull(),
    subject: text('subject'),
    rawPayloadLocation: text('raw_payload_location'),
    status: text('status')
      .$type<RawEmailStatus>()
      .notNull()
      .default('received'),
    failureReason: text('failure_reason'),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('raw_emails_provider_message_unique').on(
      table.provider,
      table.providerMessageId,
    ),
    unique('raw_emails_user_id_id_unique').on(table.userId, table.id),
    check(
      'raw_emails_status_check',
      sql`${table.status} in ('received', 'queued', 'processing', 'processed', 'failed')`,
    ),
    foreignKey({
      name: 'raw_emails_user_inbound_address_fk',
      columns: [table.userId, table.inboundAddressId],
      foreignColumns: [inboundAddresses.userId, inboundAddresses.id],
    }).onDelete('cascade'),
    index('raw_emails_user_id_idx').on(table.userId),
    index('raw_emails_inbound_address_id_idx').on(table.inboundAddressId),
    index('raw_emails_user_received_at_idx').on(
      table.userId,
      table.receivedAt.desc(),
    ),
    index('raw_emails_status_idx').on(table.status),
  ],
).enableRLS();

export type RawEmail = typeof rawEmails.$inferSelect;
export type NewRawEmail = typeof rawEmails.$inferInsert;
