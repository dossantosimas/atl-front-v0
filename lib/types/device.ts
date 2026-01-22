export interface Device {
  id: number;
  name: string;
  equipmentId: number;
  equipment?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeviceDto {
  name: string;
  equipmentId: number;
}

export interface UpdateDeviceDto {
  name?: string;
  equipmentId?: number;
}

