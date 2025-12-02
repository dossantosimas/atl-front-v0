import axios from "axios";
import type { MicroAnalysis, CreateMicroAnalysisDto } from "../types/micro-analysis";
import { env } from "@/config/env";

export async function createMicroAnalysis(
  data: CreateMicroAnalysisDto
): Promise<MicroAnalysis> {
  try {
    const response = await axios.post<MicroAnalysis>(
      `${env.BASE_URL}/micro-analysis`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating micro analysis:", error);
    throw error;
  }
}

export async function getMicroAnalysisByEventId(
  eventId: number
): Promise<MicroAnalysis[]> {
  try {
    const response = await axios.get<MicroAnalysis[]>(
      `${env.BASE_URL}/micro-analysis/by-event/${eventId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro analysis by event id:", error);
    throw error;
  }
}

