"use client";

import { useState } from "react";
import type { MicroEvent } from "@/lib/types/micro-events";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventModal } from "./event-modal";
import { AnalysisModal } from "./analysis-modal";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, Eye, FlaskConical } from "lucide-react";
import { updateMicroEvent } from "@/lib/services/micro-events.service";
import { useToast } from "@/components/toast";

interface EventsTableProps {
  events: MicroEvent[];
  loading?: boolean;
  total?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  serverTime?: Date | null;
  view?: "operator" | "leader" | "audit";
  onEventUpdate?: (updatedEvent: MicroEvent) => void;
  eventTypeName?: string;
  eventTypeId?: string;
}

type EventStatus = "proximo" | "tomar-muestra" | "confirmado" | "expirado" | "pasado";

interface StatusInfo {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}

function getEventStatus(
  event: MicroEvent,
  serverTime: Date | null
): StatusInfo {
  if (!serverTime) {
    return {
      label: "Sin hora",
      variant: "outline",
      className: "",
    };
  }

  // Verificar si es un evento manual (sampleconfirm === streamstardate)
  const isManual = event.sampleconfirm && event.streamstardate && 
    event.sampleconfirm === event.streamstardate;
  
  if (isManual) {
    return {
      label: "Manual",
      variant: "outline",
      className: "bg-amber-700 text-white border-amber-800",
    };
  }

  const serverTimeMs = serverTime.getTime();
  const samplestartMs = new Date(event.samplestart).getTime();
  const sampleendMs = new Date(event.sampleend).getTime();
  const hasConfirm = event.sampleconfirm !== null && event.sampleconfirm !== "";

  // 1. server-time < samplestart => Proximo (azul)
  if (serverTimeMs < samplestartMs) {
    return {
      label: "Próximo",
      variant: "default",
      className: "bg-blue-500 text-white border-blue-600",
    };
  }

  // 2. samplestart < server-time < sampleend y sampleconfirm = null => Tomar muestra (amarillo)
  if (serverTimeMs >= samplestartMs && serverTimeMs < sampleendMs && !hasConfirm) {
    return {
      label: "Tomar muestra",
      variant: "outline",
      className: "bg-yellow-500 text-white border-yellow-600",
    };
  }

  // 3. samplestart < server-time < sampleend y sampleconfirm = (tiene un tiempo) => Confirmado (verde)
  if (serverTimeMs >= samplestartMs && serverTimeMs < sampleendMs && hasConfirm) {
    return {
      label: "Confirmado",
      variant: "default",
      className: "bg-green-500 text-white border-green-600",
    };
  }

  // 4. sampleend < server-time y sampleconfirm = null => Expirado (rojo)
  if (serverTimeMs >= sampleendMs && !hasConfirm) {
    return {
      label: "Expirado",
      variant: "destructive",
      className: "bg-red-500 text-white border-red-600",
    };
  }

  // 5. sampleend < server-time y sampleconfirm = (tiene un tiempo) => Pasado (naranja)
  if (serverTimeMs >= sampleendMs && hasConfirm) {
    return {
      label: "Pasado",
      variant: "outline",
      className: "bg-orange-500 text-white border-orange-600",
    };
  }

  // Fallback
  return {
    label: "Desconocido",
    variant: "outline",
    className: "",
  };
}

