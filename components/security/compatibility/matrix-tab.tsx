"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CompatibilityLegend } from "./compatibility-legend";
import { CompatibilityDetailsModal } from "./compatibility-details-modal";
import { SubareaFilter } from "./subarea-filter";
import { PictogramsDisplay } from "@/components/security/config/pictograms-display";
import { Loader2 } from "lucide-react";
import { getMatrixData } from "@/lib/services/chemical-substances.service";
import type {
  ChemicalSubstance,
  CompatibilityMatrix,
  CompatibilityLevel,
} from "@/lib/types/chemical-substances";
import {
  getCompatibility,
  getColorValue,
  getCompatibilityTooltip,
} from "@/lib/utils/compatibility-helpers";

interface MatrixTabProps {
  initialSubstances: ChemicalSubstance[];
  initialMatrix: CompatibilityMatrix[];
  levels: CompatibilityLevel[];
}

export function MatrixTab({
  initialSubstances,
  initialMatrix,
  levels,
}: MatrixTabProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedSubareaId, setSelectedSubareaId] = useState<number | null>(null);
  const [substances, setSubstances] = useState<ChemicalSubstance[]>(initialSubstances);
  const [matrix, setMatrix] = useState<CompatibilityMatrix[]>(initialMatrix);
  const [loading, setLoading] = useState(false);
  const [selectedCompatibility, setSelectedCompatibility] =
    useState<CompatibilityMatrix | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos cuando cambia la subárea seleccionada (o cuando no hay filtro)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Si no hay subárea seleccionada, cargar todas las sustancias sin filtro
        // Si hay subárea seleccionada, cargar solo las de esa subárea
        const data = await getMatrixData(selectedSubareaId || undefined);
        setSubstances(data.substances);
        setMatrix(data.matrix);
      } catch (error) {
        console.error("Error loading matrix data:", error);
        setSubstances([]);
        setMatrix([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSubareaId]);

  const handleCellClick = (substanceAId: string, substanceBId: string) => {
    if (substanceAId === substanceBId) return;
    const compatibility = getCompatibility(
      substanceAId,
      substanceBId,
      matrix,
      substances
    );
    setSelectedCompatibility(compatibility);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filtro de Departamento y Subárea */}
        <SubareaFilter
          selectedDepartmentId={selectedDepartmentId}
          selectedSubareaId={selectedSubareaId}
          onDepartmentChange={(deptId) => {
            setSelectedDepartmentId(deptId);
            // Reset subarea - el useEffect se encargará de recargar los datos
            setSelectedSubareaId(null);
          }}
          onSubareaChange={setSelectedSubareaId}
        />

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {selectedSubareaId 
                  ? "Cargando datos de la subárea..." 
                  : "Cargando todas las sustancias..."}
              </span>
            </div>
          </div>
        )}

        {!loading && substances.length === 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {selectedSubareaId 
                ? "No se encontraron sustancias químicas asociadas a esta subárea."
                : "No se encontraron sustancias químicas activas."}
            </p>
          </div>
        )}

        {!loading && substances.length > 0 && (
          <>
            {/* Leyenda */}
            <CompatibilityLegend levels={levels} />

        {/* Matriz de Compatibilidad */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-b p-1.5 sm:p-2 min-w-[150px] sm:min-w-[200px] font-semibold text-left text-[10px] sm:text-xs">
                        Sustancias
                      </th>
                      {substances.map((substance) => (
                        <th
                          key={substance.id}
                          className="border-b border-r p-1 sm:p-2 min-w-[60px] sm:min-w-[80px] font-medium text-center text-[10px] sm:text-xs bg-gray-50 dark:bg-gray-900"
                          style={{
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                          }}
                        >
                          <div className="py-1 sm:py-2 whitespace-nowrap">
                            {substance.name.length > 15
                              ? `${substance.name.substring(0, 15)}...`
                              : substance.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {substances.map((substanceA, indexA) => (
                      <tr key={substanceA.id}>
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 border-r border-b p-1.5 sm:p-2">
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <span className="font-medium text-xs sm:text-sm truncate flex-1 min-w-0">
                              {substanceA.name}
                            </span>
                            {substanceA.pictograms && substanceA.pictograms.length > 0 && (
                              <div className="flex-shrink-0 ml-2">
                                <PictogramsDisplay 
                                  pictograms={substanceA.pictograms} 
                                  size="sm"
                                  className="justify-end"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        {substances.map((substanceB, indexB) => {
                          const compatibility = getCompatibility(
                            substanceA.id,
                            substanceB.id,
                            matrix,
                            substances
                          );
                          const isDiagonal = indexA === indexB;

                          return (
                            <td
                              key={substanceB.id}
                              className={`border-b border-r p-0.5 sm:p-1 text-center min-w-[40px] sm:min-w-[60px] ${
                                isDiagonal
                                  ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                  : "cursor-pointer hover:opacity-80 transition-opacity active:opacity-60"
                              }`}
                              onClick={() =>
                                !isDiagonal &&
                                handleCellClick(substanceA.id, substanceB.id)
                              }
                              title={
                                isDiagonal
                                  ? "Misma sustancia"
                                  : getCompatibilityTooltip(compatibility)
                              }
                            >
                              {isDiagonal ? (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto bg-gray-300 dark:bg-gray-700 rounded"></div>
                              ) : compatibility ? (
                                <div
                                  className="w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded"
                                  style={{
                                    backgroundColor: getColorValue(
                                      compatibility.compatibilityLevel?.color
                                    ),
                                  }}
                                ></div>
                              ) : (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto bg-gray-200 dark:bg-gray-700 rounded border border-dashed border-gray-400 dark:border-gray-500"></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 border-t text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
              Desliza horizontalmente para ver todas las sustancias
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Modal de Detalles */}
      <CompatibilityDetailsModal
        compatibility={selectedCompatibility}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

