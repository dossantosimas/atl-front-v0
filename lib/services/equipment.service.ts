import axios from "axios";
import type { Equipment } from "../types/equipment";
import type { CreateEquipmentDto, UpdateEquipmentDto } from "../types/equipment";
import { env } from "@/config/env";

export type { CreateEquipmentDto, UpdateEquipmentDto };

export async function getAllEquipments(): Promise<Equipment[]> {
  try {
    const response = await axios.get<Equipment[]>(`${env.BASE_URL}/equipments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipments:", error);
    throw error;
  }
}

export async function getEquipmentById(id: number): Promise<Equipment> {
  try {
    const response = await axios.get<Equipment>(`${env.BASE_URL}/equipments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment by id:", error);
    throw error;
  }
}

export async function createEquipment(data: CreateEquipmentDto): Promise<Equipment> {
  try {
    const response = await axios.post<Equipment>(`${env.BASE_URL}/equipments`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating equipment:", error);
    throw error;
  }
}

export async function updateEquipment(id: number, data: UpdateEquipmentDto): Promise<Equipment> {
  try {
    const response = await axios.put<Equipment>(`${env.BASE_URL}/equipments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating equipment:", error);
    throw error;
  }
}

export async function deleteEquipment(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/equipments/${id}`);
  } catch (error) {
    console.error("Error deleting equipment:", error);
    throw error;
  }
}

/**
 * Obtiene equipos con filtros opcionales usando query parameters
 * GET /equipments?departmentId=...&subareaId=...&name=...
 */
export interface GetEquipmentsParams {
  departmentId?: number;
  subareaId?: number;
  name?: string;
}

export async function getEquipments(
  params?: GetEquipmentsParams
): Promise<Equipment[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) {
      searchParams.append("departmentId", params.departmentId.toString());
    }
    if (params?.subareaId) {
      searchParams.append("subareaId", params.subareaId.toString());
    }
    if (params?.name) {
      searchParams.append("name", params.name);
    }
    
    const url = `${env.BASE_URL}/equipments${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    
    console.log("🔍 [getEquipments] Parámetros recibidos:", params);
    console.log("🌐 [getEquipments] URL completa:", url);
    console.log("📋 [getEquipments] Query string:", searchParams.toString());
    
    const response = await axios.get<Equipment[]>(url);
    
    console.log("✅ [getEquipments] Respuesta recibida:", response.data.length, "equipos");
    
    return response.data;
  } catch (error) {
    console.error("❌ [getEquipments] Error fetching equipments:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ [getEquipments] Error response:", error.response?.data);
      console.error("❌ [getEquipments] Error status:", error.response?.status);
      console.error("❌ [getEquipments] Error URL:", error.config?.url);
    }
    throw error;
  }
}

/**
 * Obtiene equipos de una subárea con filtros opcionales (mantener compatibilidad)
 * GET /subareas/:id/equipments?name=...
 */
export interface GetEquipmentsBySubareaParams {
  subareaId: number;
  name?: string;
}

export async function getEquipmentsBySubarea(
  params: GetEquipmentsBySubareaParams
): Promise<Equipment[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.name) {
      searchParams.append("name", params.name);
    }
    
    const url = `${env.BASE_URL}/subareas/${params.subareaId}/equipments${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    
    const response = await axios.get<Equipment[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipments by subarea:", error);
    throw error;
  }
}

