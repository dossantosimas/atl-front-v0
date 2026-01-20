import axios from "axios";
import type { Department } from "../types/departments";
import type { Subarea } from "../types/chemical-substances";
import { env } from "@/config/env";

// ==================== DTOs ====================
export interface CreateDepartmentDto {
  name: string;
  plantId?: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  plantId?: number;
}

export interface CreateSubareaDto {
  name: string;
  departmentId: number;
}

export interface UpdateSubareaDto {
  name?: string;
  departmentId?: number;
}

/**
 * Obtiene departamentos con sus subáreas por planning ID
 * Ruta: GET /planning/:planningId/departments-subareas
 */
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

/**
 * Obtiene todos los departamentos con sus subáreas
 * Ruta: GET /departments
 * Respuesta esperada: Department[] (departamentos con sus subáreas)
 */
export async function getAllDepartments(): Promise<Department[]> {
  try {
    const response = await axios.get<Department[]>(
      `${env.BASE_URL}/departments`
    );
    
    // Mapear y ordenar las subareas alfabéticamente
    return response.data.map((dept) => ({
      id: dept.id,
      name: dept.name,
      subareas: (dept.subareas || [])
        .map((subarea) => ({
          id: subarea.id,
          name: subarea.name,
          departmentId: subarea.departmentId,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })),
    }));
  } catch (error) {
    console.error("Error fetching all departments:", error);
    throw error;
  }
}

/**
 * Obtiene todas las subáreas
 * Ruta: GET /subareas
 * Respuesta esperada: Subarea[]
 */
export async function getAllSubareas(): Promise<Subarea[]> {
  try {
    const response = await axios.get<Subarea[]>(
      `${env.BASE_URL}/subareas`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subareas:", error);
    throw error;
  }
}

/**
 * Obtiene subáreas filtradas por departamento
 * Ruta: GET /departments/:id/subareas
 * Respuesta esperada: Subarea[]
 */
export async function getSubareasByDepartment(departmentId: number): Promise<Subarea[]> {
  if (!departmentId || departmentId <= 0) {
    throw new Error("El ID del departamento debe ser un número válido");
  }
  
  try {
    const url = `${env.BASE_URL}/departments/${departmentId}/subareas`;
    const response = await axios.get<Subarea[]>(url);
    return response.data.sort((a, b) => 
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.error(`Departamento con ID ${departmentId} no encontrado`);
        throw new Error(`El departamento con ID ${departmentId} no existe`);
      }
      console.error(`Error fetching subareas by department (${departmentId}):`, error.response?.status, error.response?.statusText);
    } else {
      console.error("Error fetching subareas by department:", error);
    }
    throw error;
  }
}

// ==================== CRUD Departamentos ====================

export async function getDepartmentById(id: number): Promise<Department> {
  try {
    const response = await axios.get<Department>(
      `${env.BASE_URL}/departments/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching department by id:", error);
    throw error;
  }
}

export async function createDepartment(data: CreateDepartmentDto): Promise<Department> {
  try {
    const response = await axios.post<Department>(
      `${env.BASE_URL}/departments`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
}

export async function updateDepartment(
  id: number,
  data: UpdateDepartmentDto
): Promise<Department> {
  try {
    const response = await axios.put<Department>(
      `${env.BASE_URL}/departments/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
}

export async function deleteDepartment(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/departments/${id}`);
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
}

// ==================== CRUD Subáreas ====================

export async function getSubareaById(id: number): Promise<Subarea> {
  try {
    const response = await axios.get<Subarea>(
      `${env.BASE_URL}/subareas/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subarea by id:", error);
    throw error;
  }
}

export async function createSubarea(data: CreateSubareaDto): Promise<Subarea> {
  try {
    const response = await axios.post<Subarea>(
      `${env.BASE_URL}/subareas`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating subarea:", error);
    throw error;
  }
}

export async function updateSubarea(
  id: number,
  data: UpdateSubareaDto
): Promise<Subarea> {
  try {
    const response = await axios.put<Subarea>(
      `${env.BASE_URL}/subareas/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subarea:", error);
    throw error;
  }
}

export async function deleteSubarea(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/subareas/${id}`);
  } catch (error) {
    console.error("Error deleting subarea:", error);
    throw error;
  }
}

