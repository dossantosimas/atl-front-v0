"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MicroTypeSelector } from "@/components/quality_v0/micro-type-selector";
import { ElementsMultiSelect } from "./elements-multi-select";
import { getMicroElementsByType } from "@/lib/services/micro-elements.service";
import { createMicroSchedule } from "@/lib/services/micro-schedules.service";
import type { MicroElement } from "@/lib/types/micro-elements";
import { useToast } from "@/components/toast";
import { Loader2 } from "lucide-react";
import { FrequencyConfigurator } from "./frequency-configurator";

import { getQualityTypes } from "@/lib/services/quality-types.service";
import { getAllDepartments } from "@/lib/services/departments.service";
import type { QualityType } from "@/lib/types/quality-types";
import type { Department } from "@/lib/types/departments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleCreated?: () => void;
}

export function CreateScheduleModal({
  open,
  onOpenChange,
  onScheduleCreated,
}: CreateScheduleModalProps) {
  const [name, setName] = useState("");
  const [qualityTypeId, setQualityTypeId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [eventTypeId, setEventTypeId] = useState<string>("");
  const [frequency, setFrequency] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [timezone, setTimezone] = useState("America/Bogota");
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [elements, setElements] = useState<MicroElement[]>([]);
  const [qualityTypes, setQualityTypes] = useState<QualityType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (open) {
      // Resetear valores cuando se abre el modal
      setName("");
      setQualityTypeId("");
      setDepartmentId("");
      setEventTypeId("");
      // No resetear frequency aquí - el FrequencyConfigurator generará uno por defecto automáticamente
      setDescription("");
      setIsActive(true);
      setTimezone("America/Bogota");
      setSelectedElementIds([]);
      setElements([]);
      loadInitialData();
    } else {
      // Solo resetear frequency cuando se cierra el modal para permitir que se genere uno nuevo la próxima vez
      setFrequency("");
    }
  }, [open]);

  const loadInitialData = async () => {
    try {
      const [qtData, deptData] = await Promise.all([
        getQualityTypes(),
        getAllDepartments()
      ]);
      setQualityTypes(qtData);
      setDepartments(deptData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  useEffect(() => {
    if (open && eventTypeId) {
      loadElements();
    } else {
      setElements([]);
      setSelectedElementIds([]);
    }
  }, [open, eventTypeId]);

  // Resetear eventTypeId cuando cambie qualityTypeId o departmentId
  useEffect(() => {
    setEventTypeId("");
  }, [qualityTypeId, departmentId]);

  const loadElements = async () => {
    if (!eventTypeId) return;

    try {
      setLoading(true);
      const data = await getMicroElementsByType(eventTypeId);
      setElements(data);
    } catch (error) {
      showError("Error al cargar elementos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !eventTypeId || !frequency) {
      showError("Error", new Error("Debe completar todos los campos obligatorios"));
      return;
    }

    try {
      setSaving(true);

      const elementIdsArray = selectedElementIds.length > 0
        ? selectedElementIds.map(id => parseInt(id, 10))
        : null;

      await createMicroSchedule({
        name,
        eventTypeId,
        frequency,
        description: description || null,
        isActive,
        elementIds: elementIdsArray,
        timezone,
      });

      showSuccess("Schedule creado correctamente");
      onScheduleCreated?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      showError("Error al crear el schedule", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">
            Crear Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Nombre *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Fermentación cada 30 segundos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                Tipo de Calidad *
              </label>
              <Select
                value={qualityTypeId}
                onValueChange={setQualityTypeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona calidad" />
                </SelectTrigger>
                <SelectContent>
                  {qualityTypes.map((qt) => (
                    <SelectItem key={qt.id} value={qt.id.toString()}>
                      {qt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                Departamento *
              </label>
              <Select
                value={departmentId}
                onValueChange={setDepartmentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona departamento" />
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
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Tipo de Evento *
            </label>
            <MicroTypeSelector
              value={eventTypeId}
              onValueChange={setEventTypeId}
              placeholder={qualityTypeId && departmentId ? "Selecciona tipo" : "Primero elige calidad y departamento"}
              qualityTypeId={qualityTypeId ? parseInt(qualityTypeId, 10) : undefined}
              departmentId={departmentId ? parseInt(departmentId, 10) : undefined}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Frecuencia *
            </label>
            {open && (
              <FrequencyConfigurator
                key={open ? "open" : "closed"} // Forzar remontaje cuando se abre el modal
                value={frequency}
                onChange={setFrequency}
              />
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Elementos
            </label>
            {eventTypeId ? (
              <ElementsMultiSelect
                elements={elements}
                value={selectedElementIds}
                onValueChange={setSelectedElementIds}
                loading={loading}
                placeholder="Selecciona elementos (opcional)"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Primero selecciona un tipo de evento
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Descripción
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del schedule..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                Zona Horaria
              </label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="America/Bogota"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Activo
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name || !eventTypeId || !frequency}
              size="sm"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