export function EventsTable({
  events,
  loading,
  total,
  page = 1,
  totalPages = 1,
  onPageChange,
  serverTime,
  view,
  onEventUpdate,
  eventTypeName,
  eventTypeId,
}: EventsTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<MicroEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnalysisEvent, setSelectedAnalysisEvent] = useState<MicroEvent | null>(null);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [updatingSelectors, setUpdatingSelectors] = useState<Set<number>>(new Set());
  const { showSuccess, showError } = useToast();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const columns: ColumnDef<MicroEvent>[] = [
    {
      accessorKey: "id",
      header: "id",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "code",
      header: "codigo",
      cell: ({ row }) => {
        return <div>{row.getValue("code") || "-"}</div>;
      },
    },
    {
      accessorKey: "element.name",
      header: "elemento",
      cell: ({ row }) => {
        const element = row.original.element;
        return <div>{element?.name || "-"}</div>;
      },
    },
    {
      accessorKey: "samplestart",
      header: "tomar",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("samplestart"))}</div>;
      },
    },
    {
      accessorKey: "sampleend",
      header: "hasta",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("sampleend"))}</div>;
      },
    },
    {
      accessorKey: "sampleconfirm",
      header: "confirmado",
      cell: ({ row }) => {
        const confirmDate = row.getValue("sampleconfirm") as string | null;
        if (confirmDate) {
          return (
            <div className="text-green-600 dark:text-green-400">
              {formatDate(confirmDate)}
            </div>
          );
        }
        return <div className="text-muted-foreground">-</div>;
      },
    },
    {
      id: "estado",
      header: "estado",
      cell: ({ row }) => {
        const status = getEventStatus(row.original, serverTime ?? null);
        return (
          <Badge variant={status.variant} className={status.className}>
            {status.label}
          </Badge>
        );
      },
    },
  ];

  // Agregar columna de acción para vista operator y leader
  if (view === "operator" || view === "leader") {
    columns.push({
      id: "acciones",
      header: "acciones",
      cell: ({ row }) => {
        const event = row.original;
        const status = getEventStatus(event, serverTime ?? null);
        const isProximo = status.label === "Próximo";
        
        // Verificar si es un evento manual (sampleconfirm === streamstardate) - solo para operator
        const isManual = Boolean(
          view === "operator" &&
          event.sampleconfirm && 
          event.streamstardate &&
          event.sampleconfirm === event.streamstardate
        );
        
        const isDisabled = Boolean(isProximo || isManual);
        const disabledTitle = isProximo 
          ? "No se puede abrir el modal para eventos próximos"
          : isManual
          ? "No se puede abrir el modal para eventos manuales"
          : "";
        
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedEvent(event);
              setModalOpen(true);
            }}
            disabled={!!isDisabled}
            title={disabledTitle}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    });
  }

  // Agregar columna de cantidad de análisis solo para vista leader
  if (view === "leader") {
    columns.push({
      id: "cantidad-analisis",
      header: "análisis",
      cell: ({ row }) => {
        const event = row.original;
        const count = event.analysisCount || 0;
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{count}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!eventTypeId) {
                  showError("Error", new Error("No se puede abrir el modal de análisis sin un tipo de evento seleccionado"));
                  return;
                }
                setSelectedAnalysisEvent(event);
                setAnalysisModalOpen(true);
              }}
              disabled={!eventTypeId}
              title={eventTypeId ? "Ver y gestionar análisis" : "Selecciona un tipo de evento primero"}
            >
              <FlaskConical className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    });
  }

  // Agregar columna de selector para vista audit
  if (view === "audit") {
    const handleSelectorChange = async (event: MicroEvent, newValue: boolean) => {
      setUpdatingSelectors((prev) => new Set(prev).add(event.id));
      
      try {
        await updateMicroEvent(event.id, { selector: newValue });
        
        // Actualizar el evento localmente
        const updatedEvent: MicroEvent = {
          ...event,
          selector: newValue,
        };
        
        onEventUpdate?.(updatedEvent);
        showSuccess("Selector actualizado correctamente");
      } catch (error) {
        console.error("Error al actualizar selector:", error);
        showError("Error al actualizar el selector", error);
      } finally {
        setUpdatingSelectors((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.id);
          return newSet;
        });
      }
    };

    columns.push({
      id: "selector",
      header: "selector",
      cell: ({ row }) => {
        const event = row.original;
        const isUpdating = updatingSelectors.has(event.id);
        
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={event.selector}
              onChange={(e) => handleSelectorChange(event, e.target.checked)}
              disabled={isUpdating}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        );
      },
    });
  }

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedEvent(null);
    }
  };

  const handleAnalysisModalClose = (open: boolean) => {
    setAnalysisModalOpen(open);
    if (!open) {
      setSelectedAnalysisEvent(null);
    }
  };

  return (
    <>
      <div className="w-full space-y-4">
        <DataTable columns={columns} data={events} loading={loading} />

        {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({total} resultados)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 text-sm rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      </div>

      {(view === "operator" || view === "leader") && (
        <EventModal
          event={selectedEvent}
          open={modalOpen}
          onOpenChange={handleModalClose}
          onUpdate={onEventUpdate}
          eventTypeName={eventTypeName}
          serverTime={serverTime}
          view={view}
        />
      )}

      {view === "leader" && eventTypeId && (
        <AnalysisModal
          event={selectedAnalysisEvent ? {
            ...selectedAnalysisEvent,
            typeId: selectedAnalysisEvent.typeId || eventTypeId,
          } : null}
          open={analysisModalOpen}
          onOpenChange={handleAnalysisModalClose}
          onAnalysisCreated={() => {
            // Opcional: recargar datos si es necesario
          }}
        />
      )}
    </>
  );
}

