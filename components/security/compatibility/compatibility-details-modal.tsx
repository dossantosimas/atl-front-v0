"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  ArrowRight,
} from "lucide-react";
import type { CompatibilityMatrix } from "@/lib/types/chemical-substances";
import { generateCompatibilityText } from "@/lib/utils/compatibility-helpers";
import { PictogramsDisplay } from "@/components/security/config/pictograms-display";

interface CompatibilityDetailsModalProps {
  compatibility: CompatibilityMatrix | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompatibilityDetailsModal({
  compatibility,
  isOpen,
  onOpenChange,
}: CompatibilityDetailsModalProps) {
  const { showSuccess } = useToast();

  const handleCopy = () => {
    if (!compatibility) return;
    const info = generateCompatibilityText(compatibility);
    navigator.clipboard.writeText(info);
    showSuccess(
      "Información copiada",
      "La información de compatibilidad se ha copiado al portapapeles."
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-0">
        {compatibility ? (
          <>
            <DialogTitle className="sr-only">
              Detalles de compatibilidad entre{" "}
              {compatibility.chemicalA?.name || "Sustancia A"} y{" "}
              {compatibility.chemicalB?.name || "Sustancia B"}
            </DialogTitle>
            {/* Banner Superior */}
            <div
              className={`p-4 sm:p-6 text-white ${
                compatibility.compatibilityLevel?.code === "COMPATIBLE"
                  ? "bg-green-500"
                  : compatibility.compatibilityLevel?.code === "INCOMPATIBLE"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {compatibility.compatibilityLevel?.code || "DESCONOCIDO"}
                  </h2>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    {compatibility.compatibilityLevel?.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Subtítulo */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Información técnica y protocolos de seguridad industrial
              </p>

              {/* Sustancias Analizadas */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Sustancias Analizadas
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                        Sustancia A:
                      </span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                        {compatibility.chemicalA?.name || "N/A"}
                      </span>
                    </div>
                    {compatibility.chemicalA?.pictograms && compatibility.chemicalA.pictograms.length > 0 && (
                      <PictogramsDisplay 
                        pictograms={compatibility.chemicalA.pictograms} 
                        size="sm" 
                        className="pl-0 sm:pl-16"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                        Sustancia B:
                      </span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                        {compatibility.chemicalB?.name || "N/A"}
                      </span>
                    </div>
                    {compatibility.chemicalB?.pictograms && compatibility.chemicalB.pictograms.length > 0 && (
                      <PictogramsDisplay 
                        pictograms={compatibility.chemicalB.pictograms} 
                        size="sm" 
                        className="pl-0 sm:pl-16"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Tipo de Reacción */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Tipo de Reacción
                </h3>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {compatibility.reactionType}
                  </p>
                </div>
              </div>

              {/* Descripción del Riesgo */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Descripción del Riesgo
                </h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {compatibility.riskDescription}
                </p>
              </div>

              {/* Controles Requeridos */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Controles Requeridos
                </h3>
                <div className="space-y-2">
                  {compatibility.requiredControls
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((control, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {control.includes("nunca") ||
                        control.includes("Nunca") ? (
                          <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {control.trim()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Footer - Referencia y Validado Por */}
              <div className="border-t pt-4 space-y-3">
                {compatibility.sourceReference && (
                  <div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Referencia:{" "}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {compatibility.sourceReference}
                    </span>
                  </div>
                )}
                {compatibility.validatedBy && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Validado Por:{" "}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {compatibility.validatedBy}
                    </span>
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="w-full sm:w-auto"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Info
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">
              Información de compatibilidad no disponible
            </DialogTitle>
            <div className="p-4 sm:p-6">
              <div className="text-center py-8 sm:py-12">
                <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-yellow-500" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No se encontró información de compatibilidad
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 px-2">
                  No hay registro de compatibilidad entre estas sustancias en la
                  base de datos. Consulte con un especialista antes de mezclar
                  estas sustancias.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

