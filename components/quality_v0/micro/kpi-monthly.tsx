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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMicroIndexMonth, getMicroIndexWeekBudget } from "@/lib/services/microindex-week.service";
import type { MicroIndexWeekDay, NonCompliantDetail, MicroIndexBudgetGroup } from "@/lib/types/microindex-week";

interface MonthlyKpiProps {
  qualityTypeId: number;
}

interface DailyMetric {
  nonCompliant: number;
  total: number;
  badPct: number;
  ptsLost: number;
  groupPtsLost?: number;
  details?: NonCompliantDetail[];
}

interface WeeklyMetric {
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
  weekly: WeeklyMetric;
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

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

function formatDateLabel(value: string, index: number): string {
  const date = new Date(value + "T12:00:00");
  const label = date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
  return `Semana ${index + 1} (${label})`;
}

function getGroupRowShadeClass(groupName: string): string {
  const palette = [
    "bg-[#E3F2FD] dark:bg-blue-900/40",
    "bg-[#E8F5E9] dark:bg-emerald-900/40",
    "bg-[#FFFDE7] dark:bg-amber-900/40",
    "bg-[#F3E5F5] dark:bg-violet-900/40",
    "bg-[#E0F7FA] dark:bg-cyan-900/40",
    "bg-[#FCE4EC] dark:bg-rose-900/40",
    "bg-[#F1F8E9] dark:bg-lime-900/40",
    "bg-[#FFF3E0] dark:bg-orange-900/40",
    "bg-[#E8EAF6] dark:bg-indigo-900/40",
    "bg-[#E0F2F1] dark:bg-teal-900/40",
    "bg-[#EFEBE9] dark:bg-brown-900/40",
    "bg-[#FAFAFA] dark:bg-gray-900/40",
  ];

  const normalized = groupName.toLowerCase().trim();
  const groupColorMap: Record<string, string> = {
    "agua proceso": palette[0],
    "cerveza brillante": palette[1],
    "fermentación": palette[3],
    "levadura": palette[5],
    "maduración": palette[7],
    "wort": palette[9],
  };

  if (groupColorMap[normalized]) return groupColorMap[normalized];
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) hash = (hash * 31 + normalized.charCodeAt(i));
  return palette[Math.abs(hash) % palette.length];
}

