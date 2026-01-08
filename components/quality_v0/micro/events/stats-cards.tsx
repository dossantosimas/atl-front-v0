"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, Calendar, FlaskConical } from "lucide-react";
import type { MicroEvent } from "@/lib/types/micro-events";

interface StatsCardsProps {
  events: MicroEvent[];
  serverTime: Date | null;
  onTimeUpdate?: (time: Date) => void;
}

export function StatsCards({ events, serverTime, onTimeUpdate }: StatsCardsProps) {
  const [currentServerTime, setCurrentServerTime] = useState<Date | null>(serverTime);
  const offsetRef = useRef<number>(0);

  // Obtener la hora del servidor
  const fetchServerTime = async () => {
    try {
      const response = await fetch('/api/server-time', {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverTime = new Date(data.time);
        const clientTime = new Date();
        offsetRef.current = serverTime.getTime() - clientTime.getTime();
        setCurrentServerTime(serverTime);
        onTimeUpdate?.(serverTime);
      } else {
        const now = new Date();
        setCurrentServerTime(now);
        onTimeUpdate?.(now);
      }
    } catch (error) {
      const now = new Date();
      setCurrentServerTime(now);
      onTimeUpdate?.(now);
    }
  };

  useEffect(() => {
    if (serverTime) {
      setCurrentServerTime(serverTime);
    } else {
      fetchServerTime();
    }
  }, [serverTime]);

  // Sincronizar con el servidor cada 5 minutos y actualizar cada segundo
  useEffect(() => {
    fetchServerTime();
    
    const syncInterval = setInterval(() => {
      fetchServerTime();
    }, 300000); // 5 minutos

    const updateInterval = setInterval(() => {
      setCurrentServerTime((prev) => {
        if (!prev) return prev;
        const now = new Date();
        return new Date(now.getTime() + offsetRef.current);
      });
    }, 1000); // Cada segundo

    return () => {
      clearInterval(syncInterval);
      clearInterval(updateInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular eventos próximos
  const proximosCount = events.filter((event) => {
    if (!currentServerTime) return false;
    const serverTimeMs = currentServerTime.getTime();
    const samplestartMs = new Date(event.samplestart).getTime();
    const hasConfirm = event.sampleconfirm !== null && event.sampleconfirm !== "";
    return serverTimeMs < samplestartMs && !hasConfirm;
  }).length;

  // Calcular eventos "tomar muestra"
  const tomarMuestraCount = events.filter((event) => {
    if (!currentServerTime) return false;
    const serverTimeMs = currentServerTime.getTime();
    const samplestartMs = new Date(event.samplestart).getTime();
    const sampleendMs = new Date(event.sampleend).getTime();
    const hasConfirm = event.sampleconfirm !== null && event.sampleconfirm !== "";
    return serverTimeMs >= samplestartMs && serverTimeMs < sampleendMs && !hasConfirm;
  }).length;

  const formatServerTime = (date: Date | null): string => {
    if (!date) return "Cargando...";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
        {/* Tarjeta de Fecha y Hora del Servidor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 flex-1 min-w-[250px]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Fecha y Hora del Servidor
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
              {formatServerTime(currentServerTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta de Eventos Próximos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 flex-1 min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#091EB7] rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Próximos
            </p>
            <p className="text-2xl font-bold text-[#091EB7] dark:text-blue-400 mt-1">
              {proximosCount}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta de Tomar Muestras */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 flex-1 min-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EBA600] rounded-lg">
            <FlaskConical className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Tomar Muestras
            </p>
            <p className="text-2xl font-bold text-[#EBA600] dark:text-yellow-400 mt-1">
              {tomarMuestraCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

