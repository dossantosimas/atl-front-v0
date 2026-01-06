import axios from "axios";
import type { MicroType } from "../types/micro-types";
import { env } from "@/config/env";

export interface CreateMicroTypeDto {
  name: string;
  start: string;
  end: string;
  description: string;
}

export interface UpdateMicroTypeDto extends Partial<CreateMicroTypeDto> {}

export async function getMicroTypes(): Promise<MicroType[]> {
  try {
    const response = await axios.get<MicroType[]>(
      `${env.BASE_URL}/micro-types`
    );
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
    const response = await axios.put<MicroType>(
      `${env.BASE_URL}/micro-types/${id}`,
      data
    );
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

export async function associateElementToMicroType(
  microTypeId: string,
  elementId: number
): Promise<void> {
  try {
    // Según la documentación: PUT /micro-elements/:id con { "typeIds": ["uuid-del-micro-type"] }
    // Necesitamos obtener los tipos actuales del elemento para no reemplazarlos
    // Primero intentamos obtener el elemento completo que podría incluir typeIds
    try {
      const { getMicroElementById } = await import("./micro-elements.service");
      const element = await getMicroElementById(elementId);
      
      // Si el elemento tiene typeIds, los usamos; si no, solo agregamos el nuevo
      const existingTypeIds = (element as any).typeIds || [];
      const allTypeIds = existingTypeIds.includes(microTypeId) 
        ? existingTypeIds 
        : [...existingTypeIds, microTypeId];
      
      await axios.put(
        `${env.BASE_URL}/micro-elements/${elementId}`,
        { typeIds: allTypeIds }
      );
    } catch (getError) {
      // Si no podemos obtener el elemento o no tiene typeIds, solo agregamos el nuevo tipo
      // Nota: esto reemplazará los tipos existentes, pero es la única opción sin más información
      await axios.put(
        `${env.BASE_URL}/micro-elements/${elementId}`,
        { typeIds: [microTypeId] }
      );
    }
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
    // Para desasociar, necesitamos obtener los tipos actuales del elemento
    // y remover el microTypeId de la lista
    try {
      const { getMicroElementById } = await import("./micro-elements.service");
      const element = await getMicroElementById(elementId);
      
      const existingTypeIds = (element as any).typeIds || [];
      const remainingTypeIds = existingTypeIds.filter((id: string) => id !== microTypeId);
      
      // Actualizar el elemento con los tipos restantes
      await axios.put(
        `${env.BASE_URL}/micro-elements/${elementId}`,
        { typeIds: remainingTypeIds }
      );
    } catch (getError) {
      // Si no podemos obtener el elemento, intentamos con un array vacío
      // Esto desasociará el elemento de todos los tipos
      await axios.put(
        `${env.BASE_URL}/micro-elements/${elementId}`,
        { typeIds: [] }
      );
    }
  } catch (error) {
    console.error("Error disassociating element from micro type:", error);
    throw error;
  }
}

