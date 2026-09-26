import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Newshelf</h1>
      <p>A dedicated inbox and reader for newsletters.</p>
      <nav aria-label="Authentication">
        <Link href="/login">Sign in</Link>
        <Link href="/signup">Create account</Link>
      </nav>
    </main>
  );
}
