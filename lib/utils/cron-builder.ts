/**
 * Convierte una configuración amigable de frecuencia a expresión cron
 */

export interface FrequencyConfig {
  type: "seconds" | "minutes" | "hours" | "daily" | "weekly" | "monthly";
  interval?: number; // Para seconds, minutes, hours
  time?: string; // Formato HH:mm para daily, weekly y monthly
  dayOfWeek?: number; // 0-6 (0 = domingo) para weekly
  dayOfMonth?: number; // 1-31 para monthly
  month?: number; // 1-12 para monthly (opcional, si no se especifica es todos los meses)
}

/**
 * Convierte una configuración de frecuencia a expresión cron (6 campos con segundos)
 */
export function buildCronExpression(config: FrequencyConfig): string {
  switch (config.type) {
    case "seconds":
      if (!config.interval || config.interval < 1) {
        throw new Error("El intervalo debe ser mayor a 0");
      }
      return `*/${config.interval} * * * * *`;

    case "minutes":
      if (!config.interval || config.interval < 1) {
        throw new Error("El intervalo debe ser mayor a 0");
      }
      return `0 */${config.interval} * * * *`;

    case "hours":
      if (!config.interval || config.interval < 1) {
        throw new Error("El intervalo debe ser mayor a 0");
      }
      return `0 0 */${config.interval} * * *`;

    case "daily":
      if (!config.time) {
        throw new Error("Debe especificar una hora");
      }
      const [hour, minute] = config.time.split(":").map(Number);
      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error("Hora inválida");
      }
      return `0 ${minute} ${hour} * * *`;

    case "weekly":
      if (!config.time) {
        throw new Error("Debe especificar una hora");
      }
      if (config.dayOfWeek === undefined || config.dayOfWeek < 0 || config.dayOfWeek > 6) {
        throw new Error("Día de la semana inválido");
      }
      const [hourW, minuteW] = config.time.split(":").map(Number);
      if (isNaN(hourW) || isNaN(minuteW) || hourW < 0 || hourW > 23 || minuteW < 0 || minuteW > 59) {
        throw new Error("Hora inválida");
      }
      return `0 ${minuteW} ${hourW} * * ${config.dayOfWeek}`;

    case "monthly":
      if (!config.time) {
        throw new Error("Debe especificar una hora");
      }
      if (!config.dayOfMonth || config.dayOfMonth < 1 || config.dayOfMonth > 31) {
        throw new Error("Día del mes inválido");
      }
      const [hourM, minuteM] = config.time.split(":").map(Number);
      if (isNaN(hourM) || isNaN(minuteM) || hourM < 0 || hourM > 23 || minuteM < 0 || minuteM > 59) {
        throw new Error("Hora inválida");
      }
      // Si hay un mes específico, usarlo; si no, usar * (todos los meses)
      const monthValue = config.month && config.month >= 1 && config.month <= 12 ? config.month : "*";
      return `0 ${minuteM} ${hourM} ${config.dayOfMonth} ${monthValue} *`;

    default:
      throw new Error("Tipo de frecuencia no válido");
  }
}

/**
 * Convierte una expresión cron a configuración amigable
 */
export function parseCronToConfig(cronExpression: string): FrequencyConfig | null {
  if (!cronExpression || typeof cronExpression !== "string") {
    return null;
  }

  const parts = cronExpression.trim().split(/\s+/);
  
  let seconds: string | null = null;
  let minutes: string;
  let hours: string;
  let dayOfMonth: string;
  let month: string;
  let dayOfWeek: string;

  if (parts.length === 6) {
    [seconds, minutes, hours, dayOfMonth, month, dayOfWeek] = parts;
  } else if (parts.length === 5) {
    [minutes, hours, dayOfMonth, month, dayOfWeek] = parts;
    seconds = "0";
  } else {
    return null;
  }

  // Cada X segundos
  if (seconds && seconds.startsWith("*/") && minutes === "*" && hours === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const interval = parseInt(seconds.substring(2), 10);
    if (!isNaN(interval) && interval > 0) {
      return { type: "seconds", interval };
    }
  }

  // Cada X minutos
  if (minutes.startsWith("*/") && hours === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*" && (!seconds || seconds === "0" || seconds === "*")) {
    const interval = parseInt(minutes.substring(2), 10);
    if (!isNaN(interval) && interval > 0) {
      return { type: "minutes", interval };
    }
  }

  // Cada X horas
  if (hours.startsWith("*/") && dayOfMonth === "*" && month === "*" && dayOfWeek === "*" && minutes === "0" && (!seconds || seconds === "0" || seconds === "*")) {
    const interval = parseInt(hours.substring(2), 10);
    if (!isNaN(interval) && interval > 0) {
      return { type: "hours", interval };
    }
  }

  // Diario a una hora específica
  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*" && hours !== "*" && minutes !== "*" && (!seconds || seconds === "0" || seconds === "*")) {
    const hourNum = parseInt(hours, 10);
    const minNum = parseInt(minutes, 10);
    if (!isNaN(hourNum) && !isNaN(minNum) && hourNum >= 0 && hourNum <= 23 && minNum >= 0 && minNum <= 59) {
      return {
        type: "daily",
        time: `${hourNum.toString().padStart(2, "0")}:${minNum.toString().padStart(2, "0")}`,
      };
    }
  }

  // Semanal en un día específico
  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*" && hours !== "*" && minutes !== "*" && (!seconds || seconds === "0" || seconds === "*")) {
    const dayNum = parseInt(dayOfWeek, 10);
    const hourNum = parseInt(hours, 10);
    const minNum = parseInt(minutes, 10);
    if (!isNaN(dayNum) && !isNaN(hourNum) && !isNaN(minNum) && dayNum >= 0 && dayNum <= 6 && hourNum >= 0 && hourNum <= 23 && minNum >= 0 && minNum <= 59) {
      return {
        type: "weekly",
        time: `${hourNum.toString().padStart(2, "0")}:${minNum.toString().padStart(2, "0")}`,
        dayOfWeek: dayNum,
      };
    }
  }

  // Mensual en un día específico (con o sin mes específico)
  if (dayOfMonth !== "*" && dayOfWeek === "*" && hours !== "*" && minutes !== "*" && (!seconds || seconds === "0" || seconds === "*")) {
    const dayNum = parseInt(dayOfMonth, 10);
    const hourNum = parseInt(hours, 10);
    const minNum = parseInt(minutes, 10);
    const monthNum = month !== "*" ? parseInt(month, 10) : undefined;
    
    if (!isNaN(dayNum) && !isNaN(hourNum) && !isNaN(minNum) && dayNum >= 1 && dayNum <= 31 && hourNum >= 0 && hourNum <= 23 && minNum >= 0 && minNum <= 59) {
      const config: FrequencyConfig = {
        type: "monthly",
        time: `${hourNum.toString().padStart(2, "0")}:${minNum.toString().padStart(2, "0")}`,
        dayOfMonth: dayNum,
      };
      
      // Si hay un mes específico válido, agregarlo
      if (monthNum && !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        config.month = monthNum;
      }
      
      return config;
    }
  }

  return null;
}

