"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function ServerTimeDisplay() {
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const fetchServerTime = async () => {
    try {
      const response = await fetch('/api/server-time', {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverTime = new Date(data.time);
        setServerTime(serverTime);
      } else {
        setServerTime(new Date());
      }
    } catch (error) {
      setServerTime(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServerTime();
    
    // Actualizar cada minuto
    const interval = setInterval(() => {
      const now = new Date();
      setServerTime(now);
    }, 60000);

    // Sincronizar con servidor cada 5 minutos
    const syncInterval = setInterval(() => {
      fetchServerTime();
    }, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, []);

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
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Clock className="h-4 w-4" />
        <span className="text-sm">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">{formatTime(serverTime)}</span>
    </div>
  );
}

