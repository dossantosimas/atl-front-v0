"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface ServerTimeProps {
  onTimeUpdate?: (serverTime: Date) => void;
}

export function ServerTime({ onTimeUpdate }: ServerTimeProps) {
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const offsetRef = useRef<number>(0);

  const fetchServerTime = async () => {
    try {
      // Obtener la hora del servidor de Next.js (ruta API interna)
      const response = await fetch('/api/server-time', {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverTime = new Date(data.time);
        const clientTime = new Date();
        // Calcular el offset entre servidor y cliente
        offsetRef.current = serverTime.getTime() - clientTime.getTime();
        setServerTime(serverTime);
        onTimeUpdate?.(serverTime);
      } else {
        // Si falla, usar la hora del cliente
        const now = new Date();
        setServerTime(now);
        onTimeUpdate?.(now);
      }
    } catch (error) {
      // Si falla, usar la hora del cliente
      const now = new Date();
      setServerTime(now);
      onTimeUpdate?.(now);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Obtener la hora inicial
    fetchServerTime();

    // Cada 5 minutos, sincronizar con el servidor (única consulta)
    const syncInterval = setInterval(() => {
      fetchServerTime();
    }, 300000); // 5 minutos

    return () => {
      clearInterval(syncInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  const formatTime = (date: Date) => {
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Cargando hora del servidor...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
      <Clock className="h-4 w-4 text-primary" />
      <span className="font-mono">{formatTime(serverTime)}</span>
    </div>
  );
}


