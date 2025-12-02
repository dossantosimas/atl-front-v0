"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMicroElementsByType } from "@/lib/services/micro-elements.service";
import { createMicroEvent } from "@/lib/services/micro-events.service";
import type { MicroElement } from "@/lib/types/micro-elements";
import { useToast } from "@/components/toast";
import { Loader2 } from "lucide-react";
import { ElementsCombobox } from "./elements-combobox";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  typeId: string | undefined;
  onEventCreated?: () => void;
}

export function CreateEventModal({
  open,
  onOpenChange,
  typeId,
  onEventCreated,
}: CreateEventModalProps) {
  const [elements, setElements] = useState<MicroElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (open && typeId) {
      loadElements();
    } else {
      // Resetear valores cuando se cierra el modal
      setSelectedElementId("");
      setDate("");
      setElements([]);
    }
  }, [open, typeId]);

  const loadElements = async () => {
    if (!typeId) return;
    
    try {
      setLoading(true);
      const data = await getMicroElementsByType(typeId);
      setElements(data);
    } catch (error) {
      showError("Error al cargar elementos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!typeId || !selectedElementId || !date) {
      showError("Error", new Error("Debe completar todos los campos"));
      return;
    }

    try {
      setSaving(true);
      
      // Convertir la fecha a ISO string (se usa para ambos sampleconfirm y streamstardate)
      const dateObj = new Date(date);
      const isoDate = dateObj.toISOString();

      await createMicroEvent({
        elementId: parseInt(selectedElementId),
        typeId: typeId,
        sampleconfirm: isoDate,
        streamstardate: isoDate,
        value: 0,
      } as any);

      showSuccess("Evento creado correctamente");
      onEventCreated?.();
      onOpenChange(false);
      
      // Resetear valores
      setSelectedElementId("");
      setDate("");
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      showError("Error al crear el evento", error);
    } finally {
      setSaving(false);
    }
  };

  // Obtener la fecha y hora actual en formato local para el input datetime-local
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">
            Crear Evento Manualmente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Elemento
            </label>
            <ElementsCombobox
              elements={elements}
              value={selectedElementId}
              onValueChange={setSelectedElementId}
              loading={loading}
              placeholder="Selecciona un elemento"
              disabled={!typeId}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Fecha (Confirmación y Stream Start)
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
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
              disabled={saving || loading || !selectedElementId || !date}
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

