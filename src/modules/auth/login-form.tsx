'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { login } from '@/modules/auth/actions';
import { initialAuthState } from '@/modules/auth/state';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialAuthState);

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
        autoComplete="current-password"
        id="password"
        minLength={8}
        name="password"
        required
        type="password"
      />
      <FieldError messages={state.fieldErrors?.password} />

      {state.message ? <p role="alert">{state.message}</p> : null}

      <button disabled={pending} type="submit">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>

      <p>
        New to Newshelf? <Link href="/signup">Create an account</Link>
      </p>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <p className="field-error">{messages[0]}</p> : null;
}
