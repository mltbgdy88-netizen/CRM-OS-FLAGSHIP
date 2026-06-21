import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <p>Sprint-02 Slice A — workspace login (no admin screens).</p>
      <LoginForm />
      <p>
        <Link href="/">Back to home</Link>
      </p>
    </main>
  );
}
