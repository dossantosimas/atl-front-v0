"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import { X } from "lucide-react";
import type { MicroType } from "@/lib/types/micro-types";
import type { AnalysisType } from "@/lib/types/micro-analysis";
import type { MicroElement } from "@/lib/types/micro-elements";
import type { MicroProgram } from "@/lib/types/micro-programs";
import {
  getMicroTypes,
  getMicroTypeById,
  removeAnalysisTypeFromMicroType,
  updateMicroTypeAnalysisTypes,
  updateAnalysisPtsConfig,
  associateElementToMicroType,
  disassociateElementFromMicroType,
} from "@/lib/services/micro-types.service";
import { getAnalysisTypes } from "@/lib/services/analysis-types.service";
import {
  getMicroElements,
  getMicroElementsByTypeAndProgram,
} from "@/lib/services/micro-elements.service";
import { getMicroPrograms } from "@/lib/services/micro-programs.service";
import {
  createMicroElementTypeProgram,
  deleteMicroElementTypeProgram,
  getMicroElementTypeProgramsByType,
} from "@/lib/services/micro-element-type-programs.service";
import type { MicroElementTypeProgram } from "@/lib/types/micro-element-type-programs";
import { Checkbox } from "@/components/ui/checkbox";
import { AnalysisTypesCombobox } from "./analysis-types-combobox";
import { ElementsCombobox } from "./elements-combobox";
import { EventTypesCombobox } from "./event-types-combobox";

