"use client";

import type { MicroSchedule } from "@/lib/types/micro-schedules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ViewScheduleModalProps {
  schedule: MicroSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewScheduleModal({
  schedule,
  open,
  onOpenChange,
}: ViewScheduleModalProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "-";
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">
            Detalles del Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                ID
              </label>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {schedule.id}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Nombre
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {schedule.name}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Tipo de Evento
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {schedule.eventType?.name || "-"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Estado
              </label>
              <Badge
                variant={schedule.isActive ? "default" : "secondary"}
                className={schedule.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
              >
                {schedule.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Frecuencia
              </label>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {schedule.frequency}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Zona Horaria
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {schedule.timezone}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Ejecuciones
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {schedule.runCount}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Última Ejecución
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {formatDate(schedule.lastRun)}
              </p>
            </div>
          </div>

          {schedule.description && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Descripción
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {schedule.description}
              </p>
            </div>
          )}

          {schedule.elements && schedule.elements.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                Elementos Asociados
              </label>
              <div className="flex flex-wrap gap-2">
                {schedule.elements.map((element) => (
                  <Badge key={element.id} variant="outline">
                    {element.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Creado
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {formatDate(schedule.createdAt)}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Actualizado
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {formatDate(schedule.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

