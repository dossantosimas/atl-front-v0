"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChemicalSubstancesCombobox } from "@/components/security/config/chemical-substances-combobox";
import { useToast } from "@/components/toast";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  ArrowRight,
  CheckCircle,
  X,
  Loader2,
  Plus,
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

interface ComparisonPair {
  substanceAId: string;
  substanceBId: string;
  substanceAName: string;
  substanceBName: string;
  compatibility: CompatibilityMatrix | null;
  loading: boolean;
  exists: boolean;
}

const MAX_SUBSTANCES = 4;

export function ComparisonTab({ substances }: ComparisonTabProps) {
  const [selectedSubstanceIds, setSelectedSubstanceIds] = useState<string[]>([""]);
  const [comparisons, setComparisons] = useState<Map<string, ComparisonPair>>(new Map());
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  // Generar todas las combinaciones de pares únicos
  const pairs = useMemo(() => {
    const result: Array<{ id: string; substanceAId: string; substanceBId: string }> = [];
    for (let i = 0; i < selectedSubstanceIds.length; i++) {
      for (let j = i + 1; j < selectedSubstanceIds.length; j++) {
        const idA = selectedSubstanceIds[i];
        const idB = selectedSubstanceIds[j];
        const pairId = `${idA}-${idB}`;
        result.push({
          id: pairId,
          substanceAId: idA,
          substanceBId: idB,
        });
      }
    }
    return result;
  }, [selectedSubstanceIds]);

  // Cargar compatibilidad cuando cambian los pares
  useEffect(() => {
    if (pairs.length === 0) {
      setComparisons(new Map());
      return;
    }

    const loadComparisons = async () => {
      setLoading(true);
      const newComparisons = new Map<string, ComparisonPair>();

      for (const pair of pairs) {
        const pairId = pair.id;
        const substanceA = substances.find(s => s.id === pair.substanceAId);
        const substanceB = substances.find(s => s.id === pair.substanceBId);

        if (!substanceA || !substanceB) continue;

        // Inicializar con loading
        newComparisons.set(pairId, {
          substanceAId: pair.substanceAId,
          substanceBId: pair.substanceBId,
          substanceAName: substanceA.name,
          substanceBName: substanceB.name,
          compatibility: null,
          loading: true,
          exists: false,
        });

        setComparisons(new Map(newComparisons));

        try {
          const result = await checkCompatibility(pair.substanceAId, pair.substanceBId);
          newComparisons.set(pairId, {
            substanceAId: pair.substanceAId,
            substanceBId: pair.substanceBId,
            substanceAName: substanceA.name,
            substanceBName: substanceB.name,
            compatibility: result.compatibility,
            loading: false,
            exists: result.exists,
          });
          setComparisons(new Map(newComparisons));
        } catch (error) {
          console.error(`Error checking compatibility for ${pairId}:`, error);
          newComparisons.set(pairId, {
            substanceAId: pair.substanceAId,
            substanceBId: pair.substanceBId,
            substanceAName: substanceA.name,
            substanceBName: substanceB.name,
            compatibility: null,
            loading: false,
            exists: false,
          });
          setComparisons(new Map(newComparisons));
        }
      }

      setLoading(false);
    };

    loadComparisons();
  }, [pairs, substances]);

  const handleAddSubstance = () => {
    if (selectedSubstanceIds.length < MAX_SUBSTANCES) {
      setSelectedSubstanceIds([...selectedSubstanceIds, ""]);
    }
  };

  const handleRemoveSubstance = (index: number) => {
    setSelectedSubstanceIds(selectedSubstanceIds.filter((_, i) => i !== index));
  };

  const handleSubstanceChange = (index: number, substanceId: string) => {
    const newIds = [...selectedSubstanceIds];
    newIds[index] = substanceId;
    setSelectedSubstanceIds(newIds);
  };

  const getExcludedIds = (currentIndex: number) => {
    return selectedSubstanceIds.filter((id, index) => index !== currentIndex && id !== "");
  };

  const handleCopy = (comparison: ComparisonPair) => {
    if (!comparison.compatibility) return;
    const info = generateCompatibilityText(comparison.compatibility);
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
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "INCOMPATIBLE":
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case "CONDITIONAL":
        return <HelpCircle className="h-8 w-8 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getCompatibilityColor = (compatibility: CompatibilityMatrix | null) => {
    if (!compatibility) return "bg-gray-500";
    const code = compatibility.compatibilityLevel?.code;
    switch (code) {
      case "COMPATIBLE":
        return "bg-green-500";
      case "INCOMPATIBLE":
        return "bg-red-500";
      case "CONDITIONAL":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Comparar Sustancias Químicas
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Selecciona hasta {MAX_SUBSTANCES} sustancias químicas para verificar su compatibilidad entre todas ellas.
            </p>
          </div>

          {/* Selectores de sustancias */}
          <div className="space-y-4">
            {selectedSubstanceIds.map((substanceId, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Sustancia {index + 1}
                  </label>
                  <ChemicalSubstancesCombobox
                    value={substanceId}
                    onValueChange={(id) => handleSubstanceChange(index, id)}
                    placeholder={`Selecciona la sustancia ${index + 1}...`}
                    excludeIds={getExcludedIds(index)}
                    substances={substances}
                    className="w-full"
                  />
                </div>
                {selectedSubstanceIds.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveSubstance(index)}
                    className="mb-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {selectedSubstanceIds.length < MAX_SUBSTANCES && (
              <Button
                variant="outline"
                onClick={handleAddSubstance}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Sustancia
              </Button>
            )}
          </div>

          {/* Resultados de comparaciones en acordeón */}
          {loading && pairs.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Cargando comparaciones...
                </span>
              </div>
            </div>
          )}

          {!loading && pairs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Comparaciones ({pairs.length} {pairs.length === 1 ? 'par' : 'pares'})
              </h3>
              <Accordion type="multiple" className="w-full">
                {pairs.map((pair) => {
                  const comparison = comparisons.get(pair.id);
                  if (!comparison) return null;

                  return (
                    <AccordionItem key={pair.id} value={pair.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          {comparison.loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            getCompatibilityIcon(comparison.compatibility)
                          )}
                          <div className="flex-1">
                            <div className="font-medium">
                              {comparison.substanceAName} ↔ {comparison.substanceBName}
                            </div>
                            {comparison.compatibility && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {comparison.compatibility.compatibilityLevel?.code || "Sin información"}
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {comparison.loading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : comparison.compatibility ? (
                          <div className="space-y-6 pt-4">
                            <div
                              className={`rounded-lg p-4 sm:p-6 text-white ${getCompatibilityColor(comparison.compatibility)}`}
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                                <div className="flex-shrink-0">
                                  {getCompatibilityIcon(comparison.compatibility)}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl sm:text-2xl font-bold">
                                    {comparison.compatibility.compatibilityLevel?.code || "DESCONOCIDO"}
                                  </h3>
                                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                                    {comparison.compatibility.compatibilityLevel?.description}
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
                                      {comparison.compatibility.chemicalA?.name || "N/A"}
                                    </span>
                                    {comparison.compatibility.chemicalA?.pictograms && comparison.compatibility.chemicalA.pictograms.length > 0 && (
                                      <PictogramsDisplay 
                                        pictograms={comparison.compatibility.chemicalA.pictograms} 
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
                                      {comparison.compatibility.chemicalB?.name || "N/A"}
                                    </span>
                                    {comparison.compatibility.chemicalB?.pictograms && comparison.compatibility.chemicalB.pictograms.length > 0 && (
                                      <PictogramsDisplay 
                                        pictograms={comparison.compatibility.chemicalB.pictograms} 
                                        size="sm" 
                                        className="mt-2"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Tipo de Reacción */}
                              {comparison.compatibility.reactionType && (
                                <div>
                                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                                    Tipo de Reacción
                                  </h3>
                                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                      {comparison.compatibility.reactionType}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Descripción del Riesgo */}
                              {comparison.compatibility.riskDescription && (
                                <div>
                                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                                    Descripción del Riesgo
                                  </h3>
                                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                      {comparison.compatibility.riskDescription}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Controles Requeridos */}
                              {comparison.compatibility.requiredControls && (
                                <div>
                                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                                    Controles Requeridos
                                  </h3>
                                  <div className="space-y-2">
                                    {comparison.compatibility.requiredControls
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
                              )}

                              {/* Footer - Referencia y Validado Por */}
                              {(comparison.compatibility.sourceReference ||
                                comparison.compatibility.validatedBy) && (
                                <div className="border-t pt-4 space-y-3">
                                  {comparison.compatibility.sourceReference && (
                                    <div>
                                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                        Referencia:{" "}
                                      </span>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {comparison.compatibility.sourceReference}
                                      </span>
                                    </div>
                                  )}
                                  {comparison.compatibility.validatedBy && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                        Validado Por:{" "}
                                      </span>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {comparison.compatibility.validatedBy}
                                      </span>
                                      <CheckCircle className="h-3 w-3 text-blue-500" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Botón Copiar */}
                              <div className="flex justify-end pt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleCopy(comparison)} 
                                  className="w-full sm:w-auto"
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar Info
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
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
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

