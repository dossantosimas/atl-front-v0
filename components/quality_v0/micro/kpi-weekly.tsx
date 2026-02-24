"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/toast";
import { getMicroIndexWeek } from "@/lib/services/microindex-week.service";
import type { MicroIndexWeekDay } from "@/lib/types/microindex-week";

interface WeeklyKpiProps {
  qualityTypeId: number;
}

interface DailyMetric {
  nonCompliant: number;
  total: number;
  badPct: number;
  ptsLost: number;
  groupPtsLost?: number;
}

interface PiRow {
  groupName: string;
  typeId: string;
  typeName: string;
  ponderation: number;
  byDate: Record<string, DailyMetric>;
  isFirstInGroup?: boolean;
  groupRowCount?: number;
}

interface FlatAnalysis {
  date: string;
  groupName: string;
  typeId: string;
  typeName: string;
  averageWeighted: number;
  compliantCount: number;
  nonCompliantCount: number;
}

function getIsoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getMode(values: number[]): number {
  if (values.length === 0) return 0;
  const counts = new Map<number, number>();
  values.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  let mode = values[0];
  let maxCount = 0;

  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      mode = value;
    }
  });

  return mode;
}

function getGroupRowShadeClass(groupName: string): string {
  const palette = [
    "bg-blue-50 dark:bg-blue-900",
    "bg-emerald-50 dark:bg-emerald-900",
    "bg-amber-50 dark:bg-amber-900",
    "bg-violet-50 dark:bg-violet-900",
    "bg-cyan-50 dark:bg-cyan-900",
    "bg-rose-50 dark:bg-rose-900",
    "bg-lime-50 dark:bg-lime-900",
  ];

  const normalized = groupName.toLowerCase();
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) % palette.length;
  }
  return palette[Math.abs(hash) % palette.length];
}

function parseWeeklyKpi(days: MicroIndexWeekDay[]): { dateKeys: string[]; rows: PiRow[] } {
  const flattened: FlatAnalysis[] = [];

  days.forEach((day) => {
    day.microIndexGroups.forEach((group) => {
      group.analysisTypes.forEach((analysisType) => {
        if (group.microIndexGroup === "__ungrouped__") return;
        if (!analysisType.typeId || !analysisType.typeName) return;
        flattened.push({
          date: day.date,
          groupName: group.microIndexGroup,
          typeId: analysisType.typeId,
          typeName: analysisType.typeName,
          averageWeighted: analysisType.averageWeighted,
          compliantCount: analysisType.compliantCount,
          nonCompliantCount: analysisType.nonCompliantCount,
        });
      });
    });
  });

  const dateKeys = Array.from(new Set(days.map((item) => item.date))).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const byType = new Map<string, FlatAnalysis[]>();
  flattened.forEach((entry) => {
    const typeKey = `${entry.groupName}::${entry.typeId}`;
    const list = byType.get(typeKey) || [];
    list.push(entry);
    byType.set(typeKey, list);
  });

  const rows: PiRow[] = Array.from(byType.entries()).map(([typeKey, entries]) => {
    const [groupName, typeId] = typeKey.split("::");
    const typeName = entries[0]?.typeName ?? typeId;
    const ponderation = getMode(entries.map((item) => item.averageWeighted));
    const byDate: Record<string, DailyMetric> = {};

    dateKeys.forEach((dateKey) => {
      const entriesByDate = entries.filter((item) => item.date === dateKey);
      const compliant = entriesByDate.reduce((sum, item) => sum + item.compliantCount, 0);
      const nonCompliant = entriesByDate.reduce((sum, item) => sum + item.nonCompliantCount, 0);
      const total = compliant + nonCompliant;
      const badPct = total > 0 ? (nonCompliant / total) * 100 : 0;
      const ptsLost = ponderation * nonCompliant;

      byDate[dateKey] = {
        nonCompliant,
        total,
        badPct,
        ptsLost,
      };
    });

    return {
      groupName,
      typeId,
      typeName,
      ponderation,
      byDate,
    };
  });

  rows.sort((a, b) => {
    const groupSort = a.groupName.localeCompare(b.groupName, "es");
    if (groupSort !== 0) return groupSort;
    return a.typeName.localeCompare(b.typeName, "es");
  });

  // Marcar el primero de cada grupo y calcular la suma de Pts Perd por grupo
  const groups = Array.from(new Set(rows.map(r => r.groupName)));
  groups.forEach(groupName => {
    const groupRows = rows.filter(r => r.groupName === groupName);
    if (groupRows.length > 0) {
      groupRows[0].isFirstInGroup = true;
      groupRows[0].groupRowCount = groupRows.length;

      // Calcular suma por día para este grupo
      dateKeys.forEach(dateKey => {
        const groupSum = groupRows.reduce((sum, row) => sum + (row.byDate[dateKey]?.ptsLost || 0), 0);
        const finalIndex = groupSum > 100 ? 0 : 100 - groupSum;
        groupRows.forEach(row => {
          row.byDate[dateKey].groupPtsLost = finalIndex;
        });
      });
    }
  });

  return { dateKeys, rows };
}

