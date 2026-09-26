import type { EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

const emailOtpTypes: EmailOtpType[] = [
  'email',
  'signup',
  'invite',
  'recovery',
  'email_change',
];

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');

  if (tokenHash && type && emailOtpTypes.includes(type as EmailOtpType)) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (!error) {
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  return NextResponse.redirect(
    new URL('/login?message=confirmation-failed', request.url),
  );
}