export function AssociationsManager() {
  const [eventTypes, setEventTypes] = useState<MicroType[]>([]);
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);
  const [elements, setElements] = useState<MicroElement[]>([]);
  const [programs, setPrograms] = useState<MicroProgram[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedProgramId] = useState<string>("");
  const [selectedEventTypeData, setSelectedEventTypeData] = useState<MicroType | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [associatedElementsByProgram, setAssociatedElementsByProgram] = useState<MicroElement[]>([]);
  const [typeProgramRelations, setTypeProgramRelations] = useState<MicroElementTypeProgram[]>([]);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [selectedElementForPrograms, setSelectedElementForPrograms] = useState<MicroElement | null>(null);
  const [togglingProgramKey, setTogglingProgramKey] = useState<string | null>(null);
  const [analysisPtsConfig, setAnalysisPtsConfig] = useState<Record<string, { microIndexOn: boolean; weighted: string }>>({});
  const [savingAnalysisId, setSavingAnalysisId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingElementsByProgram, setLoadingElementsByProgram] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEventType) {
      loadEventTypeDetails(selectedEventType);
      loadTypeProgramRelations(selectedEventType);
    } else {
      setSelectedEventTypeData(null);
      setAssociatedElementsByProgram([]);
      setTypeProgramRelations([]);
    }
  }, [selectedEventType]);

  useEffect(() => {
    if (!selectedEventType || !selectedProgramId) {
      setAssociatedElementsByProgram([]);
      return;
    }
    loadElementsByTypeAndProgram(selectedEventType, selectedProgramId);
  }, [selectedEventType, selectedProgramId]);

  useEffect(() => {
    const nextConfig: Record<string, { microIndexOn: boolean; weighted: string }> = {};
    (selectedEventTypeData?.analysisTypes || []).forEach((analysisType) => {
      nextConfig[analysisType.id] = {
        microIndexOn: Boolean(analysisType.microIndexOn),
        weighted:
          analysisType.weighted === null || analysisType.weighted === undefined
            ? ""
            : String(analysisType.weighted),
      };
    });
    setAnalysisPtsConfig(nextConfig);
  }, [selectedEventTypeData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, analyses, elems, progs] = await Promise.all([
        getMicroTypes(),
        getAnalysisTypes(),
        getMicroElements(),
        getMicroPrograms(),
      ]);
      setEventTypes(types);
      setAnalysisTypes(analyses);
      setElements(elems);
      setPrograms(progs);
    } catch (error) {
      showError("Error al cargar datos", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypeDetails = async (id: string) => {
    try {
      const type = await getMicroTypeById(id);
      setSelectedEventTypeData(type);
    } catch (error) {
      showError("Error al cargar detalles del tipo de evento", error);
    }
  };

  const loadElementsByTypeAndProgram = async (typeId: string, programId: string) => {
    try {
      setLoadingElementsByProgram(true);
      const data = await getMicroElementsByTypeAndProgram(typeId, programId);
      setAssociatedElementsByProgram(data);
    } catch (error) {
      showError("Error al cargar elementos asociados por programa", error);
      setAssociatedElementsByProgram([]);
    } finally {
      setLoadingElementsByProgram(false);
    }
  };

  const loadTypeProgramRelations = async (typeId: string) => {
    try {
      const rows = await getMicroElementTypeProgramsByType(typeId);
      setTypeProgramRelations(rows);
    } catch {
      setTypeProgramRelations([]);
    }
  };

  const openProgramsDialog = (element: MicroElement) => {
    setSelectedElementForPrograms(element);
    setProgramDialogOpen(true);
  };

  const isProgramCheckedForElement = (elementId: number, programId: string) => {
    return typeProgramRelations.some(
      (row) =>
        row.typeId === selectedEventType &&
        row.elementId === elementId &&
        row.programId === programId
    );
  };

  const handleToggleProgramForElement = async (
    elementId: number,
    programId: string,
    checked: boolean
  ) => {
    if (!selectedEventType) return;
    const rowKey = `${elementId}-${programId}`;
    try {
      setTogglingProgramKey(rowKey);
      if (checked) {
        await createMicroElementTypeProgram({
          typeId: selectedEventType,
          elementId,
          programId,
        });
      } else {
        await deleteMicroElementTypeProgram({
          typeId: selectedEventType,
          elementId,
          programId,
        });
      }

      await loadTypeProgramRelations(selectedEventType);

      if (selectedProgramId) {
        await loadElementsByTypeAndProgram(selectedEventType, selectedProgramId);
      }
    } catch (error) {
      showError("Error al actualizar programa del elemento", error);
    } finally {
      setTogglingProgramKey(null);
    }
  };

  const handleAssociateAnalysisType = async (analysisTypeId: string) => {
    if (!selectedEventType || !selectedEventTypeData || !analysisTypeId) return;
    try {
      const existingAnalysisTypeIds = (selectedEventTypeData.analysisTypes || []).map((at) => at.id);
      const allAnalysisTypeIds = Array.from(new Set([...existingAnalysisTypeIds, analysisTypeId]));
      await updateMicroTypeAnalysisTypes(selectedEventType, allAnalysisTypeIds);
      showSuccess("Tipo de análisis asociado", "El tipo de análisis se ha asociado correctamente.");
      
      // Actualizar el estado local sin recargar todo
      const analysisType = analysisTypes.find(at => at.id === analysisTypeId);
      if (analysisType && selectedEventTypeData) {
        setSelectedEventTypeData({
          ...selectedEventTypeData,
          analysisTypes: [...(selectedEventTypeData.analysisTypes || []), analysisType],
        });
        setSelectedAnalysisType(""); // Resetear el selector
      }
    } catch (error) {
      showError("Error al asociar tipo de análisis", error);
    }
  };

  const handleDisassociateAnalysisType = async (analysisTypeId: string) => {
    if (!selectedEventType || !selectedEventTypeData) return;
    try {
      await removeAnalysisTypeFromMicroType(selectedEventType, analysisTypeId);
      showSuccess("Tipo de análisis desasociado", "El tipo de análisis se ha desasociado correctamente.");
      
      // Actualizar el estado local sin recargar todo
      if (selectedEventTypeData) {
        setSelectedEventTypeData({
          ...selectedEventTypeData,
          analysisTypes: (selectedEventTypeData.analysisTypes || []).filter(at => at.id !== analysisTypeId),
        });
      }
    } catch (error) {
      showError("Error al desasociar tipo de análisis", error);
    }
  };

  const handlePtsOnChange = async (analysisTypeId: string, value: "on" | "off") => {
    const microIndexOn = value === "on";
    const current = analysisPtsConfig[analysisTypeId] ?? { microIndexOn: false, weighted: "" };

    setAnalysisPtsConfig((prev) => ({
      ...prev,
      [analysisTypeId]: { ...current, microIndexOn },
    }));

    if (!microIndexOn) {
      await handleSaveAnalysisPtsConfig(analysisTypeId, { microIndexOn: false, weighted: "0" });
    }
  };

  const handleSaveAnalysisPtsConfig = async (
    analysisTypeId: string,
    override?: { microIndexOn: boolean; weighted: string }
  ) => {
    if (!selectedEventType) return;

    const config = override ?? analysisPtsConfig[analysisTypeId] ?? { microIndexOn: false, weighted: "" };
    const normalizedWeighted = config.weighted.replace(",", ".");
    const weightedValue = config.microIndexOn ? Number(normalizedWeighted) : 0;

    if (config.microIndexOn) {
      if (!normalizedWeighted.trim() || Number.isNaN(weightedValue)) {
        showError("Ponderado inválido", new Error("Ingrese un valor numérico para el ponderado."));
        return;
      }

      if (weightedValue < 0 || weightedValue > 1) {
        showError("Ponderado inválido", new Error("El ponderado debe estar entre 0 y 1."));
        return;
      }
    }

    try {
      setSavingAnalysisId(analysisTypeId);
      await updateAnalysisPtsConfig(selectedEventType, {
        analysisTypeId,
        weighted: weightedValue,
        microIndexOn: config.microIndexOn,
      });

      setSelectedEventTypeData((prev) =>
        prev
          ? {
              ...prev,
              analysisTypes: (prev.analysisTypes || []).map((analysisType) =>
                analysisType.id === analysisTypeId
                  ? {
                      ...analysisType,
                      microIndexOn: config.microIndexOn,
                      weighted: config.microIndexOn ? weightedValue : 0,
                    }
                  : analysisType
              ),
            }
          : prev
      );

      showSuccess("MicroIndex actualizado", "La configuración de MicroIndex del análisis se guardó correctamente.");
    } catch (error) {
      showError("Error al actualizar MicroIndex", error);
    } finally {
      setSavingAnalysisId(null);
    }
  };

  const handleAssociateElement = async (elementId: string) => {
    if (!selectedEventType || !elementId) return;
    try {
      if (selectedProgramId) {
        await createMicroElementTypeProgram({
          typeId: selectedEventType,
          elementId: Number(elementId),
          programId: selectedProgramId,
        });
      } else {
        await associateElementToMicroType(selectedEventType, Number(elementId));
      }
      showSuccess("Elemento asociado", "El elemento se ha asociado correctamente.");

      const element = elements.find(el => String(el.id) === elementId);
      if (element) {
        if (selectedProgramId) {
          setAssociatedElementsByProgram((prev) => [...prev, element]);
        } else {
          setSelectedEventTypeData((prev) =>
            prev ? { ...prev, elements: [...(prev.elements || []), element] } : prev
          );
        }
        setSelectedElement("");
      }
      await loadTypeProgramRelations(selectedEventType);
    } catch (error) {
      showError("Error al asociar elemento", error);
    }
  };

  const handleDisassociateElement = async (elementId: number) => {
    if (!selectedEventType) return;
    try {
      if (selectedProgramId) {
        await deleteMicroElementTypeProgram({
          typeId: selectedEventType,
          elementId,
          programId: selectedProgramId,
        });
      } else {
        await disassociateElementFromMicroType(selectedEventType, elementId);
      }
      showSuccess("Elemento desasociado", "El elemento se ha desasociado correctamente.");
      if (selectedProgramId) {
        setAssociatedElementsByProgram((prev) => prev.filter((el) => el.id !== elementId));
      } else {
        setSelectedEventTypeData((prev) =>
          prev
            ? { ...prev, elements: (prev.elements || []).filter((el) => el.id !== elementId) }
            : prev
        );
      }
      await loadTypeProgramRelations(selectedEventType);
    } catch (error) {
      showError("Error al desasociar elemento", error);
    }
  };

  const availableAnalysisTypes = analysisTypes.filter(
    (at) => !selectedEventTypeData?.analysisTypes?.some((sat) => sat.id === at.id)
  );

  const availableElements = elements.filter(
    (el) =>
      !(selectedProgramId ? associatedElementsByProgram : selectedEventTypeData?.elements || []).some(
        (associated) => associated.id === el.id
      )
  );

  if (loading) {
    return <div className="text-center py-8">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Asociaciones</h3>
        <div className="mb-4">
          <label htmlFor="eventType" className="text-sm font-medium mb-2 block">
            Seleccionar Tipo de Evento
          </label>
          <EventTypesCombobox
            eventTypes={eventTypes}
            value={selectedEventType}
            onValueChange={setSelectedEventType}
            placeholder="Seleccione un tipo de evento"
          />
        </div>
      </div>

      {selectedEventType && selectedEventTypeData && (
        <div className="space-y-4">
          {/* Tipos de Análisis Asociados */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Tipos de Análisis Asociados
              </h4>
              {availableAnalysisTypes.length > 0 && (
                <div className="flex gap-2">
                  <AnalysisTypesCombobox
                    analysisTypes={availableAnalysisTypes}
                    value={selectedAnalysisType}
                    onValueChange={(value) => {
                      setSelectedAnalysisType(value);
                      if (value) {
                        handleAssociateAnalysisType(value);
                      }
                    }}
                    placeholder="Agregar tipo de análisis"
                  />
                </div>
              )}
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Opciones</TableHead>
                    <TableHead className="font-semibold">Condición</TableHead>
                    <TableHead className="font-semibold">Umbral</TableHead>
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">MicroIndex</TableHead>
                    <TableHead className="font-semibold">Ponderado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedEventTypeData.analysisTypes || selectedEventTypeData.analysisTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                        No hay tipos de análisis asociados
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedEventTypeData.analysisTypes.map((at) => {
                      const config = analysisPtsConfig[at.id] ?? {
                        microIndexOn: Boolean(at.microIndexOn),
                        weighted:
                          at.weighted === null || at.weighted === undefined ? "" : String(at.weighted),
                      };

                      return (
                      <TableRow key={at.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium">{at.name}</TableCell>
                        <TableCell>{at.options}</TableCell>
                        <TableCell>{at.condition || "-"}</TableCell>
                        <TableCell>{at.threshold || "-"}</TableCell>
                        <TableCell>{at.code}</TableCell>
                        <TableCell>
                          <Select
                            value={config.microIndexOn ? "on" : "off"}
                            onValueChange={(value: "on" | "off") => handlePtsOnChange(at.id, value)}
                          >
                            <SelectTrigger className="w-[96px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on">On</SelectItem>
                              <SelectItem value="off">Off</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={config.weighted}
                              onChange={(event) =>
                                setAnalysisPtsConfig((prev) => ({
                                  ...prev,
                                  [at.id]: {
                                    ...config,
                                    weighted: event.target.value,
                                  },
                                }))
                              }
                              placeholder="0.75"
                              className="w-[100px]"
                              disabled={!config.microIndexOn}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveAnalysisPtsConfig(at.id)}
                              disabled={
                                savingAnalysisId === at.id ||
                                !config.microIndexOn ||
                                !config.weighted.trim()
                              }
                            >
                              Guardar
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisassociateAnalysisType(at.id)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Elementos Asociados */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {selectedProgramId ? "Elementos Asociados al Programa" : "Elementos Asociados al Tipo"}
              </h4>
              {availableElements.length > 0 && (
                <div className="flex gap-2">
                  <ElementsCombobox
                    elements={availableElements}
                    value={selectedElement}
                    onValueChange={(value) => {
                      setSelectedElement(value);
                      if (value) {
                        handleAssociateElement(value);
                      }
                    }}
                    placeholder="Agregar elemento"
                  />
                </div>
              )}
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Micro Program</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProgramId && loadingElementsByProgram ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        Cargando elementos asociados...
                      </TableCell>
                    </TableRow>
                  ) : (selectedProgramId
                      ? associatedElementsByProgram
                      : selectedEventTypeData?.elements || []
                    ).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        {selectedProgramId
                          ? "No hay elementos asociados para este programa"
                          : "No hay elementos asociados para este tipo"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (selectedProgramId
                      ? associatedElementsByProgram
                      : selectedEventTypeData?.elements || []
                    ).map((el) => (
                      <TableRow key={el.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50">
                        <TableCell>{el.id}</TableCell>
                        <TableCell className="font-medium">{el.name}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openProgramsDialog(el)}
                          >
                            Programas
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisassociateElement(el.id)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {!selectedEventType && (
        <div className="text-center py-8 text-gray-500">
          Seleccione un tipo de evento para ver y gestionar sus asociaciones
        </div>
      )}

      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Relación con Micro Program</DialogTitle>
            <DialogDescription>
              {selectedElementForPrograms
                ? `Seleccione los programas asociados para ${selectedElementForPrograms.name}.`
                : "Seleccione los programas asociados para este elemento."}
            </DialogDescription>
          </DialogHeader>

          {!selectedElementForPrograms ? (
            <div className="text-sm text-gray-500">Seleccione un elemento para configurar programas.</div>
          ) : programs.length === 0 ? (
            <div className="text-sm text-gray-500">
              No hay programas disponibles para asociar.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {programs.map((program) => {
                const rowKey = `${selectedElementForPrograms.id}-${program.id}`;
                const checked = isProgramCheckedForElement(selectedElementForPrograms.id, program.id);
                const disabled = togglingProgramKey === rowKey;

                return (
                  <label
                    key={program.id}
                    className="flex items-center gap-3 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(value) =>
                        handleToggleProgramForElement(
                          selectedElementForPrograms.id,
                          program.id,
                          Boolean(value)
                        )
                      }
                    />
                    <span className="text-sm">{program.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

