import axios from "axios";
import type { SourceData } from "../types/source-data";
import type { CreateSourceDataDto, UpdateSourceDataDto } from "../types/source-data";
import { env } from "@/config/env";

export type { CreateSourceDataDto, UpdateSourceDataDto };

export async function getAllSourceData(): Promise<SourceData[]> {
  try {
    const response = await axios.get<SourceData[]>(`${env.BASE_URL}/source-data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching source data:", error);
    throw error;
  }
}

export async function getSourceDataById(id: number): Promise<SourceData> {
  try {
    const response = await axios.get<SourceData>(`${env.BASE_URL}/source-data/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching source data by id:", error);
    throw error;
  }
}

export async function createSourceData(data: CreateSourceDataDto): Promise<SourceData> {
  try {
    const response = await axios.post<SourceData>(`${env.BASE_URL}/source-data`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating source data:", error);
    throw error;
  }
}

export async function updateSourceData(id: number, data: UpdateSourceDataDto): Promise<SourceData> {
  try {
    const response = await axios.put<SourceData>(`${env.BASE_URL}/source-data/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating source data:", error);
    throw error;
  }
}

export async function deleteSourceData(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/source-data/${id}`);
  } catch (error) {
    console.error("Error deleting source data:", error);
    throw error;
  }
}

