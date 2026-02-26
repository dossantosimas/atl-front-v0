import axios from "axios";
import type { MicroType } from "../types/micro-types";
import { env } from "@/config/env";

export interface CreateMicroTypeDto {
  name: string;
  start: string;
  end: string;
  description: string;
  qualityTypeId?: number | null;
  belongsToMicroIndex?: boolean;
  microIndexGroup?: string | null;
  departmentId?: number | null;
}

export interface UpdateMicroTypeDto extends Partial<CreateMicroTypeDto> {
  qualityTypeId?: number | null;
  belongsToMicroIndex?: boolean;
  microIndexGroup?: string | null;
  departmentId?: number | null;
}

export interface UpdateAnalysisPtsConfigDto {
  analysisTypeId: string;
  weighted: number;
  microIndexOn: boolean;
}

export async function getMicroTypes(params?: {
  departmentId?: number;
  qualityTypeId?: number;
}): Promise<MicroType[]> {
  try {
    const response = await axios.get<MicroType[]>(`${env.BASE_URL}/micro-types`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching micro types:", error);
    throw error;
  }
}

export async function getMicroTypeById(id: string): Promise<MicroType> {
  try {
    const response = await axios.get<MicroType>(
      `${env.BASE_URL}/micro-types/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro type by id:", error);
    throw error;
  }
}

export async function createMicroType(data: CreateMicroTypeDto): Promise<MicroType> {
  try {
    const response = await axios.post<MicroType>(
      `${env.BASE_URL}/micro-types`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating micro type:", error);
    throw error;
  }
}

export async function updateMicroType(
  id: string,
  data: UpdateMicroTypeDto
): Promise<MicroType> {
  try {
    // Asegurar que el ID es un string limpio sin comillas
    const cleanId = String(id).replace(/["']/g, '');
    const url = `${env.BASE_URL}/micro-types/${cleanId}`;
    console.log("Update URL:", url);
    const response = await axios.put<MicroType>(url, data);
    return response.data;
  } catch (error) {
    console.error("Error updating micro type:", error);
    throw error;
  }
}

export async function deleteMicroType(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/micro-types/${id}`);
  } catch (error) {
    console.error("Error deleting micro type:", error);
    throw error;
  }
}

export async function associateAnalysisTypeToMicroType(
  microTypeId: string,
  analysisTypeId: string
): Promise<void> {
  try {
    // Primero obtener los tipos de análisis ya asociados
    const microType = await getMicroTypeById(microTypeId);
    const existingAnalysisTypeIds = microType.analysisTypes?.map(at => at.id) || [];
    
    // Agregar el nuevo ID a la lista
    const allAnalysisTypeIds = [...existingAnalysisTypeIds, analysisTypeId];
    
    // Usar PATCH para actualizar con todos los IDs
    await axios.patch(
      `${env.BASE_URL}/micro-types/${microTypeId}/analysis-types`,
      { analysisTypeIds: allAnalysisTypeIds }
    );
  } catch (error) {
    console.error("Error associating analysis type to micro type:", error);
    throw error;
  }
}

export async function updateMicroTypeAnalysisTypes(
  microTypeId: string,
  analysisTypeIds: string[]
): Promise<void> {
  try {
    await axios.patch(
      `${env.BASE_URL}/micro-types/${microTypeId}/analysis-types`,
      { analysisTypeIds }
    );
  } catch (error) {
    console.error("Error updating micro type analysis types:", error);
    throw error;
  }
}

export async function removeAnalysisTypeFromMicroType(
  microTypeId: string,
  analysisTypeId: string
): Promise<void> {
  try {
    await axios.delete(
      `${env.BASE_URL}/micro-types/${microTypeId}/analysis-types/${analysisTypeId}`
    );
  } catch (error) {
    console.error("Error removing analysis type relation from micro type:", error);
    throw error;
  }
}

export async function disassociateAnalysisTypeFromMicroType(
  microTypeId: string,
  analysisTypeId: string
): Promise<void> {
  try {
    // Obtener los tipos de análisis ya asociados
    const microType = await getMicroTypeById(microTypeId);
    const existingAnalysisTypeIds = microType.analysisTypes?.map(at => at.id) || [];
    
    // Remover el ID de la lista
    const remainingAnalysisTypeIds = existingAnalysisTypeIds.filter(id => id !== analysisTypeId);
    
    // Usar PATCH para actualizar con los IDs restantes
    await axios.patch(
      `${env.BASE_URL}/micro-types/${microTypeId}/analysis-types`,
      { analysisTypeIds: remainingAnalysisTypeIds }
    );
  } catch (error) {
    console.error("Error disassociating analysis type from micro type:", error);
    throw error;
  }
}

export async function updateAnalysisPtsConfig(
  microTypeId: string,
  data: UpdateAnalysisPtsConfigDto
): Promise<void> {
  try {
    await axios.patch(
      `${env.BASE_URL}/micro-types/${microTypeId}/analysis-types/weighted`,
      data
    );
  } catch (error) {
    console.error("Error updating analysis PTS config:", error);
    throw error;
  }
}

export async function associateElementToMicroType(
  microTypeId: string,
  elementId: number
): Promise<void> {
  try {
    // Usar POST /micro-elements/:id/types para agregar tipos sin quitar los existentes
    // Este endpoint hace merge automáticamente
    await axios.post(
      `${env.BASE_URL}/micro-elements/${elementId}/types`,
      { typeIds: [microTypeId] }
    );
  } catch (error) {
    console.error("Error associating element to micro type:", error);
    throw error;
  }
}

export async function disassociateElementFromMicroType(
  microTypeId: string,
  elementId: number
): Promise<void> {
  try {
    // Usar DELETE /micro-elements/:id/types para remover tipos específicos
    // Este endpoint remueve solo los tipos especificados, mantiene los demás
    await axios.delete(
      `${env.BASE_URL}/micro-elements/${elementId}/types`,
      {
        data: { typeIds: [microTypeId] }
      }
    );
  } catch (error) {
    console.error("Error disassociating element from micro type:", error);
    throw error;
  }
}

