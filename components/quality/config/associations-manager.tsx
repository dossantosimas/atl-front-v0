"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/toast";
import { X } from "lucide-react";
import type { MicroType } from "@/lib/types/micro-types";
import type { AnalysisType } from "@/lib/types/micro-analysis";
import type { MicroElement } from "@/lib/types/micro-elements";
import {
  getMicroTypes,
  getMicroTypeById,
  associateAnalysisTypeToMicroType,
  disassociateAnalysisTypeFromMicroType,
  associateElementToMicroType,
  disassociateElementFromMicroType,
} from "@/lib/services/micro-types.service";
import { getAnalysisTypes } from "@/lib/services/analysis-types.service";
import { getMicroElements } from "@/lib/services/micro-elements.service";
import { AnalysisTypesCombobox } from "./analysis-types-combobox";
import { ElementsCombobox } from "./elements-combobox";

interface AssociationsManagerProps {
  onRefreshAnalysisTypes?: () => void;
  onRefreshElements?: () => void;
}

export function AssociationsManager({ onRefreshAnalysisTypes, onRefreshElements }: AssociationsManagerProps) {
  const [eventTypes, setEventTypes] = useState<MicroType[]>([]);
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);
  const [elements, setElements] = useState<MicroElement[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedEventTypeData, setSelectedEventTypeData] = useState<MicroType | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEventType) {
      loadEventTypeDetails(selectedEventType);
    } else {
      setSelectedEventTypeData(null);
    }
  }, [selectedEventType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, analyses, elems] = await Promise.all([
        getMicroTypes(),
        getAnalysisTypes(),
        getMicroElements(),
      ]);
      setEventTypes(types);
      setAnalysisTypes(analyses);
      setElements(elems);
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

  const handleAssociateAnalysisType = async (analysisTypeId: string) => {
    if (!selectedEventType || !selectedEventTypeData || !analysisTypeId) return;
    try {
      await associateAnalysisTypeToMicroType(selectedEventType, analysisTypeId);
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
      await disassociateAnalysisTypeFromMicroType(selectedEventType, analysisTypeId);
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

  const handleAssociateElement = async (elementId: string) => {
    if (!selectedEventType || !selectedEventTypeData || !elementId) return;
    try {
      await associateElementToMicroType(selectedEventType, Number(elementId));
      showSuccess("Elemento asociado", "El elemento se ha asociado correctamente.");
      
      // Actualizar el estado local sin recargar todo
      const element = elements.find(el => String(el.id) === elementId);
      if (element && selectedEventTypeData) {
        setSelectedEventTypeData({
          ...selectedEventTypeData,
          elements: [...(selectedEventTypeData.elements || []), element],
        });
        setSelectedElement(""); // Resetear el selector
      }
    } catch (error) {
      showError("Error al asociar elemento", error);
    }
  };

  const handleDisassociateElement = async (elementId: number) => {
    if (!selectedEventType || !selectedEventTypeData) return;
    try {
      await disassociateElementFromMicroType(selectedEventType, elementId);
      showSuccess("Elemento desasociado", "El elemento se ha desasociado correctamente.");
      
      // Actualizar el estado local sin recargar todo
      if (selectedEventTypeData) {
        setSelectedEventTypeData({
          ...selectedEventTypeData,
          elements: (selectedEventTypeData.elements || []).filter(el => el.id !== elementId),
        });
      }
    } catch (error) {
      showError("Error al desasociar elemento", error);
    }
  };

  const availableAnalysisTypes = analysisTypes.filter(
    (at) => !selectedEventTypeData?.analysisTypes?.some((sat) => sat.id === at.id)
  );

  const availableElements = elements.filter(
    (el) => !selectedEventTypeData?.elements?.some((sel) => sel.id === el.id)
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
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione un tipo de evento" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedEventTypeData.analysisTypes || selectedEventTypeData.analysisTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No hay tipos de análisis asociados
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedEventTypeData.analysisTypes.map((at) => (
                      <TableRow key={at.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium">{at.name}</TableCell>
                        <TableCell>{at.options}</TableCell>
                        <TableCell>{at.condition || "-"}</TableCell>
                        <TableCell>{at.threshold || "-"}</TableCell>
                        <TableCell>{at.code}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Elementos Asociados */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Elementos Asociados
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
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedEventTypeData.elements || selectedEventTypeData.elements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                        No hay elementos asociados
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedEventTypeData.elements.map((el) => (
                      <TableRow key={el.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50">
                        <TableCell>{el.id}</TableCell>
                        <TableCell className="font-medium">{el.name}</TableCell>
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
    </div>
  );
}

