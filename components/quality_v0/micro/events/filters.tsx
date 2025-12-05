"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
  eventTypeSelected: string | undefined;
  selectedMonth?: string | undefined;
  selectedWeek?: string | undefined;
  selectedYear?: number | undefined;
  onMonthChange?: (month: string | undefined) => void;
  onWeekChange?: (week: string | undefined) => void;
  onYearChange?: (year: number | undefined) => void;
}

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

/**
 * Calcula el número de semana del año para una fecha dada
 * Usa ISO 8601: semana comienza el lunes, primera semana es la que contiene el 4 de enero
 */
function getWeekOfYear(date: Date): number {
  // Crear una copia de la fecha para no modificar la original
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
  // Convertir a formato ISO (1 = lunes, 7 = domingo)
  const dayOfWeek = d.getDay() || 7;
  
  // Calcular el jueves de la semana (ISO 8601 usa el jueves como referencia)
  d.setDate(d.getDate() + 4 - dayOfWeek);
  
  // Obtener el 1 de enero del año de la semana
  const yearStart = new Date(d.getFullYear(), 0, 1);
  
  // Calcular el número de días desde el inicio del año
  const days = Math.floor((d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
  
  // Calcular el número de semana (redondeado hacia arriba)
  const weekNumber = Math.ceil((days + 1) / 7);
  
  return weekNumber;
}

/**
 * Obtiene todas las semanas del año que corresponden a un mes específico
 * Itera por todos los días del mes para capturar todas las semanas que tienen días en ese mes
 */
function getWeeksOfYearForMonth(year: number, month: number): number[] {
  const weeksSet = new Set<number>();
  
  // Obtener el primer y último día del mes
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  
  // Iterar por todos los días del mes y obtener su semana
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const weekNumber = getWeekOfYear(date);
    weeksSet.add(weekNumber);
  }
  
  // Convertir a array y ordenar
  return Array.from(weeksSet).sort((a, b) => a - b);
}

export function Filters({
  eventTypeSelected,
  selectedMonth: externalSelectedMonth,
  selectedWeek: externalSelectedWeek,
  selectedYear: externalSelectedYear,
  onMonthChange,
  onWeekChange,
  onYearChange,
}: FiltersProps) {
  const [internalMonth, setInternalMonth] = useState<string | undefined>();
  const [internalWeek, setInternalWeek] = useState<string | undefined>();
  const [internalYear, setInternalYear] = useState<number | undefined>();
  
  const selectedMonth = externalSelectedMonth ?? internalMonth;
  const selectedWeek = externalSelectedWeek ?? internalWeek;
  const selectedYear = externalSelectedYear ?? internalYear ?? new Date().getFullYear();

  const isMonthEnabled = !!eventTypeSelected;
  const isWeekEnabled = !!selectedMonth;

  // Generar años (últimos 5 años y próximos 2)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsList: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      yearsList.push(i);
    }
    return yearsList;
  }, []);

  const weeks = useMemo(() => {
    if (!selectedMonth || !selectedYear) return [];

    const monthNumber = parseInt(selectedMonth, 10);
    const weekNumbers = getWeeksOfYearForMonth(selectedYear, monthNumber);

    const weekOptions = weekNumbers.map((weekNum) => ({
      value: String(weekNum),
      label: `Semana ${weekNum}`,
    }));

    // Agregar opción "todos" al inicio
    return [
      { value: "all", label: "Todos" },
      ...weekOptions,
    ];
  }, [selectedMonth, selectedYear]);

  // Validar y resetear semana si no es válida para el mes/año actual
  useEffect(() => {
    if (selectedWeek && selectedMonth && selectedYear) {
      const monthNumber = parseInt(selectedMonth, 10);
      const weekNumbers = getWeeksOfYearForMonth(selectedYear, monthNumber);
      const weekNum = parseInt(selectedWeek, 10);
      
      if (!weekNumbers.includes(weekNum)) {
        // La semana seleccionada no es válida para este mes/año, resetear
        setInternalWeek(undefined);
        onWeekChange?.(undefined);
      }
    }
  }, [selectedMonth, selectedYear, selectedWeek, onWeekChange]);

  // Valor mostrado en el selector (si no hay semana seleccionada, mostrar "all" para "Todos")
  const displayWeekValue = selectedWeek || "all";

  // Reset cuando se deselecciona el event type
  useEffect(() => {
    if (!eventTypeSelected) {
      setInternalMonth(undefined);
      setInternalWeek(undefined);
      onMonthChange?.(undefined);
      onWeekChange?.(undefined);
    }
  }, [eventTypeSelected, onMonthChange, onWeekChange]);

  const handleMonthChange = (value: string) => {
    setInternalMonth(value);
    setInternalWeek(undefined);
    onMonthChange?.(value);
    onWeekChange?.(undefined);
  };

  const handleWeekChange = (value: string) => {
    // Si se selecciona "todos", pasar undefined para no filtrar por semana
    const weekValue = value === "all" ? undefined : value;
    setInternalWeek(weekValue);
    onWeekChange?.(weekValue);
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value, 10);
    setInternalYear(year);
    setInternalWeek(undefined); // Reset semana cuando cambia el año
    onYearChange?.(year);
    onWeekChange?.(undefined);
  };

  // Sincronizar estado interno con props externas
  useEffect(() => {
    if (externalSelectedMonth !== undefined) {
      setInternalMonth(externalSelectedMonth);
    }
  }, [externalSelectedMonth]);

  useEffect(() => {
    if (externalSelectedWeek !== undefined) {
      setInternalWeek(externalSelectedWeek);
    }
  }, [externalSelectedWeek]);

  useEffect(() => {
    if (externalSelectedYear !== undefined) {
      setInternalYear(externalSelectedYear);
    }
  }, [externalSelectedYear]);

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">mes</label>
        <Select
          value={selectedMonth}
          onValueChange={handleMonthChange}
          disabled={!isMonthEnabled}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">semana</label>
        <Select
          value={displayWeekValue}
          onValueChange={handleWeekChange}
          disabled={!isWeekEnabled}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week) => (
              <SelectItem key={week.value} value={week.value}>
                {week.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">año</label>
        <Select
          value={String(selectedYear)}
          onValueChange={handleYearChange}
          disabled={!isMonthEnabled}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="-" />
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
    </div>
  );
}

