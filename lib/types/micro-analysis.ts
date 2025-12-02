export interface AnalysisType {
  id: string;
  name: string;
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=" | null;
  threshold: string | null;
  code: string;
}

export interface MicroAnalysis {
  id: number;
  name: string;
  code: string;
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=";
  value?: string | null;
  threshold?: string | null;
  type_id: string; // snake_case como viene del API
  created?: string;
  updated?: string;
}

export interface CreateMicroAnalysisDto {
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=";
  eventId: number;
  typeId: string;
  value?: string;
  name?: string;
  code?: string;
  threshold?: string | null;
}

