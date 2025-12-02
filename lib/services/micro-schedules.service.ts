import axios from "axios";
import type {
  MicroSchedule,
  CreateMicroScheduleDto,
  UpdateMicroScheduleDto,
} from "../types/micro-schedules";
import { env } from "@/config/env";

export async function getMicroSchedules(): Promise<MicroSchedule[]> {
  try {
    const response = await axios.get<MicroSchedule[]>(
      `${env.BASE_URL}/micro-schedules`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro schedules:", error);
    throw error;
  }
}

export async function getMicroScheduleById(id: number): Promise<MicroSchedule> {
  try {
    const response = await axios.get<MicroSchedule>(
      `${env.BASE_URL}/micro-schedules/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching micro schedule by id:", error);
    throw error;
  }
}

export async function createMicroSchedule(
  data: CreateMicroScheduleDto
): Promise<MicroSchedule> {
  try {
    const response = await axios.post<MicroSchedule>(
      `${env.BASE_URL}/micro-schedules`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating micro schedule:", error);
    throw error;
  }
}

export async function updateMicroSchedule(
  id: number,
  data: UpdateMicroScheduleDto
): Promise<MicroSchedule> {
  try {
    const response = await axios.put<MicroSchedule>(
      `${env.BASE_URL}/micro-schedules/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating micro schedule:", error);
    throw error;
  }
}

export async function deleteMicroSchedule(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/micro-schedules/${id}`);
  } catch (error) {
    console.error("Error deleting micro schedule:", error);
    throw error;
  }
}

