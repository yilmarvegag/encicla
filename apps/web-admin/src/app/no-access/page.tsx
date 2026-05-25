// apps/web-admin/src/app/no-access/page.tsx
"use client";
import { logout } from "@/lib/auth";
import Link from "next/link";

const isLoggedIn = Boolean(
  typeof window !== "undefined" && document.cookie.includes("encicla_token=")
);
export default function NoAccess() {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h2 className="text-xl font-semibold">No tienes permisos</h2>
        <p className="mt-2 text-slate-300">
          Tu usuario no tiene acceso al panel de administración. Si crees que es
          un error, contacta a un administrador.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {isLoggedIn && (
            <button
              onClick={logout}
              className="rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          )}

          <Link
            href="/auth/login"
            className="rounded-lg bg-sky-600 px-4 py-2 hover:bg-sky-500 text-center"
          >
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  );
}
