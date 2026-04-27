"use client";

import { useEffect, useState, ReactNode } from "react";
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
  condition: "=" | ">" | ">=" | "<" | "<=" | "!=" | "between";
  value?: string;
  mode?: "MNPC" | "numeric";
  result?: "POSITIVO" | "NEGATIVO";
  date?: string;
}

type FieldErrorKey = "value" | "date";

interface FieldErrorMessages {
  value?: string;
  date?: string;
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
      {label}
    </span>
    {children}
    {error && <p className="text-[11px] text-rose-600">{error}</p>}
  </div>
);

interface AnalysisValueStatus {
  value?: string;
  missing: boolean;
  error?: string;
}

const resolveAnalysisValueStatus = (
  analysisType: AnalysisType,
  form?: AnalysisFormData
): AnalysisValueStatus => {
  if (!form) {
    return { missing: true, error: "Completa los campos del anÃ¡lisis" };
  }

  const trimmedValue = (form.value ?? "").trim();

  switch (analysisType.options) {
    case "dual":
      if (!form.mode) {
        return { missing: true, error: "Selecciona el modo" };
      }
      if (form.mode === "MNPC") {
        return { missing: false, value: "MNPC" };
      }
      if (form.mode === "numeric") {
        if (!trimmedValue) {
          return { missing: true, error: "Ingresa el valor numÃ©rico" };
        }
        return { missing: false, value: trimmedValue };
      }
      return { missing: true, error: "Selecciona el modo" };
    case "boolean":
      if (!form.result) {
        return { missing: true, error: "Selecciona el resultado" };
      }
      return { missing: false, value: form.result };
    case "numeric":
      if (!trimmedValue) {
        return { missing: true, error: "Ingresa el valor numÃ©rico" };
      }
      return { missing: false, value: trimmedValue };
    case "otro":
    case "string":
      if (!trimmedValue) {
        return { missing: true, error: "Ingresa el valor" };
      }
      return { missing: false, value: trimmedValue };
    default:
      return { missing: true, error: "Tipo de anÃ¡lisis no soportado" };
  }
};

