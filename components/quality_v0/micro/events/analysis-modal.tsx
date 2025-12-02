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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { MicroEvent } from "@/lib/types/micro-events";
import type { AnalysisType, MicroAnalysis } from "@/lib/types/micro-analysis";
import type { MicroType } from "@/lib/types/micro-types";
import { getMicroTypeById } from "@/lib/services/micro-types.service";
import {
  createMicroAnalysis,
  getMicroAnalysisByEventId,
} from "@/lib/services/micro-analysis.service";
import { useToast } from "@/components/toast";

interface AnalysisModalProps {
  event: MicroEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalysisCreated?: () => void;
}

interface AnalysisFormData {
  typeId: string;
  options: "dual" | "boolean" | "otro" | "numeric" | "string";
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=";
  value?: string;
  mode?: "MNPC" | "numeric"; // Para dual
  result?: "POSITIVO" | "NEGATIVO"; // Para boolean
}

export function AnalysisModal({
  event,
  open,
  onOpenChange,
  onAnalysisCreated,
}: AnalysisModalProps) {
  const [microType, setMicroType] = useState<MicroType | null>(null);
  const [existingAnalyses, setExistingAnalyses] = useState<MicroAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, AnalysisFormData>>({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (open && event) {
      loadData();
    } else {
      // Resetear cuando se cierra el modal
      setMicroType(null);
      setExistingAnalyses([]);
      setFormData({});
    }
  }, [open, event]);

  const loadData = async () => {
    if (!event) return;

    // Necesitamos el typeId del evento, pero si no está disponible, no podemos cargar los análisis
    // El typeId debería estar disponible desde el filtro seleccionado
    // Por ahora, intentamos obtenerlo del evento o necesitamos pasarlo como prop
    const eventTypeId = event.typeId;
    
    if (!eventTypeId) {
      showError("Error", new Error("No se puede determinar el tipo de evento"));
      return;
    }

    try {
      setLoading(true);
      
      // Obtener el tipo de evento completo con sus análisis
      const type = await getMicroTypeById(eventTypeId);
      setMicroType(type);

      // Obtener los análisis existentes del evento
      const analyses = await getMicroAnalysisByEventId(event.id);
      console.log("📋 Análisis existentes cargados:", analyses.map(a => ({ 
        id: a.id, 
        type_id: a.type_id, 
        name: a.name 
      })));
      setExistingAnalyses(analyses);
    } catch (error) {
      console.error("Error loading analysis data:", error);
      showError("Error al cargar los datos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (analysisType: AnalysisType) => {
    if (!event) return;

    const form = formData[analysisType.id];
    if (!form) {
      showError("Error", new Error("Debe completar el formulario"));
      return;
    }

    // Usar el condition del analysisType, no del form
    const condition = analysisType.condition || "=";

    try {
      setSaving((prev) => new Set(prev).add(analysisType.id));

      let value: string | undefined;

      if (form.options === "dual") {
        if (form.mode === "MNPC") {
          value = "MNPC";
        } else if (form.mode === "numeric" && form.value) {
          value = form.value;
        } else {
          showError("Error", new Error("Debe ingresar un valor numérico"));
          setSaving((prev) => {
            const newSet = new Set(prev);
            newSet.delete(analysisType.id);
            return newSet;
          });
          return;
        }
      } else if (form.options === "boolean") {
        value = form.result || "";
      } else if (form.options === "otro" || form.options === "numeric" || form.options === "string") {
        if (!form.value) {
          showError("Error", new Error("Debe ingresar un valor"));
          setSaving((prev) => {
            const newSet = new Set(prev);
            newSet.delete(analysisType.id);
            return newSet;
          });
          return;
        }
        value = form.value;
      }

      const payload = {
        eventId: event.id,
        typeId: analysisType.id,
        options: form.options,
        condition: condition as "=" | ">" | ">=" | "<" | "<=" | "!=",
        value: value || "",
        name: analysisType.name,
        code: analysisType.code,
        threshold: analysisType.threshold || null,
      };

      console.log("Creating analysis with payload:", payload);
      
      await createMicroAnalysis(payload);

      showSuccess("Análisis creado correctamente");
      
      // Recargar los análisis para actualizar la lista
      const analyses = await getMicroAnalysisByEventId(event.id);
      console.log("Análisis recargados después de guardar:", analyses);
      console.log("TypeId del análisis guardado:", analysisType.id);
      setExistingAnalyses(analyses);
      
      // Limpiar el formulario de este análisis
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData[analysisType.id];
        return newData;
      });

      onAnalysisCreated?.();
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      showError("Error al crear el análisis", error);
    } finally {
      setSaving((prev) => {
        const newSet = new Set(prev);
        newSet.delete(analysisType.id);
        return newSet;
      });
    }
  };

  const isAnalysisDone = (typeId: string): boolean => {
    if (!typeId || !existingAnalyses || existingAnalyses.length === 0) {
      return false;
    }
    
    // Verificar si ya existe un análisis con este typeId
    // Comparación estricta convirtiendo ambos a string
    const found = existingAnalyses.some((a) => {
      if (!a.type_id) return false;
      const match = String(a.type_id).trim() === String(typeId).trim();
      if (match) {
        console.log("✅ Análisis encontrado como completado:", {
          buscando: typeId,
          encontrado: a.type_id,
          nombre: a.name
        });
      }
      return match;
    });
    
    if (!found) {
      console.log("❌ Análisis NO encontrado:", {
        buscando: typeId,
        existentes: existingAnalyses.map(a => ({ type_id: a.type_id, name: a.name }))
      });
    }
    
    return found;
  };

  const updateFormData = (typeId: string, updates: Partial<AnalysisFormData>) => {
    setFormData((prev) => {
      const current = prev[typeId] || {
        typeId,
        options: microType?.analysisTypes?.find((at) => at.id === typeId)?.options || "otro",
        condition: microType?.analysisTypes?.find((at) => at.id === typeId)?.condition || "=",
      };
      return {
        ...prev,
        [typeId]: { ...current, ...updates },
      };
    });
  };

  // Función para evaluar si el valor cumple la condición con el threshold
  const evaluateCondition = (analysis: MicroAnalysis): "pass" | "fail" | "no-threshold" => {
    // Si no hay threshold, fondo transparente
    if (!analysis.threshold || analysis.threshold.trim() === "") {
      console.log("No threshold:", analysis);
      return "no-threshold";
    }

    // Si no hay valor, no se puede evaluar
    if (!analysis.value || analysis.value.trim() === "") {
      console.log("No value:", analysis);
      return "no-threshold";
    }

    // Ambos son strings, comparar como strings
    const valueStr = analysis.value.trim();
    const thresholdStr = analysis.threshold.trim();

    // Intentar convertir a números si es posible (para comparaciones numéricas)
    const valueNum = parseFloat(valueStr);
    const thresholdNum = parseFloat(thresholdStr);
    const areNumbers = !isNaN(valueNum) && !isNaN(thresholdNum) && isFinite(valueNum) && isFinite(thresholdNum);

    // Evaluar la condición comparando strings o números según corresponda
    let passes = false;
    switch (analysis.condition) {
      case "=":
        passes = valueStr === thresholdStr;
        break;
      case ">":
        // Si ambos son números, comparar numéricamente; si no, comparar como strings
        passes = areNumbers ? valueNum > thresholdNum : valueStr > thresholdStr;
        break;
      case ">=":
        passes = areNumbers ? valueNum >= thresholdNum : valueStr >= thresholdStr;
        break;
      case "<":
        passes = areNumbers ? valueNum < thresholdNum : valueStr < thresholdStr;
        break;
      case "<=":
        passes = areNumbers ? valueNum <= thresholdNum : valueStr <= thresholdStr;
        break;
      case "!=":
        passes = valueStr !== thresholdStr;
        break;
      default:
        return "no-threshold";
    }

    console.log("Evaluación de condición:", {
      name: analysis.name,
      value: valueStr,
      threshold: thresholdStr,
      condition: analysis.condition,
      areNumbers,
      passes,
      result: passes ? "pass" : "fail"
    });

    return passes ? "pass" : "fail";
  };

  if (!event || !microType) {
    return null;
  }

  const analysisTypes = microType.analysisTypes || [];
  const modalWidth = "sm:max-w-7xl w-[95vw]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${modalWidth} max-h-[85vh] overflow-y-auto`}>
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold text-gray-800">
            Análisis - {event.code} - {event.element?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Análisis ya realizados */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Análisis Realizados
              </h3>
              <div className="space-y-2">
                {existingAnalyses.length > 0 ? (
                  existingAnalyses.map((analysis) => {
                    // Usar name y code directamente de la respuesta
                    const typeName = analysis.name || "Desconocido";
                    const typeCode = analysis.code || "";
                    
                    // Obtener el threshold del analysisType si no viene en el analysis
                    const analysisType = analysisTypes.find((at) => at.id === analysis.type_id);
                    const threshold = analysis.threshold || analysisType?.threshold || null;
                    
                    // Crear un objeto con threshold para la evaluación
                    const analysisWithThreshold = {
                      ...analysis,
                      threshold: threshold,
                    };
                    
                    // Evaluar la condición para determinar el color de fondo
                    const conditionResult = evaluateCondition(analysisWithThreshold);
                    
                    console.log("Aplicando color para:", analysis.name, {
                      value: analysis.value,
                      threshold: threshold,
                      condition: analysis.condition,
                      result: conditionResult
                    });
                    
                    // Determinar estilos según el resultado
                    let bgStyle: React.CSSProperties = {};
                    let borderStyle: React.CSSProperties = {};
                    
                    if (conditionResult === "pass") {
                      bgStyle = { backgroundColor: "#dcfce7" };
                      borderStyle = { borderColor: "#86efac" };
                    } else if (conditionResult === "fail") {
                      bgStyle = { backgroundColor: "#fee2e2" };
                      borderStyle = { borderColor: "#fca5a5" };
                    } else {
                      // no-threshold: fondo transparente (mantener el original)
                      bgStyle = {};
                      borderStyle = {};
                    }
                    
                    // Formatear la fecha de creación
                    const formatDate = (dateString?: string) => {
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

                    return (
                      <div
                        key={analysis.id}
                        className={`p-3 rounded-lg border ${
                          conditionResult === "pass" 
                            ? "!bg-green-100 dark:!bg-green-900 !border-green-300 dark:!border-green-700" 
                            : conditionResult === "fail" 
                            ? "!bg-red-100 dark:!bg-red-900 !border-red-300 dark:!border-red-700" 
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        }`}
                        style={{ ...bgStyle, ...borderStyle }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{typeName}</div>
                            {typeCode && (
                              <div className="text-xs text-muted-foreground">
                                Código: {typeCode}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              {analysis.value || "-"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Creado: {formatDate(analysis.created)}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                            Completado
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground py-4">
                    No hay análisis realizados
                  </div>
                )}
              </div>
            </div>

            {/* Análisis pendientes */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Análisis Pendientes
              </h3>
              <div className="space-y-4">
                {analysisTypes.map((analysisType) => {
                  const isDone = isAnalysisDone(analysisType.id);
                  const form = formData[analysisType.id];
                  
                  console.log(`🔎 Verificando análisis pendiente: ${analysisType.name} (${analysisType.id}) - isDone: ${isDone}`);

                  if (isDone) {
                    console.log(`⏭️ Saltando ${analysisType.name} porque ya está completado`);
                    return null; // No mostrar si ya está hecho
                  }

                  return (
                    <div
                      key={analysisType.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="mb-3">
                        <div className="font-medium">{analysisType.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Código: {analysisType.code}
                        </div>
                      </div>

                      {/* Dual: MNPC o numérico */}
                      {analysisType.options === "dual" && (
                        <div className="space-y-3">
                          <Select
                            value={form?.mode || ""}
                            onValueChange={(value) =>
                              updateFormData(analysisType.id, {
                                mode: value as "MNPC" | "numeric",
                                options: "dual",
                                condition: analysisType.condition || "=",
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona el modo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MNPC">MNPC</SelectItem>
                              <SelectItem value="numeric">Numérico</SelectItem>
                            </SelectContent>
                          </Select>
                          {form?.mode === "numeric" && (
                            <Input
                              type="number"
                              placeholder="Ingrese el valor numérico"
                              value={form?.value || ""}
                              onChange={(e) =>
                                updateFormData(analysisType.id, {
                                  value: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      )}

                      {/* Boolean: POSITIVO o NEGATIVO */}
                      {analysisType.options === "boolean" && (
                        <Select
                          value={form?.result || ""}
                          onValueChange={(value) =>
                            updateFormData(analysisType.id, {
                              result: value as "POSITIVO" | "NEGATIVO",
                              options: "boolean",
                              condition: analysisType.condition || "=",
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona el resultado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POSITIVO">POSITIVO</SelectItem>
                            <SelectItem value="NEGATIVO">NEGATIVO</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {/* Otro: input de texto */}
                      {analysisType.options === "otro" && (
                        <Input
                          type="text"
                          placeholder="Ingrese el valor"
                          value={form?.value || ""}
                          onChange={(e) =>
                            updateFormData(analysisType.id, {
                              value: e.target.value,
                              options: "otro",
                              condition: analysisType.condition || "=",
                            })
                          }
                        />
                      )}

                      {/* Numeric: input numérico */}
                      {analysisType.options === "numeric" && (
                        <Input
                          type="number"
                          placeholder="Ingrese el valor numérico"
                          value={form?.value || ""}
                          onChange={(e) =>
                            updateFormData(analysisType.id, {
                              value: e.target.value,
                              options: "numeric",
                              condition: analysisType.condition || "=",
                            })
                          }
                        />
                      )}

                      {/* String: input de texto */}
                      {analysisType.options === "string" && (
                        <Input
                          type="text"
                          placeholder="Ingrese el valor"
                          value={form?.value || ""}
                          onChange={(e) =>
                            updateFormData(analysisType.id, {
                              value: e.target.value,
                              options: "string",
                              condition: analysisType.condition || "=",
                            })
                          }
                        />
                      )}

                      <div className="mt-3">
                        <Button
                          onClick={() => handleSave(analysisType)}
                          disabled={
                            saving.has(analysisType.id) ||
                            !form ||
                            (analysisType.options === "dual" &&
                              (!form.mode ||
                                (form.mode === "numeric" && !form.value))) ||
                            (analysisType.options === "boolean" && !form.result) ||
                            ((analysisType.options === "otro" ||
                              analysisType.options === "numeric" ||
                              analysisType.options === "string") &&
                              !form.value)
                          }
                          size="sm"
                        >
                          {saving.has(analysisType.id) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

