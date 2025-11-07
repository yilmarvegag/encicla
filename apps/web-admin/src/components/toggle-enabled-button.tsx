//web-admin\src\components\toggle-enabled-button.tsx
"use client";
import { useState } from "react";
import { UserOutputDto } from "@/types/user";
import { Table } from "@tanstack/react-table";
import { disableUser, enableUser } from "@/lib/admin.service";

export function ToggleEnabledButton({
  enabled: isEnabled,
  table,
  row,
}: {
  enabled: boolean;
  table: Table<UserOutputDto>;
  row: UserOutputDto;
}) {
  const [busy, setBusy] = useState(false);
  async function toggle() {
    if (busy) return;
    setBusy(true);

    const toggledEstado: UserOutputDto["estado"] = isEnabled
      ? "Deshabilitado"
      : "Habilitado";

    // Optimista
    table.options.meta?.onChanged?.((list) =>
      list.map((u) => (u.id === row.id ? { ...u, estado: toggledEstado } : u))
    );

    try {
      if (isEnabled) await disableUser(row.id);
      else await enableUser(row.id);
    } catch (e) {
      const prevEstado: UserOutputDto["estado"] = row.estado;
      table.options.meta?.onChanged?.((list) =>
        list.map((u) => (u.id === row.id ? { ...u, estado: prevEstado } : u))
      );
      alert(
        `No se pudo ${isEnabled ? "deshabilitar" : "habilitar"} el usuario. Intenta de nuevo.`
      );
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`btn ${isEnabled ? "bg-rose-600 hover:bg-rose-500" : "bg-green-600 hover:bg-green-500"} disabled:opacity-60`}
      onClick={toggle}
      disabled={busy}
      aria-busy={busy}
      aria-label={isEnabled ? "Deshabilitar usuario" : "Habilitar usuario"}
      title={isEnabled ? "Deshabilitar" : "Habilitar"}
    >
      {busy ? "Procesando…" : isEnabled ? "Deshabilitar" : "Habilitar"}
    </button>
  );
}
