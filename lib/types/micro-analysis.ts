export interface AnalysisTypeEvent {
  id: string;
  name: string;
  start: string;
  end: string;
  description: string;
}

export interface AnalysisType {
  id: string;
  name: string;
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=" | "between" | null;
  threshold: string | null;
  code: string;
  weighted?: number | null;
  microIndexOn?: boolean;
  events?: AnalysisTypeEvent[];
}

export interface MicroAnalysis {
  id: number;
  name: string;
  code: string;
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=" | "between";
  value?: string | null;
  threshold?: string | null;
  type_id: string; // snake_case como viene del API
  created?: string;
  updated?: string;
}

export interface CreateMicroAnalysisDto {
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=" | "between";
  eventId: number;
  typeId: string;
  value?: string;
  name?: string;
  code?: string;
  threshold?: string | null;
  createdAt?: string;
}

