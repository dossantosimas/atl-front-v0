import type {
  ChemicalSubstance,
  CompatibilityMatrix,
  CompatibilityLevel,
} from "@/lib/types/chemical-substances";
import { findCompatibility } from "@/lib/services/chemical-substances.service";

/**
 * Busca compatibilidad entre dos sustancias en la matriz y la enriquece con datos de las sustancias
 */
export function getCompatibility(
  substanceAId: string,
  substanceBId: string,
  matrix: CompatibilityMatrix[],
  substances: ChemicalSubstance[]
): CompatibilityMatrix | null {
  if (substanceAId === substanceBId) return null; // Misma sustancia
  const compatibility = findCompatibility(substanceAId, substanceBId, matrix);
  if (!compatibility) return null;

  // Enriquecer con los datos de las sustancias
  const substanceA = substances.find(
    (s) => s.id === (compatibility.chemicalAId === substanceAId ? substanceAId : substanceBId)
  );
  const substanceB = substances.find(
    (s) => s.id === (compatibility.chemicalAId === substanceAId ? substanceBId : substanceAId)
  );

  return {
    ...compatibility,
    chemicalA: substanceA,
    chemicalB: substanceB,
  };
}

/**
 * Convierte color del API a color CSS válido
 */
export function getColorValue(color?: string): string {
  if (!color) return "#gray";
  const colorMap: Record<string, string> = {
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#eab308",
  };
  return colorMap[color.toLowerCase()] || color;
}

/**
 * Obtiene el color de fondo para un nivel de compatibilidad
 */
export function getCompatibilityColor(compatibility: CompatibilityMatrix | null): string {
  if (!compatibility) return "bg-gray-200 dark:bg-gray-700";
  const code = compatibility.compatibilityLevel?.code;
  switch (code) {
    case "COMPATIBLE":
      return "bg-green-500 hover:bg-green-600";
    case "INCOMPATIBLE":
      return "bg-red-500 hover:bg-red-600";
    case "CONDITIONAL":
      return "bg-yellow-500 hover:bg-yellow-600";
    default:
      return "bg-gray-300 dark:bg-gray-600";
  }
}

/**
 * Obtiene el texto del tooltip para una celda de compatibilidad
 */
export function getCompatibilityTooltip(compatibility: CompatibilityMatrix | null): string {
  if (!compatibility) return "No hay información de compatibilidad";
  return `${compatibility.chemicalA?.name || ""} - ${compatibility.chemicalB?.name || ""}: ${compatibility.compatibilityLevel?.code || ""}`;
}

/**
 * Obtiene el color de fondo para un badge de compatibilidad
 */
export function getCompatibilityBadgeColor(compatibility: CompatibilityMatrix | null): string {
  if (!compatibility) return "";
  const code = compatibility.compatibilityLevel?.code;
  switch (code) {
    case "COMPATIBLE":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200";
    case "INCOMPATIBLE":
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200";
    case "CONDITIONAL":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

/**
 * Genera el texto para copiar información de compatibilidad
 */
export function generateCompatibilityText(compatibility: CompatibilityMatrix): string {
  return `COMPATIBILIDAD: ${compatibility.compatibilityLevel?.code}\n${compatibility.compatibilityLevel?.description}\n\nSUSTANCIAS:\nA: ${compatibility.chemicalA?.name}\nB: ${compatibility.chemicalB?.name}\n\nTIPO DE REACCIÓN: ${compatibility.reactionType}\n\nDESCRIPCIÓN DEL RIESGO:\n${compatibility.riskDescription}\n\nCONTROLES REQUERIDOS:\n${compatibility.requiredControls}`;
}