const formatAnalysisDate = (dateString?: string) => {
  if (!dateString) {
    return "-";
  }
  try {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 5);
    return date.toLocaleString("es-ES", {
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

const statusToneMap: Record<"pass" | "fail" | "no-threshold", string> = {
  pass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-600",
  fail: "bg-rose-50 border-rose-200 dark:bg-rose-900/50 dark:border-rose-500",
  "no-threshold":
    "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800",
};

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldErrorMessages>>({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (open && event) {
      loadData();
    } else {
      setMicroType(null);
      setExistingAnalyses([]);
      setFormData({});
      setFieldErrors({});
    }
  }, [open, event]);

  const loadData = async () => {
    if (!event) return;

    const eventTypeId = event.typeId;

    if (!eventTypeId) {
      showError("Error", new Error("No se puede determinar el tipo de evento"));
      return;
    }

    try {
      setLoading(true);
      const type = await getMicroTypeById(eventTypeId);
      setMicroType(type);
      const analyses = await getMicroAnalysisByEventId(event.id);
      setExistingAnalyses(analyses);
    } catch (error) {
      console.error("Error loading analysis data:", error);
      showError("Error al cargar los datos", error as Error);
    } finally {
      setLoading(false);
    }
  };

  const setFieldErrorMessage = (
    typeId: string,
    field: FieldErrorKey,
    message?: string
  ) => {
    setFieldErrors((prev) => {
      const existing = prev[typeId] || {};
      if (!message && !existing[field]) {
        return prev;
      }
      if (message && existing[field] === message) {
        return prev;
      }
      const updated = { ...existing };
      if (message) {
        updated[field] = message;
      } else {
        delete updated[field];
      }
      const next = { ...prev, [typeId]: updated };
      if (Object.keys(updated).length === 0) {
        delete next[typeId];
      }
      return next;
    });
  };

  const handleSave = async (analysisType: AnalysisType) => {
    if (!event) return;

    const form = formData[analysisType.id];
    if (!form) {
      const message = "Completa los campos del anÃ¡lisis";
      setFieldErrorMessage(analysisType.id, "value", message);
      showError("Error", new Error(message));
      return;
    }

    const valueStatus = resolveAnalysisValueStatus(analysisType, form);
    if (valueStatus.missing) {
      setFieldErrorMessage(analysisType.id, "value", valueStatus.error);
      showError(
        "Error",
        new Error(valueStatus.error || "Debe completar el resultado")
      );
      return;
    }

    if (!form.date) {
      const dateMessage = "Selecciona la fecha del anÃ¡lisis";
      setFieldErrorMessage(analysisType.id, "date", dateMessage);
      showError("Error", new Error(dateMessage));
      return;
    }

    try {
      setSaving((prev) => new Set(prev).add(analysisType.id));

      const payload = {
        eventId: event.id,
        typeId: analysisType.id,
        options: form.options,
        condition: analysisType.condition || "=",
        value: valueStatus.value || "",
        name: analysisType.name,
        code: analysisType.code,
        threshold: analysisType.threshold || null,
        date: `${form.date}T12:00:00.000Z`,
      };

      await createMicroAnalysis(payload);

      showSuccess("AnÃ¡lisis creado correctamente");

      const analyses = await getMicroAnalysisByEventId(event.id);
      setExistingAnalyses(analyses);

      setFormData((prev) => {
        const next = { ...prev };
        delete next[analysisType.id];
        return next;
      });

      setFieldErrorMessage(analysisType.id, "value");
      setFieldErrorMessage(analysisType.id, "date");

      onAnalysisCreated?.();
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Response data:", error?.response?.data);
      showError("Error al crear el anÃ¡lisis", error);
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(analysisType.id);
        return next;
      });
    }
  };

  const updateFormData = (typeId: string, updates: Partial<AnalysisFormData>) => {
    setFormData((prev) => {
      const current = prev[typeId] || {
        typeId,
        options:
          microType?.analysisTypes?.find((at) => at.id === typeId)?.options ||
          "otro",
        condition:
          microType?.analysisTypes?.find((at) => at.id === typeId)?.condition ||
          "=",
      };
      return {
        ...prev,
        [typeId]: { ...current, ...updates },
      };
    });
  };

  const evaluationWithThreshold = (analysis: MicroAnalysis) => {
    if (!analysis.threshold || !analysis.value) {
      return "no-threshold" as const;
    }

    const valueStr = analysis.value.trim();
    const thresholdStr = analysis.threshold.trim();
    const valueNum = parseFloat(valueStr);
    const thresholdNum = parseFloat(thresholdStr);
    const areNumbers =
      !Number.isNaN(valueNum) &&
      !Number.isNaN(thresholdNum) &&
      Number.isFinite(valueNum) &&
      Number.isFinite(thresholdNum);

    let passes = false;
    switch (analysis.condition) {
      case "=":
        passes = valueStr === thresholdStr;
        break;
      case ">":
        passes = areNumbers ? valueNum > thresholdNum : valueStr > thresholdStr;
        break;
      case ">=":
        passes = areNumbers
          ? valueNum >= thresholdNum
          : valueStr >= thresholdStr;
        break;
      case "<":
        passes = areNumbers ? valueNum < thresholdNum : valueStr < thresholdStr;
        break;
      case "<=":
        passes = areNumbers
          ? valueNum <= thresholdNum
          : valueStr <= thresholdStr;
        break;
      case "!=":
        passes = valueStr !== thresholdStr;
        break;
      case "between":
        if (areNumbers) {
          const rangeParts = thresholdStr.split("-");
          if (rangeParts.length === 2) {
            const min = parseFloat(rangeParts[0].trim());
            const max = parseFloat(rangeParts[1].trim());
            if (
              !Number.isNaN(min) &&
              !Number.isNaN(max) &&
              Number.isFinite(min) &&
              Number.isFinite(max)
            ) {
              passes = valueNum >= min && valueNum <= max;
            }
          }
        } else {
          const rangeParts = thresholdStr.split("-");
          if (rangeParts.length === 2) {
            const min = rangeParts[0].trim();
            const max = rangeParts[1].trim();
            passes = valueStr >= min && valueStr <= max;
          }
        }
        break;
      default:
        return "no-threshold" as const;
    }

    return passes ? ("pass" as const) : ("fail" as const);
  };

  if (!event || !microType) {
    return null;
  }

  const analysisTypes = microType.analysisTypes || [];
  const pendingAnalysisTypes = analysisTypes.filter(
    (analysisType) => !existingAnalyses.some((analysis) =>
      String(analysis.type_id).trim() === String(analysisType.id).trim()
    )
  );
  const combinedAnalyses = [
    ...existingAnalyses.map((analysis) => ({
      kind: "completed" as const,
      analysis,
      key: `completed-${analysis.id}`,
    })),
    ...pendingAnalysisTypes.map((analysisType) => ({
      kind: "pending" as const,
      analysisType,
      key: `pending-${analysisType.id}`,
    })),
  ];
  const modalWidth = "sm:max-w-6xl w-[95vw]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${modalWidth} max-h-[90vh] p-0`}>
        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <DialogHeader className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-white">
                AnÃ¡lisis Â· {event.code} Â· {event.element?.name}
              </DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                RegistrÃ¡ los anÃ¡lisis segÃºn el tipo de evento y su respuesta dinÃ¡mica.
              </p>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 overflow-y-auto">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {existingAnalyses.length === 0 && pendingAnalysisTypes.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60">
                    No hay análisis disponibles.
                  </div>
                )}
                {existingAnalyses.map((analysis) => {
                  const typeName = analysis.name || "Desconocido";
                  const typeCode = analysis.code || "";
                  const analysisType = analysisTypes.find((at) => at.id === analysis.type_id);
                  const threshold = analysis.threshold || analysisType?.threshold || null;
                  const enrichedAnalysis = {
                    ...analysis,
                    threshold,
                  };
                  const conditionResult = evaluationWithThreshold(enrichedAnalysis);
                  const toneClasses = statusToneMap[conditionResult];
                  console.log("Aplicando color para:", analysis.name, {
                    value: analysis.value,
                    threshold,
                    condition: analysis.condition,
                    result: conditionResult,
                  });
                  const formatDate = (dateString?: string) => {
                    if (!dateString) return "-";
                    try {
                      const date = new Date(dateString);
                      date.setHours(date.getHours() + 5);
                      return date.toLocaleString("es-ES", {
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
                      className={`rounded-2xl border p-4 shadow-sm transition ${toneClasses}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {typeName}
                          </p>
                          {typeCode && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Código: {typeCode}
                            </p>
                          )}
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                            {analysis.value || "-"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Registrado: {formatAnalysisDate(analysis.created)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Completado
                        </Badge>
                      </div>
                    </div>
                  );
                })}

                {pendingAnalysisTypes.map((analysisType) => {
                  const form = formData[analysisType.id];
                  const valueError = fieldErrors[analysisType.id]?.value;
                  const dateError = fieldErrors[analysisType.id]?.date;
                  const cardHasError = Boolean(valueError || dateError);
                  const cardBorderClasses = cardHasError
                    ? "border-rose-200 bg-rose-50/30 dark:border-rose-500/70 dark:bg-rose-900/30"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950";

                  const valueStatus = resolveAnalysisValueStatus(analysisType, form);
                  const showModeError =
                    analysisType.options === "dual" && Boolean(valueError && !form?.mode);
                  const showValueInputError =
                    analysisType.options === "dual"
                      ? Boolean(valueError && form?.mode === "numeric")
                      : Boolean(valueError);
                  const isSaveDisabled =
                    saving.has(analysisType.id) || valueStatus.missing || !form?.date;

                  return (
                    <div
                      key={analysisType.id}
                      className={`rounded-2xl border p-4 shadow-sm transition flex flex-col gap-4 ${cardBorderClasses}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {analysisType.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Código: {analysisType.code}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[11px] uppercase tracking-[0.3em]">
                          Pendiente
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {analysisType.options === "dual" && (
                          <>
                            <FormField
                              label="Modo"
                              error={showModeError ? valueError : undefined}
                            >
                              <Select
                                value={form?.mode || ""}
                                onValueChange={(value) =>
                                  updateFormData(analysisType.id, {
                                    mode: value as "MNPC" | "numeric",
                                  })
                                }
                              >
                                <SelectTrigger className="h-11 w-full rounded-xl border border-slate-200 text-sm">
                                  <SelectValue placeholder="Selecciona el modo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MNPC">MNPC</SelectItem>
                                  <SelectItem value="numeric">Numérico</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormField>
                            {form?.mode === "numeric" && (
                              <FormField
                                label="Valor numérico"
                                error={showValueInputError ? valueError : undefined}
                              >
                                <Input
                                  type="number"
                                  className="h-11 rounded-xl border border-slate-200 text-sm"
                                  placeholder="Ingrese el valor numérico"
                                  value={form?.value || ""}
                                  onChange={(e) =>
                                    updateFormData(analysisType.id, {
                                      value: e.target.value,
                                    })
                                  }
                                />
                              </FormField>
                            )}
                          </>
                        )}

                        {analysisType.options === "boolean" && (
                          <FormField label="Resultado" error={valueError}>
                            <Select
                              value={form?.result || ""}
                              onValueChange={(value) =>
                                updateFormData(analysisType.id, {
                                  result: value as "POSITIVO" | "NEGATIVO",
                                })
                              }
                            >
                              <SelectTrigger className="h-11 w-full rounded-xl border border-slate-200 text-sm">
                                <SelectValue placeholder="Selecciona el resultado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="POSITIVO">POSITIVO</SelectItem>
                                <SelectItem value="NEGATIVO">NEGATIVO</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                        )}

                        {(analysisType.options === "otro" || analysisType.options === "string") && (
                          <FormField
                            label="Resultado"
                            error={showValueInputError ? valueError : undefined}
                          >
                            <Input
                              type="text"
                              className="h-11 rounded-xl border border-slate-200 text-sm"
                              placeholder="Ingrese el valor"
                              value={form?.value || ""}
                              onChange={(e) =>
                                updateFormData(analysisType.id, {
                                  value: e.target.value,
                                })
                              }
                            />
                          </FormField>
                        )}

                        {analysisType.options === "numeric" && (
                          <FormField
                            label="Resultado"
                            error={showValueInputError ? valueError : undefined}
                          >
                            <Input
                              type="number"
                              className="h-11 rounded-xl border border-slate-200 text-sm"
                              placeholder="Ingrese el valor numérico"
                              value={form?.value || ""}
                              onChange={(e) =>
                                updateFormData(analysisType.id, {
                                  value: e.target.value,
                                })
                              }
                            />
                          </FormField>
                        )}

                        <FormField label="Fecha del análisis" error={dateError}>
                          <Input
                            type="date"
                            className="h-11 rounded-xl border border-slate-200 text-sm"
                            value={form?.date || ""}
                            onChange={(e) =>
                              updateFormData(analysisType.id, {
                                date: e.target.value,
                              })
                            }
                          />
                        </FormField>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="w-full rounded-full md:w-auto"
                          onClick={() => handleSave(analysisType)}
                          disabled={isSaveDisabled}
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
            )}

                <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                        AnÃ¡lisis pendientes
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        RegistrÃ¡ cada resultado con su fecha obligatoria.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {pendingAnalysisTypes.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Todos los anÃ¡lisis ya fueron registrados.
                      </p>
                    ) : (
                      pendingAnalysisTypes.map((analysisType) => {
                        const form = formData[analysisType.id];
                        const valueError = fieldErrors[analysisType.id]?.value;
                        const dateError = fieldErrors[analysisType.id]?.date;
                        const cardHasError = Boolean(valueError || dateError);
                        const cardBorderClasses = cardHasError
                          ? "border-rose-200 bg-rose-50/30 dark:border-rose-500/70 dark:bg-rose-900/30"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950";

                        const valueStatus = resolveAnalysisValueStatus(
                          analysisType,
                          form
                        );
                        const showModeError =
                          analysisType.options === "dual" &&
                          Boolean(valueError && !form?.mode);
                        const showValueInputError =
                          analysisType.options === "dual"
                            ? Boolean(valueError && form?.mode === "numeric")
                            : Boolean(valueError);
                        const isSaveDisabled =
                          saving.has(analysisType.id) ||
                          valueStatus.missing ||
                          !form?.date;

                        return (
                          <div
                            key={analysisType.id}
                            className={`flex flex-col gap-4 rounded-2xl border p-4 shadow transition ${cardBorderClasses}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {analysisType.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  CÃ³digo: {analysisType.code}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[11px] uppercase tracking-[0.3em]">
                                Pendiente
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              {analysisType.options === "dual" && (
                                <>
                                  <FormField
                                    label="Modo"
                                    error={showModeError ? valueError : undefined}
                                  >
                                    <Select
                                      value={form?.mode || ""}
                                      onValueChange={(value) => {
                                        updateFormData(analysisType.id, {
                                          mode: value as "MNPC" | "numeric",
                                        });
                                        setFieldErrorMessage(
                                          analysisType.id,
                                          "value"
                                        );
                                      }}
                                    >
                                      <SelectTrigger className="h-11 w-full rounded-xl border border-slate-200 text-sm">
                                        <SelectValue placeholder="Selecciona el modo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="MNPC">MNPC</SelectItem>
                                        <SelectItem value="numeric">NumÃ©rico</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormField>
                                  {form?.mode === "numeric" && (
                                    <FormField
                                      label="Valor numÃ©rico"
                                      error={showValueInputError ? valueError : undefined}
                                    >
                                      <Input
                                        type="number"
                                        className="h-11 rounded-xl border border-slate-200 text-sm"
                                        placeholder="Ingrese el valor numÃ©rico"
                                        value={form?.value || ""}
                                        onChange={(e) => {
                                          updateFormData(analysisType.id, {
                                            value: e.target.value,
                                          });
                                          setFieldErrorMessage(
                                            analysisType.id,
                                            "value"
                                          );
                                        }}
                                      />
                                    </FormField>
                                  )}
                                </>
                              )}

                              {analysisType.options === "boolean" && (
                                <FormField label="Resultado" error={valueError}>
                                  <Select
                                    value={form?.result || ""}
                                    onValueChange={(value) => {
                                      updateFormData(analysisType.id, {
                                        result: value as "POSITIVO" | "NEGATIVO",
                                      });
                                      setFieldErrorMessage(
                                        analysisType.id,
                                        "value"
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="h-11 w-full rounded-xl border border-slate-200 text-sm">
                                      <SelectValue placeholder="Selecciona el resultado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="POSITIVO">
                                        POSITIVO
                                      </SelectItem>
                                      <SelectItem value="NEGATIVO">
                                        NEGATIVO
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormField>
                              )}

                              {(analysisType.options === "otro" ||
                                analysisType.options === "string") && (
                                <FormField
                                  label="Resultado"
                                  error={showValueInputError ? valueError : undefined}
                                >
                                  <Input
                                    type="text"
                                    className="h-11 rounded-xl border border-slate-200 text-sm"
                                    placeholder="Ingrese el valor"
                                    value={form?.value || ""}
                                    onChange={(e) => {
                                      updateFormData(analysisType.id, {
                                        value: e.target.value,
                                      });
                                      setFieldErrorMessage(
                                        analysisType.id,
                                        "value"
                                      );
                                    }}
                                  />
                                </FormField>
                              )}

                              {analysisType.options === "numeric" && (
                                <FormField
                                  label="Resultado"
                                  error={showValueInputError ? valueError : undefined}
                                >
                                  <Input
                                    type="number"
                                    className="h-11 rounded-xl border border-slate-200 text-sm"
                                    placeholder="Ingrese el valor numÃ©rico"
                                    value={form?.value || ""}
                                    onChange={(e) => {
                                      updateFormData(analysisType.id, {
                                        value: e.target.value,
                                      });
                                      setFieldErrorMessage(
                                        analysisType.id,
                                        "value"
                                      );
                                    }}
                                  />
                                </FormField>
                              )}

                              <FormField label="Fecha del anÃ¡lisis" error={dateError}>
                                <Input
                                  type="date"
                                  className="h-11 rounded-xl border border-slate-200 text-sm"
                                  value={form?.date || ""}
                                  onChange={(e) => {
                                    updateFormData(analysisType.id, {
                                      date: e.target.value,
                                    });
                                    setFieldErrorMessage(
                                      analysisType.id,
                                      "date"
                                    );
                                  }}
                                />
                              </FormField>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                className="w-full rounded-full md:w-auto"
                                onClick={() => handleSave(analysisType)}
                                disabled={isSaveDisabled}
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
                      })
                    )}
                  </div>
                </section>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
