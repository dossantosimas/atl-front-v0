import type { Planning } from "./planning";

export interface DepartmentInfo {
  id: number;
  name: string;
}

export interface Subarea {
  id: number;
  name: string;
  departmentId: number;
  department: DepartmentInfo;
  plannings: Planning[];
}

// Respuesta de la API /departments?planningId=X
export interface SubareaResponse {
  id: number;
  name: string;
  departmentId: number;
  department: DepartmentInfo;
  plannings: Planning[];
}

// Estructura agrupada para la tabla (sin plannings en subareas)
export interface Department {
  id: number;
  name: string;
  subareas: {
    id: number;
    name: string;
    departmentId: number;
  }[];
}

