import axios from "axios";
import type { Device } from "../types/device";
import type { CreateDeviceDto, UpdateDeviceDto } from "../types/device";
import { env } from "@/config/env";

export type { CreateDeviceDto, UpdateDeviceDto };

export async function getAllDevices(): Promise<Device[]> {
  try {
    const response = await axios.get<Device[]>(`${env.BASE_URL}/devices`);
    return response.data;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
}

export async function getDeviceById(id: number): Promise<Device> {
  try {
    const response = await axios.get<Device>(`${env.BASE_URL}/devices/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching device by id:", error);
    throw error;
  }
}

export async function createDevice(data: CreateDeviceDto): Promise<Device> {
  try {
    const response = await axios.post<Device>(`${env.BASE_URL}/devices`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating device:", error);
    throw error;
  }
}

export async function updateDevice(id: number, data: UpdateDeviceDto): Promise<Device> {
  try {
    const response = await axios.put<Device>(`${env.BASE_URL}/devices/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating device:", error);
    throw error;
  }
}

export async function deleteDevice(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/devices/${id}`);
  } catch (error) {
    console.error("Error deleting device:", error);
    throw error;
  }
}

/**
 * Obtiene dispositivos con filtros opcionales usando query parameters
 * GET /devices?departmentId=...&subareaId=...&equipmentId=...&name=...
 */
export interface GetDevicesParams {
  departmentId?: number;
  subareaId?: number;
  equipmentId?: number;
  name?: string;
}

export async function getDevices(
  params?: GetDevicesParams
): Promise<Device[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.departmentId) {
      searchParams.append("departmentId", params.departmentId.toString());
    }
    if (params?.subareaId) {
      searchParams.append("subareaId", params.subareaId.toString());
    }
    if (params?.equipmentId) {
      searchParams.append("equipmentId", params.equipmentId.toString());
    }
    if (params?.name) {
      searchParams.append("name", params.name);
    }
    
    const url = `${env.BASE_URL}/devices${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    
    console.log("🔍 [getDevices] Parámetros recibidos:", params);
    console.log("🌐 [getDevices] URL completa:", url);
    console.log("📋 [getDevices] Query string:", searchParams.toString());
    
    const response = await axios.get<Device[]>(url);
    
    console.log("✅ [getDevices] Respuesta recibida:", response.data.length, "dispositivos");
    
    return response.data;
  } catch (error) {
    console.error("❌ [getDevices] Error fetching devices:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ [getDevices] Error response:", error.response?.data);
      console.error("❌ [getDevices] Error status:", error.response?.status);
      console.error("❌ [getDevices] Error URL:", error.config?.url);
    }
    throw error;
  }
}

/**
 * Obtiene dispositivos de un equipo con filtros opcionales (mantener compatibilidad)
 * GET /equipments/:id/devices?name=...
 */
export interface GetDevicesByEquipmentParams {
  equipmentId: number;
  name?: string;
}

export async function getDevicesByEquipment(
  params: GetDevicesByEquipmentParams
): Promise<Device[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.name) {
      searchParams.append("name", params.name);
    }
    
    const url = `${env.BASE_URL}/equipments/${params.equipmentId}/devices${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    
    const response = await axios.get<Device[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching devices by equipment:", error);
    throw error;
  }
}

