// apps/web-admin/src/app/page.tsx  (Resumen)
'use client';
import useSWR from 'swr';
import { Shell } from '@/components/shell';
import { fetchUsersSummary } from '@/lib/admin.service';

export default function Dashboard() {
  const { data, error, isLoading } = useSWR('/admin/users/summary', () => fetchUsersSummary(), {
    revalidateOnFocus: false,
  });

  return (
    <Shell>
      <h2 className="text-2xl font-semibold mb-4">Resumen</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-700 bg-rose-950/40 p-3 text-sm">
          {error.message || 'Error al cargar el resumen'}
        </div>
      )}

      {isLoading || !data ? (
        <div className="opacity-70">Cargando…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card title="Usuarios" value={data.total} />
            <Card title="Habilitados" value={data.habilitados} />
            <Card title="Deshabilitados" value={data.deshabilitados} />
            <Card title="Nuevos (hoy)" value={data.nuevosHoy} />
            <Card title="Nuevos (semana)" value={data.nuevosSemana} />
          </div>

          {/* <div className="mt-6">
            <a className="btn" href="/users">Ir a la lista de usuarios</a>
          </div> */}
        </>
      )}
    </Shell>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 p-4">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-2xl font-semibold">{new Intl.NumberFormat('es-CO').format(value)}</div>
    </div>
  );
}
