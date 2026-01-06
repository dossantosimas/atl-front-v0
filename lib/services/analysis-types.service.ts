import axios from "axios";
import type { AnalysisType } from "../types/micro-analysis";
import { env } from "@/config/env";

export interface CreateAnalysisTypeDto {
  name: string;
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=" | null;
  threshold: string | null;
  code: string;
}

export interface UpdateAnalysisTypeDto extends Partial<CreateAnalysisTypeDto> {}

export async function getAnalysisTypes(): Promise<AnalysisType[]> {
  try {
    const url = `${env.BASE_URL}/micro-analysis-types`;
    console.log("[analysis-types.service] Fetching from:", url);
    console.log("[analysis-types.service] BASE_URL:", env.BASE_URL);
    const response = await axios.get<AnalysisType[]>(url);
    console.log("[analysis-types.service] Response status:", response.status);
    console.log("[analysis-types.service] Response data length:", response.data?.length);
    return response.data;
  } catch (error) {
    console.error("Error fetching analysis types:", error);
    if (axios.isAxiosError(error)) {
      console.error("[analysis-types.service] Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    }
    throw error;
  }
}

export async function getAnalysisTypeById(id: string): Promise<AnalysisType> {
  try {
    const response = await axios.get<AnalysisType>(
      `${env.BASE_URL}/micro-analysis-types/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching analysis type by id:", error);
    throw error;
  }
}

export async function createAnalysisType(
  data: CreateAnalysisTypeDto
): Promise<AnalysisType> {
  try {
    const response = await axios.post<AnalysisType>(
      `${env.BASE_URL}/micro-analysis-types`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating analysis type:", error);
    throw error;
  }
}

export async function updateAnalysisType(
  id: string,
  data: UpdateAnalysisTypeDto
): Promise<AnalysisType> {
  try {
    const response = await axios.put<AnalysisType>(
      `${env.BASE_URL}/micro-analysis-types/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating analysis type:", error);
    throw error;
  }
}

export async function deleteAnalysisType(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/micro-analysis-types/${id}`);
  } catch (error) {
    console.error("Error deleting analysis type:", error);
    throw error;
  }
}

