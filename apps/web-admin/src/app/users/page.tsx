// apps/web-admin/src/app/users/page.tsx
"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { Shell } from "@/components/shell";
import { DataTable } from "@/components/data-table";
import { userColumns } from "@/components/columns";
import { fetchUsersPaged } from "@/lib/admin.service";
import type { Paged } from "@/types/paging";
import type { UserOutputDto } from "@/types/user";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [countSearch, setCountSearch] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const canSearch = debouncedQ.length === 0 || debouncedQ.length >= 3;

  const key = useMemo(
    () =>
      canSearch
        ? (["/admin/users", page, 20, debouncedQ] as const)
        : (["/admin/users", page, 20, ""] as const),
    [canSearch, page, debouncedQ]
  );

  type Key = readonly ["/admin/users", number, number, string];

  const fetcher = useCallback(
    ([, p, ps, search]: Key) => fetchUsersPaged(p, ps, search),
    []
  );

  const { data, error, isLoading, mutate } = useSWR<Paged<UserOutputDto>, Error, Key>(
    key,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false, revalidateIfStale: false }
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const totalFormatted = data ? new Intl.NumberFormat("es-CO").format(data.total) : "0";

const meta = useMemo(() => ({
  onChanged: (updater?: (prev: UserOutputDto[]) => UserOutputDto[]) => {
    if (!updater) return mutate(); // revalidar
    mutate(prev => prev ? { ...prev, items: updater(prev.items) } : prev, { revalidate: false });
  }
}), [mutate]);

  return (
    <Shell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
        <input
          className="input w-72"
          placeholder="Buscar: nombre, email, número documento…"
          value={q}
          onChange={(e) => {
            if (e.target.value.length > 3 || e.target.value.length === 0) setCountSearch(false);
            else setCountSearch(true);
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {countSearch && (
        <div role="status" aria-live="polite"
          className="mb-4 rounded-lg border border-amber-600/40 bg-amber-900/20 px-3 py-2 text-sm text-amber-200">
          Escribe <b>al menos 3 caracteres</b> para ejecutar la búsqueda.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-rose-700 bg-rose-950/40 p-3 text-sm">
          {error.message || "Error al cargar usuarios"}
        </div>
      )}

      {isLoading && !data ? (
        <div className="opacity-70">Cargando…</div>
      ) : (
        <>
          <DataTable columns={userColumns} data={data?.items ?? []} meta={meta} />

          {data && data.total > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <button className="btn bg-sky-600 hover:bg-sky-500 " onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Anterior
              </button>
              <button className="btn bg-sky-600 hover:bg-sky-500 " onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages}>
                Siguiente
              </button>
              <div className="ml-auto opacity-70">
                Página {data?.page ?? page} de {totalPages} · {totalFormatted} registros
              </div>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
