"use client";

import { useState } from "react";
import type { MicroSchedule } from "@/lib/types/micro-schedules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteMicroSchedule } from "@/lib/services/micro-schedules.service";
import { useToast } from "@/components/toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteScheduleModalProps {
  schedule: MicroSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleDeleted?: () => void;
}

export function DeleteScheduleModal({
  schedule,
  open,
  onOpenChange,
  onScheduleDeleted,
}: DeleteScheduleModalProps) {
  const [deleting, setDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleDelete = async () => {
    if (!schedule) return;

    try {
      setDeleting(true);
      await deleteMicroSchedule(schedule.id);
      showSuccess("Schedule eliminado correctamente");
      onScheduleDeleted?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      showError("Error al eliminar el schedule", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Schedule
          </DialogTitle>
          <DialogDescription className="pt-2">
            ¿Estás seguro de que deseas eliminar este schedule? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Nombre:
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {schedule.name}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Tipo de Evento:
                </span>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {schedule.eventType?.name || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Frecuencia:
                </span>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {schedule.frequency}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              size="sm"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

