// apps/web-admin/src/components/data-table.tsx
'use client';
import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

type Props<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  emptyMessage?: string;
  meta?: { onChanged?: (updater?: (prev: TData[]) => TData[]) => void };
};

function TableInner<TData>({ columns, data, emptyMessage = 'Sin registros', meta }: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta,
  });

  if (!data || data.length === 0) {
    return <div className="rounded-xl border border-slate-800 p-8 text-sm opacity-70">{emptyMessage}</div>;
  }

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800">
          {headerGroups.map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-3 py-2 text-left font-medium">
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-800">
              {r.getVisibleCells().map((c) => (
                <td key={c.id} className="px-3 py-2">
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const DataTable = React.memo(TableInner) as typeof TableInner;
