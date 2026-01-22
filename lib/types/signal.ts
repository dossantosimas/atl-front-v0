export interface Signal {
  id: number;
  name: string;
  description?: string | null;
  deviceId?: number | null;
  sourceDataId?: number | null; // legacy - usar influxId
  influxId?: number | null; // ID de SourceData (Influx)
  pyRun?: string | null;
  enabled?: boolean;
  enable?: boolean; // legacy
  desc?: string | null; // legacy
  tag?: string | null;
  influxQuery?: string | null; // legacy - string de consulta (mantener para compatibilidad)
  influxParameter?: Record<string, any> | null;
  level?: number | null;
  plannedId?: number | null;
  // Objeto completo de Device con relaciones jerárquicas
  device?: {
    id: number;
    name: string;
    equipmentId?: number;
    equipment?: {
      id: number;
      name: string;
      subareaId?: number;
      subarea?: {
        id: number;
        name: string;
        departmentId?: number;
        department?: {
          id: number;
          name: string;
        };
      };
    };
  } | null;
  // Objeto completo de SourceData (Influx) con todos los campos incluyendo name
  influx?: {
    id: number;
    name: string;
    url: string;
    user: string;
    token: string;
    bucket: string;
    nameInfo?: string | null;
  } | null;
  sourceData?: {
    id: number;
    name: string;
  } | null; // legacy - mantener compatibilidad
  // Objeto de Planning si existe
  planning?: {
    id: number;
    name?: string;
    // otros campos de planning si existen
  } | null;
  createdAt?: string;
  updatedAt?: string;
  config?: any;
}

export interface CreateSignalDto {
  name: string;
  description?: string;
  deviceId?: number;
  sourceDataId?: number;
  pyRun?: string;
  enabled?: boolean;
  enable?: boolean;
  desc?: string;
  tag?: string;
  influx?: string;
  influxParameter?: Record<string, any>;
  level?: number;
  plannedId?: number;
  config?: any;
}

export interface UpdateSignalDto {
  name?: string;
  description?: string;
  deviceId?: number;
  sourceDataId?: number;
  pyRun?: string;
  enabled?: boolean;
  enable?: boolean;
  desc?: string;
  tag?: string;
  influx?: string;
  influxParameter?: Record<string, any>;
  level?: number;
  plannedId?: number;
  config?: any;
}

