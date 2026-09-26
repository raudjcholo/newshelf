import Link from 'next/link';

import { SignupForm } from '@/modules/auth/signup-form';

export default function SignupPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/">Newshelf</Link>
        <h1>Create your account</h1>
        <SignupForm />
      </section>
    </main>
  );
}
