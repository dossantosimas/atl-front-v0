import axios from "axios";
import { env } from "@/config/env";
import type { MicroIndexWeekDay } from "@/lib/types/microindex-week";

export async function getMicroIndexWeek(
  year: number,
  week: number,
  month?: number
): Promise<MicroIndexWeekDay[]> {
  try {
    const response = await axios.get<MicroIndexWeekDay[]>(
      `${env.BASE_URL}/microindex_week_test`,
      {
        params: { year, week, month },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly micro index KPI:", error);
    throw error;
  }
}

export interface MicroIndexBudgetAnalysisType {
  analysis_type_id: string;
  analysis_type_name: string;
  weighted: number;
}

export interface MicroIndexBudgetGroup {
  micro_index_group: string;
  analysisTypes: MicroIndexBudgetAnalysisType[];
}

export async function getMicroIndexWeekBudget(): Promise<MicroIndexBudgetGroup[]> {
  try {
    const response = await axios.get<MicroIndexBudgetGroup[]>(
      `${env.BASE_URL}/microindex_week_budget`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro index week budget:", error);
    throw error;
  }
}

