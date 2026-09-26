'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { signup } from '@/modules/auth/actions';
import { initialAuthState } from '@/modules/auth/state';

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialAuthState);

  return (
    <form action={formAction} className="auth-form">
      <label htmlFor="email">Email</label>
      <input
        autoComplete="email"
        id="email"
        name="email"
        required
        type="email"
      />
      <FieldError messages={state.fieldErrors?.email} />

      <label htmlFor="password">Password</label>
      <input
        autoComplete="new-password"
        id="password"
        minLength={8}
        name="password"
        required
        type="password"
      />
      <FieldError messages={state.fieldErrors?.password} />

      <label htmlFor="passwordConfirmation">Confirm password</label>
      <input
        autoComplete="new-password"
        id="passwordConfirmation"
        minLength={8}
        name="passwordConfirmation"
        required
        type="password"
      />
      <FieldError messages={state.fieldErrors?.passwordConfirmation} />

      {state.message ? (
        <p role={state.status === 'error' ? 'alert' : 'status'}>
          {state.message}
        </p>
      ) : null}

      <button disabled={pending} type="submit">
        {pending ? 'Creating account…' : 'Create account'}
      </button>

      <p>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <p className="field-error">{messages[0]}</p> : null;
}
