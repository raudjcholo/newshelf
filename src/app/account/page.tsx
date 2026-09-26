import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logout } from '@/modules/auth/actions';

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect('/login');
  }

  const email =
    typeof data.claims.email === 'string' ? data.claims.email : null;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Signed in to Newshelf</h1>
        {email ? <p>{email}</p> : null}
        <p>
          This temporary page verifies authentication. MVP-007 will replace it.
        </p>
        <form action={logout}>
          <button type="submit">Sign out</button>
        </form>
      </section>
    </main>
  );
}
