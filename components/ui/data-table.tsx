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
    <div className="w-full border rounded-lg">
      <div className="w-full">
        <table className="w-full caption-bottom text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="[&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-800">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-gray-50 dark:bg-gray-800 text-left align-middle font-medium whitespace-nowrap text-xs [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </thead>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-2 align-middle whitespace-nowrap text-xs [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center text-gray-600 dark:text-gray-300 p-2 align-middle whitespace-nowrap text-xs"
                >
                  {loading ? "Cargando..." : searchFilter ? "No se encontraron resultados" : "Sin datos"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

