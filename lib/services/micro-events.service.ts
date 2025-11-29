import axios from "axios";
import type {
  MicroEventsSearchParams,
  MicroEventsSearchResponse,
  MicroEvent,
} from "../types/micro-events";
import { env } from "@/config/env";

export async function searchMicroEvents(
  params: MicroEventsSearchParams
): Promise<MicroEventsSearchResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    // Parámetros obligatorios
    searchParams.append("typeId", params.typeId);
    searchParams.append("month", params.month);
    
    // Parámetros opcionales
    if (params.week) {
      searchParams.append("week", params.week);
    }
    if (params.year) {
      searchParams.append("year", String(params.year));
    }
    if (params.page) {
      searchParams.append("page", String(params.page));
    }
    if (params.limit) {
      searchParams.append("limit", String(params.limit));
    }
    if (params.selector !== undefined) {
      searchParams.append("selector", String(params.selector));
    }

    console.log(`${env.BASE_URL}/micro-events/search?${searchParams.toString()}`)

    const response = await axios.get<MicroEventsSearchResponse>(
      `${env.BASE_URL}/micro-events/search?${searchParams.toString()}`
    );
    
    return response.data;
  } catch (error) {
    console.error("Error searching micro events:", error);
    throw error;
  }
}

export async function updateMicroEvent(
  id: number,
  data: Partial<MicroEvent>
): Promise<MicroEvent> {
  try {
    const response = await axios.put<MicroEvent>(
      `${env.BASE_URL}/micro-events/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating micro event:", error);
    throw error;
  }
}

export async function createMicroEvent(
  data: Partial<MicroEvent>
): Promise<MicroEvent> {
  try {
    const response = await axios.post<MicroEvent>(
      `${env.BASE_URL}/micro-events/manual`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating micro event:", error);
    throw error;
  }
}
