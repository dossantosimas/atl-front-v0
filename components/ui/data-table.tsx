"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchFilter?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchFilter,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="w-full rounded-md border border-border bg-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Buscando eventos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-md border border-border bg-card overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto relative">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-sm [&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-foreground h-8 px-2 text-left align-middle font-medium whitespace-nowrap bg-muted/95 backdrop-blur-sm text-xs [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-1.5 align-middle whitespace-nowrap text-xs [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-16 text-center text-muted-foreground p-2 align-middle whitespace-nowrap text-xs"
                >
                  {loading ? "Cargando..." : searchFilter ? "No se encontraron resultados" : "Sin datos"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

