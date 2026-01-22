import axios from "axios";
import type { Signal } from "../types/signal";
import type { CreateSignalDto, UpdateSignalDto } from "../types/signal";
import { env } from "@/config/env";

export type { CreateSignalDto, UpdateSignalDto };

export async function getAllSignals(): Promise<Signal[]> {
  try {
    const response = await axios.get<Signal[]>(`${env.BASE_URL}/signals`);
    return response.data;
  } catch (error) {
    console.error("Error fetching signals:", error);
    throw error;
  }
}

export async function getSignalById(id: number): Promise<Signal> {
  try {
    const response = await axios.get<Signal>(`${env.BASE_URL}/signals/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching signal by id:", error);
    throw error;
  }
}

export async function createSignal(data: CreateSignalDto): Promise<Signal> {
  try {
    console.log("🌐 [createSignal] URL:", `${env.BASE_URL}/signals`);
    console.log("🌐 [createSignal] Método: POST");
    console.log("🌐 [createSignal] Datos:", JSON.stringify(data, null, 2));
    const response = await axios.post<Signal>(`${env.BASE_URL}/signals`, data);
    console.log("✅ [createSignal] Respuesta:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [createSignal] Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ [createSignal] Error response:", error.response?.data);
      console.error("❌ [createSignal] Error status:", error.response?.status);
    }
    throw error;
  }
}

export async function updateSignal(id: number, data: UpdateSignalDto): Promise<Signal> {
  try {
    console.log("🌐 [updateSignal] URL:", `${env.BASE_URL}/signals/${id}`);
    console.log("🌐 [updateSignal] Método: PUT");
    console.log("🌐 [updateSignal] Datos:", JSON.stringify(data, null, 2));
    const response = await axios.put<Signal>(`${env.BASE_URL}/signals/${id}`, data);
    console.log("✅ [updateSignal] Respuesta:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ [updateSignal] Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ [updateSignal] Error response:", error.response?.data);
      console.error("❌ [updateSignal] Error status:", error.response?.status);
    }
    throw error;
  }
}

export async function deleteSignal(id: number): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/signals/${id}`);
  } catch (error) {
    console.error("Error deleting signal:", error);
    throw error;
  }
}

/**
 * Obtiene señales con filtros opcionales usando query parameters
 * GET /signals?departmentId=...&subareaId=...&equipmentId=...&deviceId=...&name=...&enabled=...&sourceDataId=...
 */
export interface GetSignalsParams {
  departmentId?: number;
  subareaId?: number;
  equipmentId?: number;
  deviceId?: number;
  name?: string;
  enabled?: boolean;
  sourceDataId?: number;
}

export async function getSignals(
  params?: GetSignalsParams
): Promise<Signal[]> {
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
    if (params?.deviceId) {
      searchParams.append("deviceId", params.deviceId.toString());
    }
    if (params?.name) {
      searchParams.append("name", params.name);
    }
    if (params?.enabled !== undefined) {
      searchParams.append("enabled", params.enabled.toString());
    }
    if (params?.sourceDataId !== undefined) {
      searchParams.append("sourceDataId", params.sourceDataId.toString());
    }
    
    const url = `${env.BASE_URL}/signals${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    
    console.log("🔍 [getSignals] Parámetros recibidos:", params);
    console.log("🌐 [getSignals] URL completa:", url);
    console.log("📋 [getSignals] Query string:", searchParams.toString());
    
    const response = await axios.get<Signal[]>(url);
    
    console.log("✅ [getSignals] Respuesta recibida:", response.data.length, "señales");
    
    return response.data;
  } catch (error) {
    console.error("❌ [getSignals] Error fetching signals:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ [getSignals] Error response:", error.response?.data);
      console.error("❌ [getSignals] Error status:", error.response?.status);
      console.error("❌ [getSignals] Error URL:", error.config?.url);
    }
    throw error;
  }
}

/**
 * Obtiene señales de un dispositivo con filtros opcionales (mantener compatibilidad)
 * GET /devices/:id/signals?name=...&enabled=...&sourceDataId=...
 */
export interface GetSignalsByDeviceParams {
  deviceId: number;
  name?: string;
  enabled?: boolean;
  sourceDataId?: number;
}

export async function getSignalsByDevice(
  params: GetSignalsByDeviceParams
): Promise<Signal[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params.name) {
      searchParams.append("name", params.name);
    }
    if (params.enabled !== undefined) {
      searchParams.append("enabled", params.enabled.toString());
    }
    if (params.sourceDataId !== undefined) {
      searchParams.append("sourceDataId", params.sourceDataId.toString());
    }
    
    const url = `${env.BASE_URL}/devices/${params.deviceId}/signals${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    
    const response = await axios.get<Signal[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching signals by device:", error);
    throw error;
  }
}

