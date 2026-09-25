import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { authUsers } from './auth';

export const newsletters = pgTable(
  'newsletters',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    senderName: text('sender_name'),
    senderEmail: text('sender_email').notNull(),
    senderDomain: text('sender_domain'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('newsletters_user_id_id_unique').on(table.userId, table.id),
    index('newsletters_user_id_idx').on(table.userId),
    index('newsletters_user_sender_email_idx').on(
      table.userId,
      table.senderEmail,
    ),
  ],
).enableRLS();

export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;
