import { z } from 'zod';

const postgresUrl = z
  .string()
  .min(1)
  .refine(
    (value) =>
      value.startsWith('postgres://') || value.startsWith('postgresql://'),
    'Must be a PostgreSQL connection URL',
  );

const browserEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_DATABASE_URL: postgresUrl,
});

const migrationEnvSchema = z.object({
  SUPABASE_MIGRATION_DATABASE_URL: postgresUrl,
});

type Environment = Record<string, string | undefined>;

export function parseBrowserEnv(environment: Environment) {
  return browserEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function parseServerEnv(environment: Environment) {
  return serverEnvSchema.parse({
    SUPABASE_SECRET_KEY: environment.SUPABASE_SECRET_KEY,
    SUPABASE_DATABASE_URL: environment.SUPABASE_DATABASE_URL,
  });
}

export function parseMigrationEnv(environment: Environment) {
  return migrationEnvSchema.parse({
    SUPABASE_MIGRATION_DATABASE_URL:
      environment.SUPABASE_MIGRATION_DATABASE_URL,
  });
}
