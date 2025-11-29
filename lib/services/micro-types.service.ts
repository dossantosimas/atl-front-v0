import axios from "axios";
import type { MicroType } from "../types/micro-types";
import { env } from "@/config/env";

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

