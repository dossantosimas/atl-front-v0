import axios from "axios";
import { env } from "@/config/env";
import type { MicroProgram } from "@/lib/types/micro-programs";

export interface CreateMicroProgramDto {
  name: string;
}

export async function getMicroPrograms(): Promise<MicroProgram[]> {
  try {
    const response = await axios.get<MicroProgram[]>(
      `${env.BASE_URL}/micro-programs`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn("Endpoint /micro-programs no disponible. Se usara una lista vacia de programas.");
      return [];
    }
    console.error("Error fetching micro programs:", error);
    throw error;
  }
}

export async function getMicroProgramById(id: string): Promise<MicroProgram> {
  try {
    const response = await axios.get<MicroProgram>(
      `${env.BASE_URL}/micro-programs/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro program by id:", error);
    throw error;
  }
}

export async function createMicroProgram(
  data: CreateMicroProgramDto
): Promise<MicroProgram> {
  try {
    const response = await axios.post<MicroProgram>(
      `${env.BASE_URL}/micro-programs`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating micro program:", error);
    throw error;
  }
}

export async function deleteMicroProgram(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/micro-programs/${id}`);
  } catch (error) {
    console.error("Error deleting micro program:", error);
    throw error;
  }
}
