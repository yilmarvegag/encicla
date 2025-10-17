// apps/web-admin/src/components/shell.tsx
"use client";

import { useIdleLogout } from "@/hooks/useIdleLogout";
import { logout } from "@/lib/auth";

export function Shell({ children }: { children: React.ReactNode }) {
  useIdleLogout(); // 20 minutos por defecto o NEXT_PUBLIC_IDLE_MINUTES

  async function onLogout() {
    await logout();
  }

  return (
    <div className="grid md:grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-800 p-4">
        <h1 className="text-lg font-bold mb-4">Administración</h1>

        <ul className="space-y-1">
          <li>
            <a
              href="/"
              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:dark:bg-gray-900"
            >
              General
            </a>
          </li>
          <li>
            <a
              href="/users"
              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:dark:bg-gray-900"
            >
              Usuarios Encicla
            </a>
          </li>
          <li>
            <a
              href="/"
              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:dark:bg-gray-900"
            >
              <button className="hover:cursor-pointer" onClick={onLogout}>
                Cerrar sesión
              </button>
            </a>
          </li>
        </ul>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
