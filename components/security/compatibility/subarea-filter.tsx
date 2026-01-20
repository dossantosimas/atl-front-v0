"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllDepartments,
  getSubareasByDepartment,
} from "@/lib/services/departments.service";
import type { Subarea } from "@/lib/types/chemical-substances";
import type { Department } from "@/lib/types/departments";
import { Loader2 } from "lucide-react";

interface SubareaFilterProps {
  selectedDepartmentId: number | null;
  selectedSubareaId: number | null;
  onDepartmentChange: (departmentId: number | null) => void;
  onSubareaChange: (subareaId: number | null) => void;
}

export function SubareaFilter({
  selectedDepartmentId,
  selectedSubareaId,
  onDepartmentChange,
  onSubareaChange,
}: SubareaFilterProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSubareas, setLoadingSubareas] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadSubareas();
    } else {
      setSubareas([]);
      onSubareaChange(null);
    }
  }, [selectedDepartmentId]);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadSubareas = async () => {
    if (!selectedDepartmentId) return;
    try {
      setLoadingSubareas(true);
      const data = await getSubareasByDepartment(selectedDepartmentId);
      setSubareas(data);
    } catch (error) {
      console.error("Error loading subareas:", error);
      setSubareas([]);
    } finally {
      setLoadingSubareas(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Selector de Departamento */}
      <div className="flex-1">
        <label htmlFor="department-filter" className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Departamento:
        </label>
        <Select
          value={selectedDepartmentId?.toString() || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onDepartmentChange(null);
            } else {
              onDepartmentChange(parseInt(value, 10));
            }
          }}
        >
          <SelectTrigger id="department-filter" className="w-full">
            {loadingDepartments ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <SelectValue placeholder="Todos los departamentos" />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Subárea */}
      <div className="flex-1">
        <label htmlFor="subarea-filter" className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Subárea:
        </label>
        <Select
          value={selectedSubareaId?.toString() || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onSubareaChange(null);
            } else {
              onSubareaChange(parseInt(value, 10));
            }
          }}
          disabled={false}
        >
          <SelectTrigger id="subarea-filter" className="w-full">
            {loadingSubareas ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : (
              <SelectValue placeholder="Todas las subáreas" />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las subáreas</SelectItem>
            {subareas.map((subarea) => (
              <SelectItem key={subarea.id} value={subarea.id.toString()}>
                {subarea.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
