// apps/web-admin/src/lib/auth.server.ts
import { cookies } from 'next/headers';

export async function readSession() {
  const c = await cookies();
  const token  = c.get('encicla_token')?.value ?? null;
  const expStr = c.get('encicla_exp')?.value ?? null;

  const expMs   = expStr ? new Date(expStr).getTime() : NaN;
  const expired = !expStr || isNaN(expMs) || Date.now() > (expMs - 30_000); // skew 30s

  return {
    loggedIn: Boolean(token) && !expired,
    token,
    expiration: expStr,
  };
}
