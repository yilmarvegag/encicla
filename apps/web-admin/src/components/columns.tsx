'use client';
import { useState } from 'react';
import type { ColumnDef, Table } from '@tanstack/react-table';
import type { UserOutputDto } from '@/types/user';
import { getRoles } from '@/lib/auth';
import { ToggleEnabledButton } from './toggle-enabled-button';
import { EditUserDialog } from './edit-user-dialog';

const isAdmin = getRoles().map(r => r.toLowerCase()).includes('administrador');

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    onChanged?: (updater?: (prev: TData[]) => TData[]) => void;
  }
}

const dateSort: ColumnDef<UserOutputDto>['sortingFn'] = (a, b, id) => {
  const va = Date.parse(String(a.getValue(id))) || 0;
  const vb = Date.parse(String(b.getValue(id))) || 0;
  return va - vb;
};

export const userColumns: ColumnDef<UserOutputDto>[] = [
  {
    header: 'Usuario',
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="flex items-center gap-3">
          <img
            src={r.avatarUrl}
            alt="Imagen de usuario"
            className="size-8 rounded-full border border-slate-700 object-cover"
          />
          <div>
            <div className="font-medium">{r.fullName}</div>
            <div className="text-xs opacity-70">{r.email}</div>
          </div>
        </div>
      );
    },
  },
  { header: 'Documento', accessorKey: 'documento' },
  { header: 'Teléfono', accessorKey: 'telefono' },
  { header: 'Dirección', accessorKey: 'direccion' },
  { header: 'Municipio', accessorKey: 'municipio' },
  { header: 'Alta', accessorKey: 'fechaAlta', sortingFn: dateSort },
  {
    header: 'Estado',
    accessorKey: 'estado',
    cell: ({ getValue }) => {
      const v = String(getValue());
      const cls =
        v === 'Habilitado'
          ? 'border-emerald-400 text-emerald-300'
          : 'border-rose-400 text-rose-300';
      return <span className={`badge ${cls}`}>{v}</span>;
    },
  },
  { header: 'Creado', accessorKey: 'fechaCreacion', sortingFn: dateSort },
  {
    header: 'Acciones',
    id: 'actions',
    cell: ({ row, table }) => (
      <RowActions row={row.original} table={table} isAdmin={isAdmin} />
    ),
  },
];

/** Celda con estado local y actualización optimista */
function RowActions({
  row,
  table,
  isAdmin,
}: {
  row: UserOutputDto;
  table: Table<UserOutputDto>;
  isAdmin: boolean;
}) {
  
  const isEnabled = row.estado === 'Habilitado';

  if (!isAdmin) return <span className="text-xs opacity-60">Solo lectura</span>;

  return (
    <div className="flex gap-2">
      <EditUserDialog userId={row.id} onSaved={() => table.options.meta?.onChanged?.()} />
      <ToggleEnabledButton enabled={isEnabled} row={row} table={table} />
    </div>
  );
}
