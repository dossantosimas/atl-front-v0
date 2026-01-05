export interface PlannedSignalData {
  id: number;
  plannedId?: number;
  planned_id?: number;
  subareaId?: number;
  subarea_id?: number;
  date: string; // YYYY-MM-DD
  value: number | string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface PlannedSignalDataSearchParams {
  plannedId?: number;
  subareaId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  week?: number; // 1-53
  year?: number; // Requerido si usas week
}

export interface CreatePlannedSignalDataDto {
  plannedId: number;
  subareaId: number;
  date: string; // YYYY-MM-DD
  value: string | null; // El valor debe ser string según la API
}

export interface UpdatePlannedSignalDataDto {
  value: string | null; // El valor debe ser string según la API
}

