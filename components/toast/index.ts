"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";

/**
 * Hook para manejar notificaciones toast de manera consistente en toda la aplicación
 */
export const useToast = () => {
  /**
   * Muestra un toast de éxito
   */
  const showSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, {
      description,
    });
  }, []);

  /**
   * Muestra un toast de error con manejo automático de errores de Axios
   */
  const showError = useCallback((message: string, error?: unknown) => {
    let errorDescription = "Ha ocurrido un error inesperado";

    if (axios.isAxiosError(error)) {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorDescription = "Error de conexión: No se pudo conectar al servidor";
      } else if (error.response) {
        errorDescription = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        errorDescription = "Error de red: No se recibió respuesta del servidor";
      } else {
        errorDescription = error.message || "Error de conexión";
      }
    } else if (error instanceof Error) {
      errorDescription = error.message;
    }

    toast.error(message, {
      description: errorDescription,
    });
  }, []);

  /**
   * Muestra un toast de información
   */
  const showInfo = useCallback((message: string, description?: string) => {
    toast.info(message, {
      description,
    });
  }, []);

  /**
   * Muestra un toast de advertencia
   */
  const showWarning = useCallback((message: string, description?: string) => {
    toast.warning(message, {
      description,
    });
  }, []);

  /**
   * Muestra un toast de carga
   */
  const showLoading = useCallback((message: string) => {
    return toast.loading(message);
  }, []);

  /**
   * Actualiza un toast existente (útil para toasts de carga)
   */
  const updateToast = useCallback(
    (
      toastId: string | number,
      message: string,
      type: "success" | "error" | "info" | "warning" = "success"
    ) => {
      toast[type](message, {
        id: toastId,
      });
    },
    []
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    updateToast,
  };
};

