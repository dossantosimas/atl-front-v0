/**
 * Convierte una expresión cron a texto legible en español
 * Formato: segundo minuto hora día mes día-semana
 * Ejemplo: "0 30 * * * *" -> "Cada minuto, en el minuto 30"
 */
export function parseCronToHumanReadable(cronExpression: string): string {
  if (!cronExpression || typeof cronExpression !== "string") {
    return "Frecuencia no válida";
  }

  const parts = cronExpression.trim().split(/\s+/);
  
  // Si tiene 6 partes, incluye segundos (formato completo)
  // Si tiene 5 partes, no incluye segundos (formato estándar)
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
    seconds = null;
  } else {
    return cronExpression; // Retornar original si no es válido
  }

  // Intentar generar una descripción resumida
  const summary = generateSummary(seconds, minutes, hours, dayOfMonth, month, dayOfWeek);
  if (summary) {
    return summary;
  }

  // Si no se puede resumir, generar descripción completa pero más corta
  const descriptions: string[] = [];

  // Segundos (si existe y no es *)
  if (seconds !== null && seconds !== "*") {
    const secDesc = parseFieldShort(seconds, "seg");
    if (secDesc) descriptions.push(secDesc);
  }

  // Minutos (si no es *)
  if (minutes !== "*") {
    const minDesc = parseFieldShort(minutes, "min");
    if (minDesc) descriptions.push(minDesc);
  }

  // Horas (si no es *)
  if (hours !== "*") {
    const hourDesc = parseFieldShort(hours, "h");
    if (hourDesc) descriptions.push(hourDesc);
  }

  // Día del mes (si no es *)
  if (dayOfMonth !== "*") {
    const dayDesc = parseDayOfMonthShort(dayOfMonth);
    if (dayDesc) descriptions.push(dayDesc);
  }

  // Mes (si no es *)
  if (month !== "*") {
    const monthDesc = parseMonthShort(month);
    if (monthDesc) descriptions.push(monthDesc);
  }

  // Día de la semana (si no es *)
  if (dayOfWeek !== "*") {
    const weekDayDesc = parseDayOfWeekShort(dayOfWeek);
    if (weekDayDesc) descriptions.push(weekDayDesc);
  }

  if (descriptions.length === 0) {
    return "Continuamente";
  }

  return descriptions.join(", ");
}

function generateSummary(
  seconds: string | null,
  minutes: string,
  hours: string,
  dayOfMonth: string,
  month: string,
  dayOfWeek: string
): string | null {
  // Cada X segundos
  if (seconds && seconds.startsWith("*/") && minutes === "*" && hours === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const interval = seconds.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `Cada ${num} seg`;
    }
  }

  // Cada X minutos
  if (minutes.startsWith("*/") && hours === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*" && (!seconds || seconds === "*")) {
    const interval = minutes.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `Cada ${num} min`;
    }
  }

  // Cada X horas
  if (hours.startsWith("*/") && dayOfMonth === "*" && month === "*" && dayOfWeek === "*" && minutes === "*" && (!seconds || seconds === "*")) {
    const interval = hours.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `Cada ${num} h`;
    }
  }

  // Diario a una hora específica
  if (minutes !== "*" && hours !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*" && (!seconds || seconds === "*")) {
    const minNum = parseInt(minutes, 10);
    const hourNum = parseInt(hours, 10);
    if (!isNaN(minNum) && !isNaN(hourNum)) {
      return `Diario ${hourNum}:${minNum.toString().padStart(2, "0")}`;
    }
  }

  // Semanal en un día específico
  if (dayOfWeek !== "*" && dayOfMonth === "*" && month === "*" && hours !== "*" && minutes !== "*" && (!seconds || seconds === "*")) {
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const dayNum = parseInt(dayOfWeek, 10);
    if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
      const hourNum = parseInt(hours, 10);
      const minNum = parseInt(minutes, 10);
      if (!isNaN(hourNum) && !isNaN(minNum)) {
        return `${dayNames[dayNum]} ${hourNum}:${minNum.toString().padStart(2, "0")}`;
      }
    }
  }

  return null;
}

function parseFieldShort(value: string, unit: string): string | null {
  if (value === "*") {
    return null;
  }

  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `Cada ${num} ${unit}`;
    }
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `${start}-${end} ${unit}`;
  }

  if (value.includes(",")) {
    const values = value.split(",").slice(0, 3); // Solo primeros 3
    const suffix = value.split(",").length > 3 ? "..." : "";
    return `${values.join(",")}${suffix} ${unit}`;
  }

  const num = parseInt(value, 10);
  if (!isNaN(num)) {
    return `${num} ${unit}`;
  }

  return null;
}

