"use client";

import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { FrequencyConfig } from "@/lib/utils/cron-builder";
import { parseCronToConfig, buildCronExpression } from "@/lib/utils/cron-builder";

interface FrequencyConfiguratorProps {
  value: string; // Expresión cron
  onChange: (cronExpression: string) => void;
  onConfigChange?: (config: FrequencyConfig | null) => void;
}

export function FrequencyConfigurator({
  value,
  onChange,
  onConfigChange,
}: FrequencyConfiguratorProps) {
  const [type, setType] = useState<FrequencyConfig["type"]>("minutes");
  const [interval, setInterval] = useState<number>(1);
  const [time, setTime] = useState<string>("00:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const isInitialized = useRef(false);
  const isUpdatingFromValue = useRef(false);

  // Inicializar con un cron por defecto si no hay value
  useEffect(() => {
    if (!value) {
      isInitialized.current = true;
      isUpdatingFromValue.current = true;
      const defaultConfig: FrequencyConfig = { type: "minutes", interval: 1 };
      try {
        const defaultCron = buildCronExpression(defaultConfig);
        onChange(defaultCron);
        setTimeout(() => {
          isUpdatingFromValue.current = false;
        }, 0);
      } catch (error) {
        console.error("Error generando cron por defecto:", error);
        isUpdatingFromValue.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Cargar configuración desde el cron cuando cambia el value (solo cuando viene del exterior)
  useEffect(() => {
    if (value && !isUpdatingFromValue.current) {
      const parsed = parseCronToConfig(value);
      if (parsed) {
        isUpdatingFromValue.current = true;
        setType(parsed.type);
        if (parsed.interval) setInterval(parsed.interval);
        if (parsed.time) setTime(parsed.time);
        if (parsed.dayOfWeek !== undefined) setDayOfWeek(parsed.dayOfWeek);
        if (parsed.dayOfMonth !== undefined) setDayOfMonth(parsed.dayOfMonth);
        if (parsed.month !== undefined) setMonth(parsed.month);
        if (onConfigChange) onConfigChange(parsed);
        isInitialized.current = true;
        setTimeout(() => {
          isUpdatingFromValue.current = false;
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Generar cron cuando cambia la configuración (solo si ya está inicializado)
  useEffect(() => {
    if (!isInitialized.current || isUpdatingFromValue.current) {
      return;
    }

    try {
      const newConfig: FrequencyConfig = {
        type,
        ...(type === "seconds" || type === "minutes" || type === "hours" ? { interval } : {}),
        ...(type === "daily" || type === "weekly" || type === "monthly" ? { time } : {}),
        ...(type === "weekly" ? { dayOfWeek } : {}),
        ...(type === "monthly" ? { dayOfMonth, ...(month !== undefined ? { month } : {}) } : {}),
      };

      const cronExpression = buildCronExpression(newConfig);
      if (cronExpression && cronExpression !== value) {
        isUpdatingFromValue.current = true;
        onChange(cronExpression);
        if (onConfigChange) onConfigChange(newConfig);
        setTimeout(() => {
          isUpdatingFromValue.current = false;
        }, 0);
      }
    } catch (error) {
      // Ignorar errores de validación mientras el usuario está escribiendo
    }
  }, [type, interval, time, dayOfWeek, dayOfMonth, month, onChange, onConfigChange, value]);

  const dayNames = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
          Tipo de Frecuencia *
        </label>
        <Select value={type} onValueChange={(v) => setType(v as FrequencyConfig["type"])}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Cada X segundos</SelectItem>
            <SelectItem value="minutes">Cada X minutos</SelectItem>
            <SelectItem value="hours">Cada X horas</SelectItem>
            <SelectItem value="daily">Diario a una hora específica</SelectItem>
            <SelectItem value="weekly">Semanal en un día específico</SelectItem>
            <SelectItem value="monthly">Mensual en un día específico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(type === "seconds" || type === "minutes" || type === "hours") && (
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
            Intervalo *
          </label>
          <Input
            type="number"
            min="1"
            value={interval}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                setInterval(val);
              }
            }}
            placeholder={type === "seconds" ? "Ej: 30" : type === "minutes" ? "Ej: 15" : "Ej: 2"}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {type === "seconds" && "Ejecutar cada X segundos"}
            {type === "minutes" && "Ejecutar cada X minutos"}
            {type === "hours" && "Ejecutar cada X horas"}
          </p>
        </div>
      )}

      {(type === "daily" || type === "weekly" || type === "monthly") && (
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
            Hora *
          </label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Hora a la que se ejecutará el schedule
          </p>
        </div>
      )}

      {type === "weekly" && (
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
            Día de la Semana *
          </label>
          <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(parseInt(v, 10))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dayNames.map((day) => (
                <SelectItem key={day.value} value={String(day.value)}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "monthly" && (
        <>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Día del Mes *
            </label>
            <Input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= 31) {
                  setDayOfMonth(val);
                }
              }}
              placeholder="Ej: 1 (primer día del mes)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Día del mes en que se ejecutará (1-31)
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Mes (Opcional)
            </label>
            <Select 
              value={month ? String(month) : "all"} 
              onValueChange={(v) => setMonth(v === "all" ? undefined : parseInt(v, 10))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                <SelectItem value="1">Enero</SelectItem>
                <SelectItem value="2">Febrero</SelectItem>
                <SelectItem value="3">Marzo</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Mayo</SelectItem>
                <SelectItem value="6">Junio</SelectItem>
                <SelectItem value="7">Julio</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Septiembre</SelectItem>
                <SelectItem value="10">Octubre</SelectItem>
                <SelectItem value="11">Noviembre</SelectItem>
                <SelectItem value="12">Diciembre</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Si no se especifica, se ejecutará todos los meses
            </p>
          </div>
        </>
      )}
    </div>
  );
}

