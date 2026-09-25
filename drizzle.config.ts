import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

import { parseMigrationEnv } from './src/lib/env/schemas';

loadEnv({ path: ['.env.local', '.env'], quiet: true });

const env = parseMigrationEnv(process.env);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: env.SUPABASE_MIGRATION_DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