function parseDayOfMonthShort(value: string): string | null {
  if (value === "*") {
    return null;
  }

  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `Cada ${num} días`;
    }
  }

  if (value.includes(",")) {
    const values = value.split(",").slice(0, 3);
    const suffix = value.split(",").length > 3 ? "..." : "";
    return `Días ${values.join(",")}${suffix}`;
  }

  const num = parseInt(value, 10);
  if (!isNaN(num)) {
    return `Día ${num}`;
  }

  return null;
}

function parseMonthShort(value: string): string | null {
  if (value === "*") {
    return null;
  }

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `Cada ${num} meses`;
    }
  }

  if (value.includes(",")) {
    const values = value.split(",").map(v => {
      const num = parseInt(v.trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 12) {
        return monthNames[num - 1];
      }
      return v.trim();
    }).slice(0, 3);
    const suffix = value.split(",").length > 3 ? "..." : "";
    return values.join(",") + suffix;
  }

  const num = parseInt(value, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return monthNames[num - 1];
  }

  return null;
}

function parseDayOfWeekShort(value: string): string | null {
  if (value === "*") {
    return null;
  }

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `Cada ${num} días sem`;
    }
  }

  if (value.includes(",")) {
    const values = value.split(",").map(v => {
      const num = parseInt(v.trim(), 10);
      if (!isNaN(num) && num >= 0 && num <= 6) {
        return dayNames[num];
      }
      return v.trim();
    }).slice(0, 3);
    const suffix = value.split(",").length > 3 ? "..." : "";
    return values.join(",") + suffix;
  }

  const num = parseInt(value, 10);
  if (!isNaN(num) && num >= 0 && num <= 6) {
    return dayNames[num];
  }

  return null;
}

function parseField(value: string, singular: string, plural: string): string | null {
  if (value === "*") {
    return `cada ${singular}`;
  }

  // Cada X unidades (ej: */30)
  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `cada ${num} ${num === 1 ? singular : plural}`;
    }
  }

  // Rango (ej: 0-59)
  if (value.includes("-")) {
    const [start, end] = value.split("-");
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    if (!isNaN(startNum) && !isNaN(endNum)) {
      return `del ${startNum} al ${endNum}`;
    }
  }

  // Lista (ej: 0,15,30,45)
  if (value.includes(",")) {
    const values = value.split(",").map(v => v.trim());
    return `en los ${singular}es ${values.join(", ")}`;
  }

  // Valor específico
  const num = parseInt(value, 10);
  if (!isNaN(num)) {
    return `en el ${singular} ${num}`;
  }

  return null;
}

function parseDayOfMonth(value: string): string | null {
  if (value === "*") {
    return null; // No mencionar si es todos los días
  }

  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `cada ${num} días`;
    }
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    if (!isNaN(startNum) && !isNaN(endNum)) {
      return `del día ${startNum} al ${endNum}`;
    }
  }

  if (value.includes(",")) {
    const values = value.split(",").map(v => v.trim());
    return `los días ${values.join(", ")}`;
  }

  const num = parseInt(value, 10);
  if (!isNaN(num)) {
    return `el día ${num}`;
  }

  return null;
}

function parseMonth(value: string): string | null {
  if (value === "*") {
    return null; // No mencionar si es todos los meses
  }

  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `cada ${num} meses`;
    }
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    if (!isNaN(startNum) && !isNaN(endNum) && startNum >= 1 && endNum <= 12) {
      return `de ${monthNames[startNum - 1]} a ${monthNames[endNum - 1]}`;
    }
  }

  if (value.includes(",")) {
    const values = value.split(",").map(v => {
      const num = parseInt(v.trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 12) {
        return monthNames[num - 1];
      }
      return v.trim();
    });
    return `en ${values.join(", ")}`;
  }

  const num = parseInt(value, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return `en ${monthNames[num - 1]}`;
  }

  return null;
}

function parseDayOfWeek(value: string): string | null {
  if (value === "*") {
    return null; // No mencionar si es todos los días
  }

  const dayNames = [
    "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
  ];

  if (value.startsWith("*/")) {
    const interval = value.substring(2);
    const num = parseInt(interval, 10);
    if (!isNaN(num)) {
      return `cada ${num} días de la semana`;
    }
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    if (!isNaN(startNum) && !isNaN(endNum) && startNum >= 0 && endNum <= 6) {
      return `de ${dayNames[startNum]} a ${dayNames[endNum]}`;
    }
  }

  if (value.includes(",")) {
    const values = value.split(",").map(v => {
      const num = parseInt(v.trim(), 10);
      if (!isNaN(num) && num >= 0 && num <= 6) {
        return dayNames[num];
      }
      return v.trim();
    });
    return `los ${values.join(", ")}`;
  }

  const num = parseInt(value, 10);
  if (!isNaN(num) && num >= 0 && num <= 6) {
    return `los ${dayNames[num]}s`;
  }

  return null;
}

