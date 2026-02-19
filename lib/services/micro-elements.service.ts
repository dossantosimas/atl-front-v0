import axios from "axios";
import type { MicroElement } from "../types/micro-elements";
import { env } from "@/config/env";

export interface CreateMicroElementDto {
  name: string;
}

export interface UpdateMicroElementDto extends Partial<CreateMicroElementDto> {}

export async function getMicroElements(): Promise<MicroElement[]> {
  try {
    const response = await axios.get<MicroElement[]>(
      `${env.BASE_URL}/micro-elements`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro elements:", error);
    throw error;
  }
}

export async function getMicroElementsByType(typeId: string): Promise<MicroElement[]> {
  try {
    const response = await axios.get<MicroElement[]>(
      `${env.BASE_URL}/micro-elements/by-type/${typeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro elements by type:", error);
    throw error;
  }
}

export async function getMicroElementsByTypeAndProgram(
  typeId: string,
  programId: string
): Promise<MicroElement[]> {
  try {
    const response = await axios.get<MicroElement[]>(
      `${env.BASE_URL}/micro-elements/by-type/${typeId}/by-program/${programId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro elements by type and program:", error);
    throw error;
  }
}

export async function getMicroElementById(id: number): Promise<MicroElement> {
  try {
    const response = await axios.get<MicroElement>(
      `${env.BASE_URL}/micro-elements/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro element by id:", error);
    throw error;
  }
}

export async function createMicroElement(
  data: CreateMicroElementDto
): Promise<MicroElement> {
  try {
    const response = await axios.post<MicroElement>(
      `${env.BASE_URL}/micro-elements`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating micro element:", error);
    throw error;
  }
}

export async function updateMicroElement(
  id: number,
  data: UpdateMicroElementDto
): Promise<MicroElement> {
  try {
    const response = await axios.put<MicroElement>(
      `${env.BASE_URL}/micro-elements/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating micro element:", error);
    throw error;
  }
}

export async function deleteMicroElement(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/micro-elements/${id}`);
  } catch (error) {
    console.error("Error deleting micro element:", error);
    throw error;
  }
}

