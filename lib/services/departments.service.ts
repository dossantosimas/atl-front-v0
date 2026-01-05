import axios from "axios";
import type { Department } from "../types/departments";
import { env } from "@/config/env";

export async function getDepartmentsByPlanning(planningId: number): Promise<Department[]> {
  try {
    const response = await axios.get<Department[]>(
      `${env.BASE_URL}/planning/${planningId}/departments-subareas`
    );
    
    // La API ya devuelve los departamentos agrupados con sus subareas
    // Mapear la estructura y ordenar las subareas alfabéticamente
    return response.data.map((dept) => ({
      id: dept.id,
      name: dept.name,
      subareas: dept.subareas
        .map((subarea) => ({
          id: subarea.id,
          name: subarea.name,
          departmentId: subarea.departmentId,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })),
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
}

