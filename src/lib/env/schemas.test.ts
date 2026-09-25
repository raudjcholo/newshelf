import { describe, expect, it } from 'vitest';

import { parseBrowserEnv, parseMigrationEnv, parseServerEnv } from './schemas';

const validEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  SUPABASE_SECRET_KEY: 'secret-key-example',
  SUPABASE_DATABASE_URL:
    'postgresql://postgres.example:password@pooler.example.com:6543/postgres',
  SUPABASE_MIGRATION_DATABASE_URL:
    'postgresql://postgres:password@db.example.supabase.co:5432/postgres',
};

describe('environment validation', () => {
  it('accepts the documented browser and server variables', () => {
    expect(parseBrowserEnv(validEnvironment)).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: validEnvironment.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        validEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    });
    expect(parseServerEnv(validEnvironment)).toEqual({
      SUPABASE_SECRET_KEY: validEnvironment.SUPABASE_SECRET_KEY,
      SUPABASE_DATABASE_URL: validEnvironment.SUPABASE_DATABASE_URL,
    });
  });

  it('rejects missing browser configuration', () => {
    expect(() => parseBrowserEnv({})).toThrow();
  });

  it('rejects non-PostgreSQL migration URLs', () => {
    expect(() =>
      parseMigrationEnv({
        SUPABASE_MIGRATION_DATABASE_URL: 'https://example.supabase.co',
      }),
    ).toThrow('Must be a PostgreSQL connection URL');
  });
});
