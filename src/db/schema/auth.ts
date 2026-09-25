import { pgSchema, uuid } from 'drizzle-orm/pg-core';

const auth = pgSchema('auth');

/** Existing Supabase-owned table. Drizzle uses this declaration for foreign keys only. */
export const authUsers = auth.table('users', {
  id: uuid('id').primaryKey(),
});
