import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/db/schema';
import { serverEnv } from '@/lib/env/server';

const client = postgres(serverEnv.SUPABASE_DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: 'require',
});

export const db = drizzle(client, { schema });
