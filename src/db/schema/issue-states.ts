import { sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { authUsers } from './auth';
import { issues } from './issues';

export const issueStates = pgTable(
  'issue_states',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    issueId: uuid('issue_id').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    savedAt: timestamp('saved_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    primaryKey({
      name: 'issue_states_user_id_issue_id_pk',
      columns: [table.userId, table.issueId],
    }),
    foreignKey({
      name: 'issue_states_user_issue_fk',
      columns: [table.userId, table.issueId],
      foreignColumns: [issues.userId, issues.id],
    }).onDelete('cascade'),
    index('issue_states_saved_idx')
      .on(table.userId, table.savedAt)
      .where(sql`${table.savedAt} is not null`),
    index('issue_states_archived_idx')
      .on(table.userId, table.archivedAt)
      .where(sql`${table.archivedAt} is not null`),
  ],
).enableRLS();

export type IssueState = typeof issueStates.$inferSelect;
export type NewIssueState = typeof issueStates.$inferInsert;
