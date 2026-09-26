'use server';

import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AuthActionState } from '@/modules/auth/state';
import {
  authFormValues,
  loginSchema,
  signupSchema,
} from '@/modules/auth/validation';

export async function login(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(authFormValues(formData));

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: 'error',
      message:
        'Email or password is incorrect, or the account is not confirmed.',
    };
  }

  redirect('/account');
}

export async function signup(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(authFormValues(formData));

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: 'error',
      message: 'Unable to create the account. Please try again.',
    };
  }

  if (!data.session) {
    return {
      status: 'confirmation-required',
      message:
        'Check your email to confirm your account, then return here to sign in.',
    };
  }

  redirect('/account');
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login?message=signed-out');
}
