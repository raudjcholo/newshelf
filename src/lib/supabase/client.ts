'use client';

import { createBrowserClient } from '@supabase/ssr';

import { browserEnv } from '@/lib/env/browser';

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    browserEnv.NEXT_PUBLIC_SUPABASE_URL,
    browserEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
