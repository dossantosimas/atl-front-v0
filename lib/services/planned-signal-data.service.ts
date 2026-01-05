import axios from "axios";
import type {
  PlannedSignalData,
  PlannedSignalDataSearchParams,
  CreatePlannedSignalDataDto,
  UpdatePlannedSignalDataDto,
} from "../types/planned-signal-data";
import { env } from "@/config/env";

export async function getPlannedSignalData(
  params: PlannedSignalDataSearchParams
): Promise<PlannedSignalData[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.plannedId) {
      searchParams.append("plannedId", String(params.plannedId));
    }
    if (params.subareaId) {
      searchParams.append("subareaId", String(params.subareaId));
    }
    if (params.startDate) {
      searchParams.append("startDate", params.startDate);
    }
    if (params.endDate) {
      searchParams.append("endDate", params.endDate);
    }
    if (params.week) {
      searchParams.append("week", String(params.week));
    }
    if (params.year) {
      searchParams.append("year", String(params.year));
    }

    const url = `${env.BASE_URL}/planned-signal-data?${searchParams.toString()}`;
    console.log("Fetching planned signal data from:", url);
    
    const response = await axios.get<PlannedSignalData[]>(url);
    
    console.log("Response received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching planned signal data:", error);
    throw error;
  }
}

export async function createPlannedSignalData(
  data: CreatePlannedSignalDataDto
): Promise<PlannedSignalData> {
  try {
    console.log("Creating planned signal data with:", data);
    const response = await axios.post<PlannedSignalData>(
      `${env.BASE_URL}/planned-signal-data`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating planned signal data:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error;
  }
}

export async function updatePlannedSignalData(
  id: number,
  data: UpdatePlannedSignalDataDto
): Promise<PlannedSignalData> {
  try {
    const response = await axios.put<PlannedSignalData>(
      `${env.BASE_URL}/planned-signal-data/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating planned signal data:", error);
    throw error;
  }
}

