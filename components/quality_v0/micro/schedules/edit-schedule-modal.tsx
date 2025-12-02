"use client";

import { useState, useEffect } from "react";
import type { MicroSchedule } from "@/lib/types/micro-schedules";
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
import { updateMicroSchedule } from "@/lib/services/micro-schedules.service";
import type { MicroElement } from "@/lib/types/micro-elements";
import { useToast } from "@/components/toast";
import { Loader2 } from "lucide-react";

interface EditScheduleModalProps {
  schedule: MicroSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleUpdated?: () => void;
}

export function EditScheduleModal({
  schedule,
  open,
  onOpenChange,
  onScheduleUpdated,
}: EditScheduleModalProps) {
  const [name, setName] = useState("");
  const [eventTypeId, setEventTypeId] = useState<string>("");
  const [frequency, setFrequency] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [timezone, setTimezone] = useState("America/Bogota");
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [elements, setElements] = useState<MicroElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (open && schedule) {
      setName(schedule.name || "");
      setEventTypeId(schedule.eventType?.id || "");
      setFrequency(schedule.frequency || "");
      setDescription(schedule.description || "");
      setIsActive(schedule.isActive ?? true);
      setTimezone(schedule.timezone || "America/Bogota");
      
      // Cargar elementos seleccionados
      if (schedule.elementIds) {
        setSelectedElementIds(schedule.elementIds.split(",").filter(Boolean));
      } else {
        setSelectedElementIds([]);
      }
    }
  }, [open, schedule]);

  useEffect(() => {
    if (open && eventTypeId) {
      loadElements();
    } else {
      setElements([]);
    }
  }, [open, eventTypeId]);

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
    if (!schedule) return;

    if (!name || !eventTypeId || !frequency) {
      showError("Error", new Error("Debe completar todos los campos obligatorios"));
      return;
    }

    try {
      setSaving(true);

      const elementIdsArray = selectedElementIds.length > 0
        ? selectedElementIds.map(id => parseInt(id, 10))
        : null;

      await updateMicroSchedule(schedule.id, {
        name,
        eventTypeId,
        frequency,
        description: description || null,
        isActive,
        elementIds: elementIdsArray,
        timezone,
      });

      showSuccess("Schedule actualizado correctamente");
      onScheduleUpdated?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      showError("Error al actualizar el schedule", error);
    } finally {
      setSaving(false);
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">
            Editar Schedule
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

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Tipo de Evento *
            </label>
            <MicroTypeSelector
              value={eventTypeId}
              onValueChange={setEventTypeId}
              placeholder="Selecciona un tipo de evento"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Frecuencia (Cron) *
            </label>
            <Input
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="Ej: */30 * * * * * (cada 30 segundos)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formato: segundo minuto hora día mes día-semana
            </p>
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
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

