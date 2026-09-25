import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { authUsers } from './auth';

export const inboundAddresses = pgTable(
  'inbound_addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    alias: text('alias').notNull(),
    email: text('email').notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('inbound_addresses_alias_unique').on(table.alias),
    unique('inbound_addresses_email_unique').on(table.email),
    unique('inbound_addresses_user_id_id_unique').on(table.userId, table.id),
    index('inbound_addresses_user_id_idx').on(table.userId),
  ],
).enableRLS();

export type InboundAddress = typeof inboundAddresses.$inferSelect;
export type NewInboundAddress = typeof inboundAddresses.$inferInsert;
