'use client';

import { createClient } from '@supabase/supabase-js';

import { browserEnv } from '@/lib/env/browser';

export function createBrowserSupabaseClient() {
  return createClient(
    browserEnv.NEXT_PUBLIC_SUPABASE_URL,
    browserEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
