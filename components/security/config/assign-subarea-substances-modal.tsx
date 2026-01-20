"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { Check, Loader2 } from "lucide-react";
import type {
  ChemicalSubstance,
  Subarea,
} from "@/lib/types/chemical-substances";
import type { Department } from "@/lib/types/departments";
import {
  getAllDepartments,
  getSubareasByDepartment,
} from "@/lib/services/departments.service";
import {
  getChemicalSubstances,
  assignSubstancesToSubarea,
  removeSubstancesFromSubarea,
  getSubareaSubstancesMatrix,
} from "@/lib/services/chemical-substances.service";

interface AssignSubareaSubstancesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AssignSubareaSubstancesModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: AssignSubareaSubstancesModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [selectedSubareaId, setSelectedSubareaId] = useState<number | null>(null);
  const [allSubstances, setAllSubstances] = useState<ChemicalSubstance[]>([]);
  const [selectedSubstanceIds, setSelectedSubstanceIds] = useState<string[]>([]);
  const [initialSubstanceIds, setInitialSubstanceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    } else {
      // Reset al cerrar
      setSelectedDepartmentId(null);
      setSelectedSubareaId(null);
      setSelectedSubstanceIds([]);
      setInitialSubstanceIds([]);
      setSubareas([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadSubareas();
      // Reset subárea al cambiar departamento
      setSelectedSubareaId(null);
      setSelectedSubstanceIds([]);
      setInitialSubstanceIds([]);
    } else {
      // Limpiar todo si no hay departamento
      setSubareas([]);
      setSelectedSubareaId(null);
      setSelectedSubstanceIds([]);
      setInitialSubstanceIds([]);
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (selectedSubareaId) {
      loadSubareaSubstances();
    } else {
      // Limpiar solo si se deselecciona la subárea explícitamente
      setSelectedSubstanceIds([]);
      setInitialSubstanceIds([]);
    }
  }, [selectedSubareaId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [depts, substances] = await Promise.all([
        getAllDepartments(),
        getChemicalSubstances(),
      ]);
      setDepartments(depts);
      setAllSubstances(substances.filter((s) => s.isActive));
    } catch (error) {
      showError("Error al cargar datos", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSubareas = async () => {
    if (!selectedDepartmentId) return;
    try {
      const data = await getSubareasByDepartment(selectedDepartmentId);
      setSubareas(data);
    } catch (error) {
      showError("Error al cargar subáreas", error);
    }
  };

  const loadSubareaSubstances = async () => {
    if (!selectedSubareaId) return;
    try {
      setLoading(true);
      const data = await getSubareaSubstancesMatrix(selectedSubareaId);
      const assignedIds = data.substances.map((s) => s.id);
      setSelectedSubstanceIds(assignedIds);
      setInitialSubstanceIds(assignedIds);
    } catch (error) {
      showError("Error al cargar sustancias de la subárea", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubstance = (substanceId: string) => {
    setSelectedSubstanceIds((prev) =>
      prev.includes(substanceId)
        ? prev.filter((id) => id !== substanceId)
        : [...prev, substanceId]
    );
  };

  const handleSave = async () => {
    if (!selectedSubareaId) {
      showError("Error", "Debes seleccionar una subárea");
      return;
    }

    try {
      setLoading(true);

      const substancesToAdd = selectedSubstanceIds.filter(
        (id) => !initialSubstanceIds.includes(id)
      );
      const substancesToRemove = initialSubstanceIds.filter(
        (id) => !selectedSubstanceIds.includes(id)
      );

      const promises: Promise<void>[] = [];

      if (substancesToAdd.length > 0) {
        promises.push(
          assignSubstancesToSubarea(selectedSubareaId, {
            substanceIds: substancesToAdd,
          })
        );
      }

      if (substancesToRemove.length > 0) {
        promises.push(
          removeSubstancesFromSubarea(selectedSubareaId, {
            substanceIds: substancesToRemove,
          })
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      let message = "";
      if (substancesToAdd.length > 0 && substancesToRemove.length > 0) {
        message = `Se agregaron ${substancesToAdd.length} sustancia(s) y se removieron ${substancesToRemove.length} sustancia(s).`;
      } else if (substancesToAdd.length > 0) {
        message = `Se agregaron ${substancesToAdd.length} sustancia(s) correctamente.`;
      } else if (substancesToRemove.length > 0) {
        message = `Se removieron ${substancesToRemove.length} sustancia(s) correctamente.`;
      } else {
        message = "No se realizaron cambios.";
      }

      showSuccess("Sustancias actualizadas", message);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      showError("Error al actualizar sustancias", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubstances = useMemo(() => {
    return allSubstances.filter((s) => s.isActive);
  }, [allSubstances]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar Sustancias a Subáreas</DialogTitle>
          <DialogDescription>
            Selecciona un departamento y una subárea para gestionar las sustancias químicas asociadas.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Cargando datos...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selector de Departamento */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Departamento *
              </label>
              <Select
                value={selectedDepartmentId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedDepartmentId(value ? parseInt(value, 10) : null);
                  setSelectedSubareaId(null);
                  setSelectedSubstanceIds([]);
                  setInitialSubstanceIds([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Subárea */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Subárea *
              </label>
              <Select
                value={selectedSubareaId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedSubareaId(value ? parseInt(value, 10) : null);
                }}
                disabled={!selectedDepartmentId || subareas.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una subárea" />
                </SelectTrigger>
                <SelectContent>
                  {subareas.map((subarea) => (
                    <SelectItem key={subarea.id} value={subarea.id.toString()}>
                      {subarea.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDepartmentId && subareas.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No hay subáreas disponibles para este departamento
                </p>
              )}
            </div>

            {/* Lista de Sustancias */}
            {selectedSubareaId && (
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Sustancias ({selectedSubstanceIds.length} seleccionadas)
                </h4>
                <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4">
                  {loading ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Cargando sustancias...
                    </div>
                  ) : filteredSubstances.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No hay sustancias disponibles
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredSubstances.map((substance) => {
                        const isSelected = selectedSubstanceIds.includes(substance.id);
                        return (
                          <button
                            key={substance.id}
                            type="button"
                            onClick={() => handleToggleSubstance(substance.id)}
                            className={`
                              relative p-3 rounded-lg border-2 transition-all text-left
                              ${
                                isSelected
                                  ? "border-primary bg-primary/10 dark:bg-primary/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }
                            `}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            <div className="font-medium text-sm">{substance.name}</div>
                            {substance.casNumber && (
                              <div className="text-xs text-gray-500 mt-1">
                                CAS: {substance.casNumber}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !selectedSubareaId || loadingData}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

