import axios from "axios";
import type { Person } from "../types/people";
import { env } from "@/config/env";

export async function getPeople(): Promise<Person[]> {
  try {
    const response = await axios.get<Person[]>(`${env.BASE_URL}/people`);
    return response.data;
  } catch (error) {
    console.error("Error fetching people:", error);
    throw error;
  }
}

