import type { MicroType } from "./micro-types";

export interface QualityType {
  id: number;
  name: string;
  microTypes?: MicroType[];
}

export interface CreateQualityTypeDto {
  name: string;
}

export interface UpdateQualityTypeDto extends Partial<CreateQualityTypeDto> {}

