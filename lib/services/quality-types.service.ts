import axios from "axios";
import type { QualityType, CreateQualityTypeDto, UpdateQualityTypeDto } from "../types/quality-types";
import { env } from "@/config/env";

export async function getQualityTypes(): Promise<QualityType[]> {
  try {
    const response = await axios.get<QualityType[]>(
      `${env.BASE_URL}/quality-types`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quality types:", error);
    throw error;
  }
}

export async function getQualityTypeById(id: number): Promise<QualityType> {
  try {
    const response = await axios.get<QualityType>(
      `${env.BASE_URL}/quality-types/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quality type by id:", error);
    throw error;
  }
}

export async function createQualityType(data: CreateQualityTypeDto): Promise<QualityType> {
  try {
    const response = await axios.post<QualityType>(
      `${env.BASE_URL}/quality-types`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating quality type:", error);
    throw error;
  }
}

export async function updateQualityType(
  id: number,
  data: UpdateQualityTypeDto
): Promise<QualityType> {
  try {
    const response = await axios.put<QualityType>(
      `${env.BASE_URL}/quality-types/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating quality type:", error);
    throw error;
  }
}

export async function deleteQualityType(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/quality-types/${id}`);
  } catch (error) {
    console.error("Error deleting quality type:", error);
    throw error;
  }
}

export async function associateMicroTypeToQualityType(
  qualityTypeId: number,
  microTypeId: string
): Promise<void> {
  try {
    // Usar updateMicroType para asociar el micro_type al quality_type
    // PUT /micro-types/:id con { qualityTypeId: number }
    const { updateMicroType } = await import("./micro-types.service");
    await updateMicroType(microTypeId, { qualityTypeId });
  } catch (error) {
    console.error("Error associating micro type to quality type:", error);
    throw error;
  }
}

export async function disassociateMicroTypeFromQualityType(
  microTypeId: string
): Promise<void> {
  try {
    // Usar updateMicroType para desasociar el micro_type del quality_type
    // PUT /micro-types/:id con { qualityTypeId: null }
    const { updateMicroType } = await import("./micro-types.service");
    await updateMicroType(microTypeId, { qualityTypeId: null });
    // La recarga de datos se hace en el componente después de esta función
  } catch (error) {
    console.error("Error disassociating micro type from quality type:", error);
    throw error;
  }
}

