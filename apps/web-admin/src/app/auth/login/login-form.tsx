'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth.service';
import Image from 'next/image';

export default function LoginForm({ redirect }: { redirect: string }) {
  const router = useRouter();
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login({ username, password });
      router.replace(redirect);
    } catch (ex: any) {
      setErr(ex?.message ?? 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6 bg-encicla-blue">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-slate-800 p-6 bg-encicla-green">
        <Image src="https://encicla-portal-prd-staging-fxhth4dnh3b9fqfr.eastus2-01.azurewebsites.net/wp-content/uploads/2025/09/Logo-encicla.svg" alt="Encicla" width={300} height={250} className="mx-auto mb-6" />
        <h1 className="text-xl font-semibold mb-4">Encicla Admin — Iniciar sesión</h1>
        <div className="grid gap-3">
          <input className="input" placeholder="Usuario" value={username} onChange={(e)=>setUser(e.target.value)} />
          <input className="input" placeholder="Contraseña" type="password" value={password} onChange={(e)=>setPass(e.target.value)} />
          {err && <div className="text-sm font-bold text-[var(--encicla-danger)]">{err}</div>}
          <button className="btn btn-primary hover:bg-[var(--encicla-blue)] cursor-pointer border-slate-800" disabled={loading || !username || !password}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </div>
      </form>
    </main>
  );
}