export function WeeklyKpi({ qualityTypeId }: WeeklyKpiProps) {
  void qualityTypeId;
  const now = new Date();
  const currentYear = now.getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedWeek, setSelectedWeek] = useState<number>(getIsoWeek(now));
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<MicroIndexWeekDay[]>([]);
  const { showError } = useToast();

  const years = useMemo(() => {
    const result: number[] = [];
    for (let year = currentYear - 5; year <= currentYear + 2; year += 1) {
      result.push(year);
    }
    return result;
  }, [currentYear]);

  const weeks = useMemo(() => {
    return Array.from({ length: 53 }, (_, index) => index + 1);
  }, []);

  const { dateKeys, rows } = useMemo(() => parseWeeklyKpi(rawData), [rawData]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await getMicroIndexWeek(selectedYear, selectedWeek);
      setRawData(data);
    } catch (error) {
      showError("Error al consultar KPI semanal", error);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">año</label>
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">semana</label>
            <Select
              value={String(selectedWeek)}
              onValueChange={(value) => setSelectedWeek(Number(value))}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Semana" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week) => (
                  <SelectItem key={week} value={String(week)}>
                    Semana {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="h-10 px-3"
            aria-label="Buscar KPI semanal"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Consultando KPI semanal...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay datos para el año {selectedYear}, semana {selectedWeek}.
          </div>
        ) : (
          <Table className="min-w-[1800px] text-[11px]">
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-20">
              <TableRow>
                <TableHead rowSpan={2} className="align-middle min-w-[220px] sticky left-0 bg-white dark:bg-slate-900 z-30 border-r">
                  Indicador (PI)
                </TableHead>
                <TableHead rowSpan={2} className="align-middle min-w-[80px] w-[80px] text-center sticky left-[220px] bg-white dark:bg-slate-900 z-30 border-r">
                  Pond.
                </TableHead>
                {dateKeys.map((dateKey) => (
                  <TableHead key={dateKey} colSpan={5} className="text-center whitespace-nowrap border-b">
                    {formatDateLabel(dateKey)}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {dateKeys.map((dateKey) => (
                  <React.Fragment key={`headers-${dateKey}`}>
                    <TableHead className="min-w-[65px] w-[65px] text-center whitespace-nowrap text-[9px] px-1 border-l">
                      # Post
                    </TableHead>
                    <TableHead className="min-w-[65px] w-[65px] text-center whitespace-nowrap text-[9px] px-1">
                      Total
                    </TableHead>
                    <TableHead className="min-w-[65px] w-[65px] text-center whitespace-nowrap text-[9px] px-1">
                      % cuentas
                    </TableHead>
                    <TableHead className="min-w-[65px] w-[65px] text-center whitespace-nowrap text-[9px] px-1">
                      Pts Perd
                    </TableHead>
                    <TableHead className="min-w-[65px] w-[65px] text-center whitespace-nowrap text-[9px] px-1 border-r">
                      Indice de la seccion
                    </TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.groupName}-${row.typeId}`} className="hover:bg-muted/50">
                  <TableCell className={`font-medium whitespace-nowrap sticky left-0 z-10 border-r ${getGroupRowShadeClass(row.groupName)}`}>
                    <span className="opacity-70 text-[9px] block uppercase tracking-wider">{row.groupName}</span>
                    <span>{row.typeName}</span>
                  </TableCell>
                  <TableCell className="text-center sticky left-[220px] bg-white dark:bg-slate-900 z-10 border-r">
                    {row.ponderation.toFixed(2)}
                  </TableCell>
                  {dateKeys.map((dateKey) => {
                    const metric = row.byDate[dateKey] || {
                      nonCompliant: 0,
                      total: 0,
                      badPct: 0,
                      ptsLost: 0,
                      groupPtsLost: 0,
                    };
                    return (
                      <React.Fragment key={`metrics-${row.groupName}-${row.typeId}-${dateKey}`}>
                        <TableCell className="text-center px-1 border-l">
                          {metric.nonCompliant.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-center px-1">
                          {metric.total.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-center px-1">
                          {metric.badPct.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-center px-1">
                          {metric.ptsLost.toFixed(2)}
                        </TableCell>
                        {row.isFirstInGroup ? (
                          <TableCell 
                            rowSpan={row.groupRowCount} 
                            className="text-center px-1 border-r bg-muted/30 font-bold align-middle"
                          >
                            {metric.groupPtsLost?.toFixed(2)}
                          </TableCell>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

