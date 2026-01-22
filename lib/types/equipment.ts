export interface Equipment {
  id: number;
  name: string;
  subareaId: number;
  subarea?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEquipmentDto {
  name: string;
  subareaId: number;
}

export interface UpdateEquipmentDto {
  name?: string;
  subareaId?: number;
}

