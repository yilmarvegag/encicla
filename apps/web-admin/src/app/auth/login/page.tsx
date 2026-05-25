import { redirect } from 'next/navigation';
import { readSession } from '@/lib/auth.server';
import LoginForm from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const { loggedIn } = await readSession();
  const params = await searchParams;
  const next = params?.redirect ? decodeURIComponent(params.redirect) : '/';

  if (loggedIn) redirect(next);
  return <LoginForm redirect={next} />;
}
