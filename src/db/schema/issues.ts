import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { authUsers } from './auth';
import { newsletters } from './newsletters';
import { rawEmails } from './raw-emails';

export const issues = pgTable(
  'issues',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    newsletterId: uuid('newsletter_id').notNull(),
    rawEmailId: uuid('raw_email_id').notNull(),
    title: text('title').notNull(),
    contentHtml: text('content_html'),
    contentText: text('content_text'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('issues_raw_email_id_unique').on(table.rawEmailId),
    unique('issues_user_id_id_unique').on(table.userId, table.id),
    foreignKey({
      name: 'issues_user_newsletter_fk',
      columns: [table.userId, table.newsletterId],
      foreignColumns: [newsletters.userId, newsletters.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'issues_user_raw_email_fk',
      columns: [table.userId, table.rawEmailId],
      foreignColumns: [rawEmails.userId, rawEmails.id],
    }).onDelete('cascade'),
    index('issues_user_id_idx').on(table.userId),
    index('issues_newsletter_id_idx').on(table.newsletterId),
    index('issues_user_received_at_idx').on(
      table.userId,
      table.receivedAt.desc(),
    ),
    index('issues_newsletter_received_at_idx').on(
      table.newsletterId,
      table.receivedAt.desc(),
    ),
  ],
).enableRLS();

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
