"use client";

import { useState, useEffect } from "react";
import { Filters } from "./filters";
import { PlanningTable } from "./planning-table";
import { getDepartmentsByPlanning } from "@/lib/services/departments.service";
import type { Department } from "@/lib/types/departments";

interface PlanningViewProps {
  planningId: number;
}

export function PlanningView({ planningId }: PlanningViewProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    year: number;
    month: string;
    week: number | null;
  }>({
    year: new Date().getFullYear(),
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
    week: null,
  });

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const data = await getDepartmentsByPlanning(planningId);
        setDepartments(data);
      } catch (error) {
        console.error("Error loading departments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartments();
  }, [planningId]);

  const handleFilterChange = (newFilters: {
    year: number;
    month: string;
    week: number | null;
  }) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-300">Cargando departamentos...</div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Filters onFilterChange={handleFilterChange} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center text-gray-600 dark:text-gray-300 py-8">
            No se encontraron departamentos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <Filters onFilterChange={handleFilterChange} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
        <PlanningTable
          planningId={planningId}
          departments={departments}
          year={filters.year}
          month={filters.month}
          week={filters.week}
        />
      </div>
    </div>
  );
}

