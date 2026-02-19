import axios from "axios";
import { env } from "@/config/env";
import type { MicroElementTypeProgram } from "@/lib/types/micro-element-type-programs";

export interface CreateMicroElementTypeProgramDto {
  typeId: string;
  elementId: number;
  programId: string;
}

export interface BulkCreateMicroElementTypeProgramDto {
  rows: CreateMicroElementTypeProgramDto[];
}

export async function createMicroElementTypeProgram(
  data: CreateMicroElementTypeProgramDto
): Promise<MicroElementTypeProgram> {
  try {
    const response = await axios.post<MicroElementTypeProgram>(
      `${env.BASE_URL}/micro-element-type-programs`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating micro element type program association:", error);
    throw error;
  }
}

export async function bulkCreateMicroElementTypePrograms(
  data: BulkCreateMicroElementTypeProgramDto
): Promise<MicroElementTypeProgram[]> {
  try {
    const response = await axios.post<MicroElementTypeProgram[]>(
      `${env.BASE_URL}/micro-element-type-programs/bulk`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating bulk associations for micro element type programs:", error);
    throw error;
  }
}

export async function deleteMicroElementTypeProgram(
  data: CreateMicroElementTypeProgramDto
): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/micro-element-type-programs`, { data });
  } catch (error) {
    console.error("Error deleting micro element type program association:", error);
    throw error;
  }
}

export async function getMicroElementTypeProgramsByProgram(
  programId: string
): Promise<MicroElementTypeProgram[]> {
  try {
    const response = await axios.get<MicroElementTypeProgram[]>(
      `${env.BASE_URL}/micro-element-type-programs/by-program/${programId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching associations by program:", error);
    throw error;
  }
}

export async function getMicroElementTypeProgramsByType(
  typeId: string
): Promise<MicroElementTypeProgram[]> {
  try {
    const response = await axios.get<MicroElementTypeProgram[]>(
      `${env.BASE_URL}/micro-element-type-programs/by-type/${typeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching associations by type:", error);
    throw error;
  }
}

export async function getMicroElementTypeProgramsByTypeAndProgram(
  typeId: string,
  programId: string
): Promise<MicroElementTypeProgram[]> {
  try {
    const response = await axios.get<MicroElementTypeProgram[]>(
      `${env.BASE_URL}/micro-element-type-programs/by-type/${typeId}/by-program/${programId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching associations by type and program:", error);
    throw error;
  }
}
