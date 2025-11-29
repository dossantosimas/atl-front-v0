import axios from "axios";
import type { MicroElement } from "../types/micro-elements";
import { env } from "@/config/env";

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

