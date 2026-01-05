"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface FiltersProps {
  onFilterChange: (filters: {
    year: number;
    month: string;
    week: number | null;
  }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<string>(currentMonth);
  const [week, setWeek] = useState<number | null>(null);

  // Función para obtener el número de semana del año (ISO 8601)
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Calcular semanas del año que intersectan con el mes seleccionado
  const getWeeksForMonth = (year: number, month: string): number[] => {
    const monthNum = parseInt(month, 10);
    const lastDay = new Date(year, monthNum, 0);
    
    // Obtener todas las semanas únicas que intersectan con el mes
    const weeksSet = new Set<number>();
    
    // Iterar por todos los días del mes y obtener sus semanas
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, monthNum - 1, day);
      const weekNum = getWeekNumber(currentDate);
      weeksSet.add(weekNum);
    }
    
    const weeks = Array.from(weeksSet).sort((a, b) => a - b);
    
    return weeks;
  };

  const availableWeeks = getWeeksForMonth(year, month);

  useEffect(() => {
    onFilterChange({ year, month, week });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, week]);

  // Generar años (últimos 5 años y próximos 2)
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push(i);
  }

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Año
        </label>
        <Select
          value={String(year)}
          onValueChange={(value) => {
            setYear(parseInt(value, 10));
            setWeek(null); // Reset semana al cambiar año
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mes
        </label>
        <Select
          value={month}
          onValueChange={(value) => {
            setMonth(value);
            setWeek(null); // Reset semana al cambiar mes
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Semana
        </label>
        <Select
          value={week ? String(week) : "all"}
          onValueChange={(value) => setWeek(value === "all" ? null : parseInt(value, 10))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {availableWeeks.map((w) => (
              <SelectItem key={w} value={String(w)}>
                Semana {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

