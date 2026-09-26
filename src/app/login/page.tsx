import Link from 'next/link';

import { LoginForm } from '@/modules/auth/login-form';

const messages: Record<string, string> = {
  'confirmation-failed':
    'The confirmation link is invalid or expired. Request a new signup email or try again.',
  'signed-out': 'You have been signed out.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/">Newshelf</Link>
        <h1>Sign in</h1>
        {message && messages[message] ? (
          <p role="status">{messages[message]}</p>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
