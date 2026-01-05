"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { Department } from "@/lib/types/departments";
import type { PlannedSignalData } from "@/lib/types/planned-signal-data";
import {
  getPlannedSignalData,
  createPlannedSignalData,
  updatePlannedSignalData,
} from "@/lib/services/planned-signal-data.service";

interface PlanningTableProps {
  planningId: number;
  departments: Department[];
  year: number;
  month: string;
  week: number | null;
}

export function PlanningTable({
  planningId,
  departments,
  year,
  month,
  week,
}: PlanningTableProps) {
  const [dataMap, setDataMap] = useState<Map<string, PlannedSignalData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  // Función para obtener el número de semana del año (ISO 8601)
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Obtener el primer día de una semana del año
  const getFirstDayOfWeek = (year: number, week: number): Date => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  };

  // Obtener los días del mes o de la semana con sus fechas completas
  const getDays = (): Date[] => {
    const monthNum = parseInt(month, 10);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    
    if (week) {
      // Si hay semana seleccionada, mostrar TODOS los 7 días de esa semana
      // incluso si algunos pertenecen a meses o años diferentes
      const firstDayOfWeek = getFirstDayOfWeek(year, week);
      const days: Date[] = [];
      
      // Obtener los 7 días completos de la semana
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(firstDayOfWeek);
        currentDate.setDate(firstDayOfWeek.getDate() + i);
        days.push(currentDate);
      }
      
      return days;
    }
    
    // Si no hay semana, mostrar todos los días del mes
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthNum - 1, i + 1));
  };

  const days = getDays();

  // Formatear fecha para mostrar
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formatear fecha para API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Crear clave única para cada celda (subareaId-date)
  const getCellKey = (subareaId: number, date: Date): string => {
    return `${subareaId}-${formatDateForAPI(date)}`;
  };

  // Función para recargar datos
  const reloadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        plannedId: planningId,
      };

      if (week) {
        params.week = week;
        params.year = year;
      } else {
        // Si no hay semana, usar rango de fechas del mes
        const monthNum = parseInt(month, 10);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);
        params.startDate = formatDateForAPI(startDate);
        params.endDate = formatDateForAPI(endDate);
      }

      const allData = await getPlannedSignalData(params);
      
      console.log("Params sent to API:", params);
      console.log("Data received from API:", allData);
      console.log("Number of records:", allData.length);
      
      // Crear mapa de datos por clave (subareaId-date)
      const newDataMap = new Map<string, PlannedSignalData>();
      allData.forEach((item) => {
        // Normalizar la fecha para asegurar que coincida con el formato YYYY-MM-DD
        const normalizedDate = item.date.split('T')[0]; // Remover hora si existe
        // Usar subarea_id o subareaId según lo que venga de la API
        const subareaId = item.subarea_id ?? item.subareaId ?? 0;
        const key = `${subareaId}-${normalizedDate}`;
        newDataMap.set(key, item);
        console.log(`Mapped: subareaId=${subareaId}, date=${item.date}, normalized=${normalizedDate}, key=${key}`);
      });
      
      console.log("Data map keys:", Array.from(newDataMap.keys()));
      setDataMap(newDataMap);
    } catch (error) {
      console.error("Error reloading data:", error);
    } finally {
      setLoading(false);
    }
  }, [planningId, year, month, week]);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Obtener valor para una celda específica
  const getCellValue = (subareaId: number, date: Date): number | null => {
    const key = getCellKey(subareaId, date);
    const data = dataMap.get(key);
    if (data) {
      // Convertir el valor a número si viene como string
      const value = data.value;
      if (value === null || value === undefined) {
        return null;
      }
      if (typeof value === 'string') {
        const numValue = parseFloat(value);
        return isNaN(numValue) ? null : numValue;
      }
      return typeof value === 'number' ? value : null;
    }
    return null;
  };

  // Obtener el registro completo para una celda
  const getCellData = (subareaId: number, date: Date): PlannedSignalData | null => {
    const key = getCellKey(subareaId, date);
    return dataMap.get(key) ?? null;
  };

  // Manejar inicio de edición
  const handleCellClick = (subareaId: number, date: Date) => {
    const value = getCellValue(subareaId, date);
    const key = getCellKey(subareaId, date);
    setEditingCell(key);
    setEditValue(value !== null ? String(value) : "");
  };

  // Manejar guardado de edición
  const handleCellSave = async (subareaId: number, date: Date) => {
    const key = getCellKey(subareaId, date);
    const currentData = getCellData(subareaId, date);
    const numericValue = editValue.trim() === "" ? null : parseFloat(editValue);

    // Validar que el valor sea un número válido si no es null
    if (numericValue !== null && (isNaN(numericValue) || !isFinite(numericValue))) {
      console.error("Invalid numeric value:", editValue);
      setEditingCell(null);
      return;
    }

    try {
      let updatedData: PlannedSignalData;
      
      if (currentData) {
        // Actualizar registro existente
        // El valor debe ser enviado como string según la API
        updatedData = await updatePlannedSignalData(currentData.id, {
          value: numericValue !== null ? String(numericValue) : null,
        });
      } else {
        // Crear nuevo registro
        // El valor debe ser enviado como string según la API
        const createData = {
          plannedId: planningId,
          subareaId: subareaId,
          date: formatDateForAPI(date),
          value: numericValue !== null ? String(numericValue) : null,
        };
        console.log("Attempting to create with data:", createData);
        updatedData = await createPlannedSignalData(createData);
      }
      
      // Actualizar solo la celda afectada en el estado local
      const normalizedDate = updatedData.date.split('T')[0];
      const dataSubareaId = (updatedData as any).subarea_id ?? updatedData.subareaId ?? subareaId;
      const key = `${dataSubareaId}-${normalizedDate}`;
      
      setDataMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(key, updatedData);
        return newMap;
      });
      
      setEditingCell(null);
    } catch (error: any) {
      console.error("Error saving cell value:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Error al guardar: ${error.response.data?.message || JSON.stringify(error.response.data)}`);
      } else {
        alert("Error al guardar el valor. Por favor, intenta nuevamente.");
      }
      setEditingCell(null);
    }
  };

  // Manejar cancelar edición
  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Calcular subtotal por departamento
  const getDepartmentSubtotal = (department: Department, date: Date): number => {
    let subtotal = 0;
    department.subareas.forEach((subarea) => {
      const value = getCellValue(subarea.id, date);
      if (value !== null) {
        subtotal += value;
      }
    });
    return subtotal;
  };

  // Calcular totales por fila
  const getRowTotal = (date: Date): number => {
    let total = 0;
    departments.forEach((department) => {
      total += getDepartmentSubtotal(department, date);
    });
    return total;
  };

  // Formatear número para mostrar
  const formatNumber = (value: number): string => {
    if (value === 0) return "0.0";
    return value.toFixed(1);
  };

  // Calcular el número total de columnas
  const totalColumns = departments.reduce((sum, dept) => sum + dept.subareas.length + 1, 0) + 2; // subareas + subtotales + día + total
  const columnWidth = `${100 / totalColumns}%`;

  return (
    <div className="w-full border rounded-lg">
      <div className="w-full">
        <table className="w-full caption-bottom text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead className="[&_tr]:border-b">
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="bg-gray-50 dark:bg-gray-800 z-20 border-r-2" style={{ width: columnWidth }}>
              Día
            </TableHead>
            {departments.map((department) => (
              <React.Fragment key={department.id}>
                <TableHead
                  colSpan={department.subareas.length}
                  className="text-center border-r-2 bg-gray-50 dark:bg-gray-800 whitespace-normal"
                  style={{ width: `${(department.subareas.length * 100) / totalColumns}%` }}
                >
                  <div className="px-1 py-1 break-words leading-tight">
                    {department.name}
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold bg-gray-50 dark:bg-gray-800 border-r-2" style={{ width: columnWidth }}>
                  Subtotal
                </TableHead>
              </React.Fragment>
            ))}
            <TableHead className="text-center font-bold bg-gray-50 dark:bg-gray-800" style={{ width: columnWidth }}>
              Total
            </TableHead>
          </TableRow>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="bg-gray-50 dark:bg-gray-800 z-20 border-r-2"></TableHead>
            {departments.map((department) => (
              <React.Fragment key={department.id}>
                {department.subareas.map((subarea) => (
                  <TableHead
                    key={subarea.id}
                    className="text-center text-xs font-normal border-r bg-gray-50 dark:bg-gray-800 whitespace-normal"
                    style={{ width: columnWidth }}
                  >
                    <div className="px-1 py-1 break-words leading-tight">
                      {subarea.name}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center bg-gray-50 dark:bg-gray-800 border-r-2"></TableHead>
              </React.Fragment>
            ))}
            <TableHead className="text-center bg-gray-50 dark:bg-gray-800"></TableHead>
          </TableRow>
        </thead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={departments.reduce((sum, dept) => sum + dept.subareas.length + 1, 0) + 2} className="text-center py-8">
                <div className="text-gray-600 dark:text-gray-300">Cargando datos...</div>
              </TableCell>
            </TableRow>
          ) : (
            days.map((day, index) => {
              const dayKey = `day-${day.getTime()}-${index}`;
              return (
                <TableRow key={dayKey} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="bg-white dark:bg-gray-900 z-10 font-medium border-r-2">
                    {formatDate(day)}
                  </TableCell>
                  {departments.map((department) => (
                    <React.Fragment key={department.id}>
                      {department.subareas.map((subarea) => {
                        const cellKey = getCellKey(subarea.id, day);
                        const isEditing = editingCell === cellKey;
                        const value = getCellValue(subarea.id, day);

                        return (
                          <TableCell
                            key={subarea.id}
                            className="text-center border-r min-h-[40px] p-1"
                            onClick={() => !isEditing && handleCellClick(subarea.id, day)}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => handleCellSave(subarea.id, day)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleCellSave(subarea.id, day);
                                    } else if (e.key === "Escape") {
                                      handleCellCancel();
                                    }
                                  }}
                                  className="h-8 w-full text-center text-sm"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
                                {value !== null ? formatNumber(value) : "-"}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium border-r-2">
                        {formatNumber(getDepartmentSubtotal(department, day))}
                      </TableCell>
                    </React.Fragment>
                  ))}
                  <TableCell className="text-center font-bold">
                    {formatNumber(getRowTotal(day))}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        </table>
      </div>
    </div>
  );
}

