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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/toast";
import { X, Plus } from "lucide-react";
import type { QualityType } from "@/lib/types/quality-types";
import type { MicroType } from "@/lib/types/micro-types";
import { getMicroTypes } from "@/lib/services/micro-types.service";
import {
  associateMicroTypeToQualityType,
  disassociateMicroTypeFromQualityType,
  getQualityTypeById,
} from "@/lib/services/quality-types.service";

interface QualityTypeAssociationsModalProps {
  qualityType: QualityType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function QualityTypeAssociationsModal({
  qualityType,
  open,
  onOpenChange,
  onClose,
}: QualityTypeAssociationsModalProps) {
  const [microTypes, setMicroTypes] = useState<MicroType[]>([]);
  const [selectedQualityType, setSelectedQualityType] = useState<QualityType | null>(null);
  const [selectedMicroTypeId, setSelectedMicroTypeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, qualityType]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Recargar micro types para obtener los qualityTypeId actualizados
      const types = await getMicroTypes();
      // Recargar el quality type para obtener los micro_types asociados actualizados
      const qualityTypeData = await getQualityTypeById(qualityType.id);
      console.log("Micro types cargados:", types);
      console.log("Quality type cargado:", qualityTypeData);
      console.log("Quality type id:", qualityType.id);
      setMicroTypes(types);
      setSelectedQualityType(qualityTypeData);
    } catch (error) {
      showError("Error al cargar datos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssociate = async () => {
    if (!selectedMicroTypeId || !selectedQualityType) return;
    
    // Verificar que el micro_type no esté ya asociado a otro quality_type
    const selectedMicroType = microTypes.find(mt => mt.id === selectedMicroTypeId);
    if (selectedMicroType?.qualityTypeId && selectedMicroType.qualityTypeId !== selectedQualityType.id) {
      showError(
        "Error al asociar tipo micro",
        new Error(`Este tipo micro ya está asociado a otro tipo de calidad. Debe desasociarlo primero.`)
      );
      return;
    }
    
    try {
      await associateMicroTypeToQualityType(selectedQualityType.id, selectedMicroTypeId);
      showSuccess("Tipo micro asociado", "El tipo micro se ha asociado correctamente.");
      await loadData();
      setSelectedMicroTypeId("");
    } catch (error) {
      showError("Error al asociar tipo micro", error);
    }
  };

  const handleDisassociate = async (microTypeId: string) => {
    try {
      // PUT /micro-types/:id con { qualityTypeId: null }
      await disassociateMicroTypeFromQualityType(microTypeId);
      showSuccess("Tipo micro desasociado", "El tipo micro se ha desasociado correctamente.");
      // Refrescar datos: GET /quality-types/:id y GET /micro-types
      await loadData();
    } catch (error) {
      showError("Error al desasociar tipo micro", error);
    }
  };

  // Los micro_types asociados al quality_type actual son los que tienen su qualityTypeId
  // Primero intentamos usar microTypes del quality_type si está disponible, sino filtramos por qualityTypeId
  const associatedMicroTypes = selectedQualityType?.microTypes && selectedQualityType.microTypes.length > 0
    ? selectedQualityType.microTypes
    : microTypes.filter(mt => {
        const isAssociated = mt.qualityTypeId === selectedQualityType?.id || mt.qualityTypeId === qualityType.id;
        return isAssociated;
      });
  
  // Solo mostrar micro_types que:
  // 1. No tienen qualityTypeId (no están asociados a ningún quality_type)
  // 2. O tienen el qualityTypeId del quality_type actual (ya están asociados a este)
  const availableMicroTypes = microTypes.filter(mt => 
    !mt.qualityTypeId || mt.qualityTypeId === selectedQualityType?.id || mt.qualityTypeId === qualityType.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relacionar Tipos Micro con {qualityType.name}</DialogTitle>
          <DialogDescription>
            Asocia tipos micro a este tipo de calidad. Los tipos micro ya asociados se muestran en la tabla.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Cargando datos...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Formulario para agregar asociación */}
            <div className="flex gap-2">
              <Select value={selectedMicroTypeId} onValueChange={setSelectedMicroTypeId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona un tipo micro" />
                </SelectTrigger>
                <SelectContent>
                  {availableMicroTypes.filter(mt => mt.qualityTypeId !== selectedQualityType?.id).length === 0 ? (
                    <SelectItem value="none" disabled>
                      No hay tipos micro disponibles
                    </SelectItem>
                  ) : (
                    availableMicroTypes
                      .filter(mt => mt.qualityTypeId !== selectedQualityType?.id)
                      .map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.description || type.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAssociate}
                disabled={!selectedMicroTypeId || availableMicroTypes.filter(mt => mt.qualityTypeId !== selectedQualityType?.id).length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            {/* Tabla de tipos micro asociados */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associatedMicroTypes.length > 0 ? (
                    associatedMicroTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.description}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDisassociate(type.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 dark:text-gray-400">
                        Agregar asociaciones
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

