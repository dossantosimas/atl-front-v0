import axios from "axios";
import { env } from "@/config/env";
import type { MicroIndexWeekDay } from "@/lib/types/microindex-week";

export async function getMicroIndexWeek(
  year: number,
  week: number
): Promise<MicroIndexWeekDay[]> {
  try {
    const response = await axios.get<MicroIndexWeekDay[]>(
      `${env.BASE_URL}/microindex_week`,
      {
        params: { year, week },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly micro index KPI:", error);
    throw error;
  }
}

