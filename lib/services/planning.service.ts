import axios from "axios";
import type { Planning } from "../types/planning";
import { env } from "@/config/env";

export async function getPlannings(): Promise<Planning[]> {
  try {
    const url = `${env.BASE_URL}/planning`;
    console.log("[getPlannings] Fetching from URL:", url);
    console.log("[getPlannings] BASE_URL:", env.BASE_URL);
    console.log("[getPlannings] NEXT_PUBLIC_BASE_URL env:", process.env.NEXT_PUBLIC_BASE_URL);
    
    const response = await axios.get<Planning[]>(url, {
      timeout: 10000, // 10 segundos de timeout
    });
    
    console.log("[getPlannings] Response received:", response.data?.length || 0, "items");
    return response.data;
  } catch (error: any) {
    console.error("[getPlannings] Error fetching plannings:", error.message);
    if (error.response) {
      console.error("[getPlannings] Response status:", error.response.status);
      console.error("[getPlannings] Response data:", error.response.data);
    }
    if (error.request) {
      console.error("[getPlannings] Request made but no response received");
      console.error("[getPlannings] Request URL:", error.config?.url);
    }
    throw error;
  }
}