function parseMonthlyKpi(days: MicroIndexWeekDay[], budget: MicroIndexBudgetGroup[]): { 
  dateKeys: string[]; 
  rows: PiRow[]; 
  dailyTotalIndex: Record<string, number>;
  weeklyTotalIndex: number;
} {
  const flattened: FlatAnalysis[] = [];
  const detailsMap = new Map<string, NonCompliantDetail[]>();

  const dateKeys = Array.from(new Set(days.map((item) => item.date))).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  days.forEach((day) => {
    day.microIndexGroups.forEach((group) => {
      if (group.nonCompliantDetails) {
        group.nonCompliantDetails.forEach(detail => {
          const key = `${day.date}::${group.microIndexGroup}::${detail.typeId}`;
          const list = detailsMap.get(key) || [];
          list.push(detail);
          detailsMap.set(key, list);
        });
      }

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

  const rows: PiRow[] = [];
  budget.forEach(group => {
    group.analysisTypes.forEach(at => {
      const typeId = at.analysis_type_id;
      const groupName = group.micro_index_group;
      const typeName = at.analysis_type_name;
      const ponderation = at.weighted;
      
      const byDate: Record<string, DailyMetric> = {};
      let weeklyNonCompliant = 0;
      let weeklyTotal = 0;
      let weeklyPtsLost = 0;

      dateKeys.forEach(dateKey => {
        const entriesByDate = flattened.filter(f => f.date === dateKey && f.groupName === groupName && f.typeId === typeId);
        const nonCompliant = entriesByDate.reduce((sum, item) => sum + item.nonCompliantCount, 0);
        const compliant = entriesByDate.reduce((sum, item) => sum + item.compliantCount, 0);
        const total = nonCompliant + compliant;
        const badPct = total > 0 ? (nonCompliant / total) * 100 : 0;
        const ptsLost = ponderation * nonCompliant * 100;
        const details = detailsMap.get(`${dateKey}::${groupName}::${typeId}`);

        byDate[dateKey] = { nonCompliant, total, badPct, ptsLost, details };
        weeklyNonCompliant += nonCompliant;
        weeklyTotal += total;
        weeklyPtsLost += ptsLost;
      });

      rows.push({
        groupName, typeId, typeName, ponderation, byDate,
        weekly: {
          nonCompliant: weeklyNonCompliant,
          total: weeklyTotal,
          badPct: weeklyTotal - weeklyNonCompliant,
          ptsLost: weeklyPtsLost
        }
      });
    });
  });

  rows.sort((a, b) => {
    const groupSort = a.groupName.localeCompare(b.groupName, "es");
    if (groupSort !== 0) return groupSort;
    return a.typeName.localeCompare(b.typeName, "es");
  });

  const dailyTotalIndex: Record<string, number> = {};
  dateKeys.forEach((dateKey) => dailyTotalIndex[dateKey] = 1);
  let weeklyTotalIndexValue = 1;

  const groups = Array.from(new Set(rows.map((r) => r.groupName)));
  groups.forEach((groupName) => {
    const groupRows = rows.filter((r) => r.groupName === groupName);
    if (groupRows.length > 0) {
      groupRows[0].isFirstInGroup = true;
      groupRows[0].groupRowCount = groupRows.length;

      dateKeys.forEach((dateKey) => {
        const groupSum = groupRows.reduce((sum, row) => sum + (row.byDate[dateKey]?.ptsLost || 0), 0);
        const finalIndex = groupSum > 100 ? 0 : 100 - groupSum;
        groupRows.forEach((row) => row.byDate[dateKey].groupPtsLost = finalIndex);
        dailyTotalIndex[dateKey] *= finalIndex / 100;
      });

      const weeklyGroupSum = groupRows.reduce((sum, row) => sum + row.weekly.ptsLost, 0);
      const weeklyFinalIndex = weeklyGroupSum > 100 ? 0 : 100 - weeklyGroupSum;
      groupRows.forEach((row) => row.weekly.groupPtsLost = weeklyFinalIndex);
      weeklyTotalIndexValue *= weeklyFinalIndex / 100;
    }
  });

  dateKeys.forEach((dateKey) => dailyTotalIndex[dateKey] *= 100);
  const weeklyTotalIndex = weeklyTotalIndexValue * 100;

  return { dateKeys, rows, dailyTotalIndex, weeklyTotalIndex };
}

export function MonthlyKpi({ qualityTypeId }: MonthlyKpiProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<MicroIndexWeekDay[]>([]);
  const [budgetData, setBudgetData] = useState<MicroIndexBudgetGroup[]>([]);
  const { showError } = useToast();

  const years = useMemo(() => {
    const result: number[] = [];
    for (let year = currentYear - 5; year <= currentYear + 2; year += 1) result.push(year);
    return result;
  }, [currentYear]);

  const { dateKeys, rows, dailyTotalIndex, weeklyTotalIndex } = useMemo(() => parseMonthlyKpi(rawData, budgetData), [rawData, budgetData]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const [data, budget] = await Promise.all([
        getMicroIndexMonth(selectedYear, selectedMonth),
        getMicroIndexWeekBudget()
      ]);
      setRawData(data);
      setBudgetData(budget);
    } catch (error) {
      showError("Error al consultar KPI mensual", error);
      setRawData([]);
      setBudgetData([]);
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
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Año" /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">mes</label>
            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Mes" /></SelectTrigger>
              <SelectContent>{MONTHS.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={handleSearch} disabled={loading} className="h-10 px-3"><Search className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Consultando KPI mensual...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay datos para el año {selectedYear}, mes {selectedMonth}.</div>
        ) : (
          <div className="overflow-x-auto w-full border rounded-md">
            <Table className="min-w-[2500px] w-full text-[11px] border-separate border-spacing-0 table-fixed">
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-20">
                <TableRow>
                  <TableHead rowSpan={2} className="align-middle w-[60px] min-w-[60px] sticky left-0 bg-white dark:bg-slate-900 z-50 border-r border-b text-center p-0">Grupo</TableHead>
                  <TableHead rowSpan={2} className="align-middle w-[280px] min-w-[280px] sticky left-[60px] bg-white dark:bg-slate-900 z-40 border-r border-b px-2">Indicador (PI)</TableHead>
                  <TableHead rowSpan={2} className="align-middle w-[70px] min-w-[70px] text-center sticky left-[340px] bg-white dark:bg-slate-900 z-40 border-r border-b px-1">Pond.</TableHead>
                  {dateKeys.map((dk, idx) => (
                    <TableHead key={dk} colSpan={5} className="text-center whitespace-nowrap border-b border-r min-w-[500px]">{formatDateLabel(dk, idx)}</TableHead>
                  ))}
                  <TableHead colSpan={5} className="text-center whitespace-nowrap border-b bg-slate-50 dark:bg-slate-900/50 min-w-[500px]">Consolidado Mensual</TableHead>
                </TableRow>
                <TableRow>
                  {dateKeys.map((dk) => (
                    <React.Fragment key={`h-${dk}`}>
                      <TableHead className="min-w-[100px] w-[100px] text-center text-[9px] border-l"># Post</TableHead>
                      <TableHead className="min-w-[100px] w-[100px] text-center text-[9px]">Total</TableHead>
                      <TableHead className="min-w-[100px] w-[100px] text-center text-[9px]">% cuentas</TableHead>
                      <TableHead className="min-w-[100px] w-[100px] text-center text-[9px]">Pts Perd</TableHead>
                      <TableHead className="min-w-[100px] w-[100px] text-center text-[9px] border-r bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-tighter">Índice</TableHead>
                    </React.Fragment>
                  ))}
                  <TableHead className="min-w-[100px] w-[100px] text-center text-[9px] border-l bg-slate-50 dark:bg-slate-900/50"># Post</TableHead>
                  <TableHead className="min-w-[100px] w-[100px] text-center text-[9px] bg-slate-50 dark:bg-slate-900/50">Total</TableHead>
                  <TableHead className="min-w-[100px] w-[100px] text-center text-[9px] bg-slate-50 dark:bg-slate-900/50">% cuentas</TableHead>
                  <TableHead className="min-w-[100px] w-[100px] text-center text-[9px] bg-slate-50 dark:bg-slate-900/50">Pts Perd</TableHead>
                  <TableHead className="min-w-[100px] w-[100px] text-center text-[9px] border-r bg-slate-200 dark:bg-slate-700 font-bold uppercase tracking-tighter">Índice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => {
                  const isLast = idx === rows.length - 1 || rows[idx + 1].groupName !== row.groupName;
                  return (
                    <TableRow key={`${row.groupName}-${row.typeId}`} className={`hover:bg-muted/50 ${isLast ? "border-b-2 border-b-slate-400 dark:border-b-slate-500" : ""}`}>
                      {row.isFirstInGroup && (
                        <TableCell rowSpan={row.groupRowCount} className={`sticky left-0 z-20 border-r border-b font-bold text-center align-middle ${getGroupRowShadeClass(row.groupName)}`} style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
                          <span className="text-[10px] uppercase tracking-widest py-2">{row.groupName}</span>
                        </TableCell>
                      )}
                      <TableCell className={`font-medium sticky left-[60px] z-10 border-r border-b px-2 ${getGroupRowShadeClass(row.groupName)}`}>
                        <div className="truncate w-[264px]" title={row.typeName}>{row.typeName}</div>
                      </TableCell>
                      <TableCell className="text-center sticky left-[340px] bg-white dark:bg-slate-900 z-10 border-r border-b px-1">{row.ponderation.toFixed(2)}</TableCell>
                      {dateKeys.map((dk) => {
                        const m = row.byDate[dk] || { nonCompliant: 0, total: 0, badPct: 0, ptsLost: 0, groupPtsLost: 0 };
                        return (
                          <React.Fragment key={`m-${row.groupName}-${row.typeId}-${dk}`}>
                            <TableCell className={`text-center border-l ${m.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
                              {m.details && m.details.length > 0 ? (
                                <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="cursor-help underline decoration-dotted text-red-600 font-bold">{m.nonCompliant.toFixed(0)}</span></TooltipTrigger>
                                <TooltipContent className="p-3 space-y-2 max-w-[300px]"><p className="font-bold text-xs border-b pb-1 mb-1 uppercase">Detalles No Cumplimiento</p>
                                {m.details.map((d, i) => <div key={i} className="text-[10px] border-b last:border-0 pb-1 last:pb-0"><div className="flex justify-between gap-2"><span className="text-muted-foreground italic">{d.microTypeName}</span><span className="font-bold">{d.elementName}</span></div><div className="flex justify-between gap-2"><span>Valor:</span><span className="text-red-500 font-bold">{d.value}</span></div></div>)}
                                </TooltipContent></Tooltip></TooltipProvider>
                              ) : m.nonCompliant.toFixed(0)}
                            </TableCell>
                            <TableCell className={`text-center ${m.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>{m.total.toFixed(0)}</TableCell>
                            <TableCell className={`text-center ${m.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>{m.badPct.toFixed(2)}%</TableCell>
                            <TableCell className={`text-center ${m.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>{m.ptsLost.toFixed(2)}</TableCell>
                            {row.isFirstInGroup && <TableCell rowSpan={row.groupRowCount} className="text-center border-r bg-slate-100 dark:bg-slate-800 font-bold align-middle p-0">{m.groupPtsLost?.toFixed(2)}</TableCell>}
                          </React.Fragment>
                        );
                      })}
                      <TableCell className={`text-center border-l bg-slate-50/50 ${row.weekly.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>{row.weekly.nonCompliant.toFixed(0)}</TableCell>
                      <TableCell className={`text-center bg-slate-50/50 ${row.weekly.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>{row.weekly.total.toFixed(0)}</TableCell>
                      <TableCell className={`text-center bg-slate-50/50 ${row.weekly.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>{row.weekly.badPct.toFixed(0)}</TableCell>
                      <TableCell className={`text-center bg-slate-50/50 ${row.weekly.nonCompliant > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}`}>{row.weekly.ptsLost.toFixed(2)}</TableCell>
                      {row.isFirstInGroup && <TableCell rowSpan={row.groupRowCount} className="text-center border-r bg-slate-200 dark:bg-slate-700 font-bold align-middle p-0">{row.weekly.groupPtsLost?.toFixed(2)}</TableCell>}
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter className="sticky bottom-0 bg-white dark:bg-slate-900 z-20 font-bold">
                <TableRow>
                  <TableCell className="sticky left-0 bg-white dark:bg-slate-900 z-50 border-r border-b text-[10px]" colSpan={3}>Indice Total Mensual</TableCell>
                  {dateKeys.map((dk) => (
                    <React.Fragment key={`f-${dk}`}>
                      <TableCell className="text-center border-l" colSpan={4}>-</TableCell>
                      <TableCell className={`text-center border-r font-black ${(dailyTotalIndex[dk] ?? 0) < 95 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>{dailyTotalIndex[dk]?.toFixed(2)}</TableCell>
                    </React.Fragment>
                  ))}
                  <TableCell className="text-center border-l bg-slate-100 dark:bg-slate-800" colSpan={4}>-</TableCell>
                  <TableCell className={`text-center border-r font-black ${(weeklyTotalIndex ?? 0) < 95 ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>{weeklyTotalIndex.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
