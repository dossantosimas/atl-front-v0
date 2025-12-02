import type { MicroType } from "./micro-types";
import type { MicroElement } from "./micro-elements";

export interface MicroSchedule {
  id: number;
  name: string;
  eventType: MicroType;
  frequency: string; // Expresión cron: "0 * * * *" (cada hora), "0 8 * * *" (cada día a las 8am)
  description: string | null;
  isActive: boolean;
  lastRun: string | null; // ISO string date
  runCount: number;
  elementIds: string | null; // IDs de MicroElements separados por coma
  timezone: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  elements?: MicroElement[]; // Elementos asociados (viene de la API)
}

export interface CreateMicroScheduleDto {
  name: string;
  eventTypeId: string;
  frequency: string;
  description?: string | null;
  isActive?: boolean;
  elementIds?: number[] | null;
  timezone?: string;
}

export interface UpdateMicroScheduleDto extends Partial<CreateMicroScheduleDto> {}

