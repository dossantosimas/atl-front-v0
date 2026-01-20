"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChemicalSubstancesCombobox } from "@/components/security/config/chemical-substances-combobox";
import { useToast } from "@/components/toast";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  ArrowRight,
  CheckCircle,
  ArrowLeftRight,
  Loader2,
} from "lucide-react";
import type {
  ChemicalSubstance,
  CompatibilityMatrix,
} from "@/lib/types/chemical-substances";
import {
  generateCompatibilityText,
} from "@/lib/utils/compatibility-helpers";
import { checkCompatibility } from "@/lib/services/chemical-substances.service";
import { PictogramsDisplay } from "@/components/security/config/pictograms-display";

interface ComparisonTabProps {
  substances: ChemicalSubstance[];
}

export function ComparisonTab({ substances }: ComparisonTabProps) {
  const [substanceAId, setSubstanceAId] = useState<string>("");
  const [substanceBId, setSubstanceBId] = useState<string>("");
  const [comparisonResult, setComparisonResult] =
    useState<CompatibilityMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { showError, showSuccess } = useToast();

  // Limpiar resultado cuando cambian las selecciones
  useEffect(() => {
    setComparisonResult(null);
    setHasSearched(false);
  }, [substanceAId, substanceBId]);

  const handleCompare = async () => {
    if (!substanceAId || !substanceBId) {
      showError("Error", "Por favor selecciona ambas sustancias para comparar");
      return;
    }

    if (substanceAId === substanceBId) {
      showError("Error", "Por favor selecciona dos sustancias diferentes");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const result = await checkCompatibility(substanceAId, substanceBId);
      setComparisonResult(result.compatibility);
      
      if (!result.exists) {
        showError(
          "Sin información",
          "No hay registro de compatibilidad entre estas sustancias en la base de datos."
        );
      }
    } catch (error) {
      setHasSearched(true);
      showError(
        "Error",
        "Error al verificar la compatibilidad. Por favor intenta nuevamente."
      );
      console.error("Error checking compatibility:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!comparisonResult) return;
    const info = generateCompatibilityText(comparisonResult);
    navigator.clipboard.writeText(info);
    showSuccess(
      "Información copiada",
      "La información de compatibilidad se ha copiado al portapapeles."
    );
  };

  const getCompatibilityIcon = (compatibility: CompatibilityMatrix | null) => {
    if (!compatibility) return null;
    const code = compatibility.compatibilityLevel?.code;
    switch (code) {
      case "COMPATIBLE":
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case "INCOMPATIBLE":
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
      case "CONDITIONAL":
        return <HelpCircle className="h-12 w-12 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Comparar dos Sustancias Químicas
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Selecciona dos sustancias químicas para verificar su
              compatibilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
            <div className="w-full">
              <label className="text-sm font-medium mb-2 block">
                Sustancia A
              </label>
              <ChemicalSubstancesCombobox
                value={substanceAId}
                onValueChange={setSubstanceAId}
                placeholder="Selecciona la primera sustancia..."
                excludeId={substanceBId}
                className="w-full"
              />
            </div>

            <div className="flex justify-center items-center pb-2 md:pb-0">
              <ArrowLeftRight className="h-5 w-5 md:h-6 md:w-6 text-gray-400 rotate-90 md:rotate-0" />
            </div>

            <div className="w-full">
              <label className="text-sm font-medium mb-2 block">
                Sustancia B
              </label>
              <ChemicalSubstancesCombobox
                value={substanceBId}
                onValueChange={setSubstanceBId}
                placeholder="Selecciona la segunda sustancia..."
                excludeId={substanceAId}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-center w-full">
            <Button
              onClick={handleCompare}
              disabled={
                !substanceAId || !substanceBId || substanceAId === substanceBId || loading
              }
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Comparando...
                </>
              ) : (
                "Comparar Sustancias"
              )}
            </Button>
          </div>

          {/* Resultado de la comparación */}
          {comparisonResult && (
            <div className="mt-6 sm:mt-8">
              <div
                className={`rounded-lg p-4 sm:p-6 text-white mb-4 sm:mb-6 ${
                  comparisonResult.compatibilityLevel?.code === "COMPATIBLE"
                    ? "bg-green-500"
                    : comparisonResult.compatibilityLevel?.code === "INCOMPATIBLE"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                  <div className="flex-shrink-0">
                    {getCompatibilityIcon(comparisonResult)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold">
                      {comparisonResult.compatibilityLevel?.code || "DESCONOCIDO"}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90 mt-1">
                      {comparisonResult.compatibilityLevel?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Sustancias Analizadas */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                    Sustancias Analizadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1">
                        Sustancia A:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                        {comparisonResult.chemicalA?.name || "N/A"}
                      </span>
                      {comparisonResult.chemicalA?.pictograms && comparisonResult.chemicalA.pictograms.length > 0 && (
                        <PictogramsDisplay 
                          pictograms={comparisonResult.chemicalA.pictograms} 
                          size="sm" 
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1">
                        Sustancia B:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                        {comparisonResult.chemicalB?.name || "N/A"}
                      </span>
                      {comparisonResult.chemicalB?.pictograms && comparisonResult.chemicalB.pictograms.length > 0 && (
                        <PictogramsDisplay 
                          pictograms={comparisonResult.chemicalB.pictograms} 
                          size="sm" 
                          className="mt-2"
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
                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {comparisonResult.reactionType}
                    </p>
                  </div>
                </div>

                {/* Descripción del Riesgo */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                    Descripción del Riesgo
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {comparisonResult.riskDescription}
                    </p>
                  </div>
                </div>

                {/* Controles Requeridos */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                    Controles Requeridos
                  </h3>
                  <div className="space-y-2">
                    {comparisonResult.requiredControls
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((control, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
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
                {(comparisonResult.sourceReference ||
                  comparisonResult.validatedBy) && (
                  <div className="border-t pt-4 space-y-3">
                    {comparisonResult.sourceReference && (
                      <div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          Referencia:{" "}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {comparisonResult.sourceReference}
                        </span>
                      </div>
                    )}
                    {comparisonResult.validatedBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          Validado Por:{" "}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {comparisonResult.validatedBy}
                        </span>
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                )}

                {/* Botón Copiar */}
                <div className="flex justify-end pt-4">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="w-full sm:w-auto">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Info
                  </Button>
                </div>
              </div>
            </div>
          )}

          {hasSearched &&
            !loading &&
            comparisonResult === null &&
            substanceAId &&
            substanceBId &&
            substanceAId !== substanceBId && (
              <div className="mt-8 p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-yellow-500" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No se encontró información de compatibilidad
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No hay registro de compatibilidad entre estas sustancias en
                  la base de datos. Consulte con un especialista antes de
                  mezclar estas sustancias.
                </p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

