"use client";

import { useState, useEffect } from "react";
import type { MicroEvent } from "@/lib/types/micro-events";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PeopleCombobox } from "./people-combobox";
import { Button } from "@/components/ui/button";
import { getPeople } from "@/lib/services/people.service";
import { updateMicroEvent } from "@/lib/services/micro-events.service";
import type { Person } from "@/lib/types/people";
import { useToast } from "@/components/toast";
import { Loader2 } from "lucide-react";

interface EventModalProps {
  event: MicroEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updatedEvent: MicroEvent) => void;
  eventTypeName?: string;
  serverTime?: Date | null;
  view?: "operator" | "leader" | "audit";
}

export function EventModal({
  event,
  open,
  onOpenChange,
  onUpdate,
  eventTypeName,
  serverTime,
  view = "operator",
}: EventModalProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [selectedAnalysisPersonId, setSelectedAnalysisPersonId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [characterization, setCharacterization] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  // Función helper para obtener el ID del sampleresponsable (puede ser string o objeto)
  const getSampleresponsableId = (sampleresponsable: string | null | any): string => {
    if (!sampleresponsable) return "";
    if (typeof sampleresponsable === "string") return sampleresponsable;
    if (typeof sampleresponsable === "object" && sampleresponsable.id) return sampleresponsable.id;
    return "";
  };

  // Función helper para obtener el ID del analysisresponsable (puede ser string o objeto)
  const getAnalysisresponsableId = (analysisresponsable: string | null | any): string => {
    if (!analysisresponsable) return "";
    if (typeof analysisresponsable === "string") return analysisresponsable;
    if (typeof analysisresponsable === "object" && analysisresponsable.id) return analysisresponsable.id;
    return "";
  };

  useEffect(() => {
    if (open && event) {
      // Cargar personas siempre para poder mostrar la información si hay responsable asignado
      loadPeople();
      const responsableId = getSampleresponsableId(event.sampleresponsable);
      setSelectedPersonId(responsableId);
      
      // Para leader, cargar también analysisresponsable y campos de texto
      if (view === "leader") {
        const analysisId = getAnalysisresponsableId(event.analysisresponsable);
        setSelectedAnalysisPersonId(analysisId);
        setDescription(event.description || "");
        setCharacterization(event.charecterization || "");
      }
    }
  }, [open, event, view]);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const data = await getPeople();
      setPeople(data);
    } catch (error) {
      showError("Error al cargar personas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!event) return;
    
    // Para operator, validar que haya seleccionado un responsable
    if (view === "operator" && (!selectedPersonId || selectedPersonId.trim() === "")) {
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {};

      // Para operator, actualizar sampleresponsable
      if (view === "operator") {
        updateData.sampleresponsableId = selectedPersonId || null;
        // Actualizar sampleconfirm con la fecha del servidor cuando se asigna un responsable
        if (serverTime) {
          updateData.sampleconfirm = serverTime.toISOString();
        }
      }

      // Para leader, actualizar analysisresponsable, description y characterization
      if (view === "leader") {
        if (selectedAnalysisPersonId) {
          updateData.analysisresponsableId = selectedAnalysisPersonId;
        }
        updateData.description = description || null;
        updateData.charecterization = characterization || null;
      }

      const updatedEvent = await updateMicroEvent(event.id, updateData);
      showSuccess("Evento actualizado correctamente");
      
      // Crear el evento actualizado con los nuevos valores
      const eventWithUpdates: MicroEvent = {
        ...event,
        ...(view === "operator" && {
          sampleresponsable: selectedPersonId,
          sampleconfirm: serverTime ? serverTime.toISOString() : event.sampleconfirm,
        }),
        ...(view === "leader" && {
          analysisresponsable: selectedAnalysisPersonId || null,
          description: description || null,
          charecterization: characterization || null,
        }),
      };
      
      onUpdate?.(eventWithUpdates);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      showError("Error al actualizar el evento", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
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

  if (!event) return null;

  const isLeader = view === "leader";
  const modalWidth = isLeader ? "sm:max-w-7xl w-[95vw]" : "sm:max-w-2xl";
  const gridCols = isLeader ? "grid-cols-4" : "grid-cols-2";

  // Construir el título: "nombre del tipo de evento" - "codigo" - "elemento"
  const modalTitle = event 
    ? `${eventTypeName || "Evento"} - ${event.code || "-"} - ${event.element?.name || "-"}`
    : "Detalles del Evento";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${modalWidth} max-h-[85vh] overflow-y-auto`}>
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">{modalTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className={`grid ${gridCols} gap-4 text-sm`}>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                ID
              </label>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{event.id}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Código
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{event.code || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Equipo
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{event.element?.name || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Generado
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(event.streamstardate)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                A partir
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(event.samplestart)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Hasta
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(event.sampleend)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1 block">
                Confirmado
              </label>
              <p className={`text-sm ${event.sampleconfirm ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-900 dark:text-gray-100"}`}>
                {formatDate(event.sampleconfirm)}
              </p>
            </div>
          </div>

          {/* Descripción y Caracterización - Solo para leader */}
          {isLeader && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese la descripción del evento..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                  Caracterización
                </label>
                <textarea
                  value={characterization}
                  onChange={(e) => setCharacterization(e.target.value)}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingrese la caracterización del evento..."
                />
              </div>
            </div>
          )}

          {/* Sample Responsable - Para operator (editable) y leader (solo lectura) */}
          {(view === "operator" || view === "leader") && (
            <div className="pt-4 border-t">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                Sample Responsable
              </label>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                {(() => {
                  const responsableId = getSampleresponsableId(event.sampleresponsable);
                  
                  if (responsableId) {
                    // Si ya tiene un responsable asignado, mostrar solo la información
                    const assignedPerson = people.find((p) => p.id === responsableId);
                    if (assignedPerson) {
                      return (
                        <div className="text-sm">
                          <div>{assignedPerson.name} {assignedPerson.lastname}</div>
                          {assignedPerson.shardid && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              ID: {assignedPerson.shardid}
                            </div>
                          )}
                        </div>
                      );
                    }
                    // Si no se encuentra la persona en la lista cargada, mostrar el ID
                    return (
                      <div className="text-sm text-muted-foreground">
                        ID: {responsableId}
                      </div>
                    );
                  }
                  
                  // Solo mostrar combobox para operator, en leader mostrar "-" si no hay responsable
                  if (view === "leader") {
                    return (
                      <div className="text-sm text-muted-foreground">-</div>
                    );
                  }
                  
                  // Si no tiene responsable, mostrar el combobox para seleccionar (solo operator)
                  if (loading) {
                    return (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Cargando personas...
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <PeopleCombobox
                      people={people}
                      value={selectedPersonId}
                      onValueChange={setSelectedPersonId}
                      loading={loading}
                      placeholder="Selecciona una persona"
                    />
                  );
                })()}
              </div>
            </div>
          )}

          {/* Analysis Responsable - Solo para leader */}
          {isLeader && (
            <div className="pt-4 border-t">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
                Analysis Responsable
              </label>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                {(() => {
                  const analysisId = getAnalysisresponsableId(event.analysisresponsable);
                  
                  if (analysisId) {
                    // Si ya tiene un responsable asignado, mostrar solo la información
                    const assignedPerson = people.find((p) => p.id === analysisId);
                    if (assignedPerson) {
                      return (
                        <div className="text-sm">
                          <div>{assignedPerson.name} {assignedPerson.lastname}</div>
                          {assignedPerson.shardid && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              ID: {assignedPerson.shardid}
                            </div>
                          )}
                        </div>
                      );
                    }
                    // Si no se encuentra la persona en la lista cargada, mostrar el ID
                    return (
                      <div className="text-sm text-muted-foreground">
                        ID: {analysisId}
                      </div>
                    );
                  }
                  
                  // Si no tiene responsable, mostrar el combobox para seleccionar
                  if (loading) {
                    return (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Cargando personas...
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <PeopleCombobox
                      people={people}
                      value={selectedAnalysisPersonId}
                      onValueChange={setSelectedAnalysisPersonId}
                      loading={loading}
                      placeholder="Selecciona una persona"
                    />
                  );
                })()}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              size="sm"
            >
              Cerrar
            </Button>
            {view === "operator" && !getSampleresponsableId(event.sampleresponsable) && (
              <Button onClick={handleSave} disabled={saving || loading || !selectedPersonId} size="sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            )}
            {isLeader && (
              <Button onClick={handleSave} disabled={saving || loading} size="sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

