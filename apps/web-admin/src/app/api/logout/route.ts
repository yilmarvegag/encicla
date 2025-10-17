// apps/web-admin/src/app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // borra cookies seguras del middleware
  res.cookies.set('encicla_token', '', { path: '/', maxAge: 0 });
  res.cookies.set('encicla_exp',   '', { path: '/', maxAge: 0 });
  res.cookies.set('encicla_roles', '', { path: '/', maxAge: 0 });
  return res;
}
