from pathlib import Path
path = Path('components/quality_v0/analysis-modal.tsx')
text = path.read_text(encoding='utf-8')
start = text.find('            ) : (')
if start == -1:
    raise SystemError('start marker not found')
end = text.find('            )}', start)
if end == -1:
    raise SystemError('end marker not found')
new_block = """            ) : (
              <div className=\"grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4\">
                {existingAnalyses.length === 0 && pendingAnalysisTypes.length === 0 && (
                  <div className=\"col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60\">
                    No hay análisis disponibles.
                  </div>
                )}
                {existingAnalyses.map((analysis) => {
                  const typeName = analysis.name || \"Desconocido\";
                  const typeCode = analysis.code || \"\";
                  const analysisType = analysisTypes.find((at) => at.id === analysis.type_id);
                  const threshold = analysis.threshold || analysisType?.threshold || null;
                  const enrichedAnalysis = {
                    ...analysis,
                    threshold,
                  };
                  const conditionResult = evaluationWithThreshold(enrichedAnalysis);
                  const toneClasses = statusToneMap[conditionResult];
                  console.log(\"Aplicando color para:\", analysis.name, {
                    value: analysis.value,
                    threshold,
                    condition: analysis.condition,
                    result: conditionResult,
                  });
                  const formatDate = (dateString?: string) => {
                    if (!dateString) return \"-\";
                    try {
                      return new Date(dateString).toLocaleString(\"es-ES\", {
                        year: \"numeric\",
                        month: \"2-digit\",
                        day: \"2-digit\",
                        hour: \"2-digit\",
                        minute: \"2-digit\",
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
                      <div className=\"flex items-start justify-between gap-4\">
                        <div>
                          <p className=\"text-sm font-semibold text-slate-900 dark:text-white\">
                            {typeName}
                          </p>
                          {typeCode && (
                            <p className=\"text-xs text-slate-500 dark:text-slate-400\">
                              Código: {typeCode}
                            </p>
                          )}
                          <p className=\"text-sm text-slate-700 dark:text-slate-300 mt-1\">
                            {analysis.value || \"-\"}
                          </p>
                          <p className=\"text-[11px] text-slate-500 dark:text-slate-400 mt-1\">
                            Registrado: {formatAnalysisDate(analysis.created)}
                          </p>
                        </div>
                        <Badge variant=\"outline\" className=\"text-xs\">
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
                    ? \"border-rose-200 bg-rose-50/30 dark:border-rose-500/70 dark:bg-rose-900/30\"
                    : \"border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950\";

                  const valueStatus = resolveAnalysisValueStatus(analysisType, form);
                  const showModeError =
                    analysisType.options === \"dual\" && Boolean(valueError && !form?.mode);
                  const showValueInputError =
                    analysisType.options === \"dual\"
                      ? Boolean(valueError && form?.mode === \"numeric\")
                      : Boolean(valueError);
                  const isSaveDisabled =
                    saving.has(analysisType.id) || valueStatus.missing || !form?.date;

                  return (
                    <div
                      key={analysisType.id}
                      className={`rounded-2xl border p-4 shadow-sm transition flex flex-col gap-4 ${cardBorderClasses}`}
                    >
                      <div className=\"flex items-start justify-between gap-4\">
                        <div>
                          <p className=\"text-sm font-semibold text-slate-900 dark:text-white\">
                            {analysisType.name}
                          </p>
                          <p className=\"text-xs text-slate-500 dark:text-slate-400\">
                            Código: {analysisType.code}
                          </p>
                        </div>
                        <Badge variant=\"outline\" className=\"text-[11px] uppercase tracking-[0.3em]\">
                          Pendiente
                        </Badge>
                      </div>

                      <div className=\"space-y-3\">
                        {analysisType.options === \"dual\" && (
                          <>
                            <FormField
                              label=\"Modo\"
                              error={showModeError ? valueError : undefined}
                            >
                              <Select
                                value={form?.mode || \"\"}
                                onValueChange={(value) =>
                                  updateFormData(analysisType.id, {
                                    mode: value as \"MNPC\" | \"numeric\",
                                  })
                                }
                              >
                                <SelectTrigger className=\"h-11 w-full rounded-xl border border-slate-200 text-sm\">
                                  <SelectValue placeholder=\"Selecciona el modo\" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value=\"MNPC\">MNPC</SelectItem>
                                  <SelectItem value=\"numeric\">Numérico</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormField>
                            {form?.mode === \"numeric\" && (
                              <FormField
                                label=\"Valor numérico\"
                                error={showValueInputError ? valueError : undefined}
                              >
                                <Input
                                  type=\"number\"
                                  className=\"h-11 rounded-xl border border-slate-200 text-sm\"
                                  placeholder=\"Ingrese el valor numérico\"
                                  value={form?.value || \"\"}
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

                        {analysisType.options === \"boolean\" && (
                          <FormField label=\"Resultado\" error={valueError}>
                            <Select
                              value={form?.result || \"\"}
                              onValueChange={(value) =>
                                updateFormData(analysisType.id, {
                                  result: value as \"POSITIVO\" | \"NEGATIVO\",
                                })
                              }
                            >
                              <SelectTrigger className=\"h-11 w-full rounded-xl border border-slate-200 text-sm\">
                                <SelectValue placeholder=\"Selecciona el resultado\" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value=\"POSITIVO\">POSITIVO</SelectItem>
                                <SelectItem value=\"NEGATIVO\">NEGATIVO</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                        )}

                        {(analysisType.options === \"otro\" || analysisType.options === \"string\") && (
                          <FormField
                            label=\"Resultado\"
                            error={showValueInputError ? valueError : undefined}
                          >
                            <Input
                              type=\"text\"
                              className=\"h-11 rounded-xl border border-slate-200 text-sm\"
                              placeholder=\"Ingrese el valor\"
                              value={form?.value || \"\"}
                              onChange={(e) =>
                                updateFormData(analysisType.id, {
                                  value: e.target.value,
                                })
                              }
                            />
                          </FormField>
                        )}

                        {analysisType.options === \"numeric\" && (
                          <FormField
                            label=\"Resultado\"
                            error={showValueInputError ? valueError : undefined}
                          >
                            <Input
                              type=\"number\"
                              className=\"h-11 rounded-xl border border-slate-200 text-sm\"
                              placeholder=\"Ingrese el valor numérico\"
                              value={form?.value || \"\"}
                              onChange={(e) =>
                                updateFormData(analysisType.id, {
                                  value: e.target.value,
                                })
                              }
                            />
                          </FormField>
                        )}

                        <FormField label=\"Fecha del análisis\" error={dateError}>
                          <Input
                            type=\"date\"
                            className=\"h-11 rounded-xl border border-slate-200 text-sm\"
                            value={form?.date || \"\"}
                            onChange={(e) =>
                              updateFormData(analysisType.id, {
                                date: e.target.value,
                              })
                            }
                          />
                        </FormField>
                      </div>

                      <div className=\"flex justify-end\">
                        <Button
                          size=\"sm\"
                          className=\"w-full rounded-full md:w-auto\"
                          onClick={() => handleSave(analysisType)}
                          disabled={isSaveDisabled}
                        >
                          {saving.has(analysisType.id) ? (
                            <>
                              <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />
                              Guardando...
                            </>
                          ) : (
                            \"Guardar\"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
"""
new_text = text[:start] + new_block + text[end:]
path.write_text(new_text, encoding='utf-8')
