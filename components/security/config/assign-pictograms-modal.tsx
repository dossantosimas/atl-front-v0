"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { Check } from "lucide-react";
import type {
  Pictogram,
  ChemicalSubstance,
} from "@/lib/types/chemical-substances";
import {
  getPictograms,
  getSubstancePictograms,
  assignPictogramsToSubstance,
  removePictogramsFromSubstance,
} from "@/lib/services/chemical-substances.service";
import { PictogramsDisplay } from "./pictograms-display";

// Helper function to normalize image URL
function getPictogramImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // Si ya es una URL completa de API, blob o data, retornarla tal cual
  if (imageUrl.startsWith('/api/') || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Si tiene un path antiguo como /security/pic/..., extraer solo el filename
  if (imageUrl.includes('/')) {
    const filename = imageUrl.split('/').pop() || imageUrl;
    return `/api/pictogram/image/${filename}`;
  }
  
  // Si es solo el filename, construir la URL completa
  return `/api/pictogram/image/${imageUrl}`;
}

interface AssignPictogramsModalProps {
  substance: ChemicalSubstance | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AssignPictogramsModal({
  substance,
  isOpen,
  onOpenChange,
  onSuccess,
}: AssignPictogramsModalProps) {
  const [allPictograms, setAllPictograms] = useState<Pictogram[]>([]);
  const [selectedPictogramIds, setSelectedPictogramIds] = useState<string[]>([]);
  const [initialPictogramIds, setInitialPictogramIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPictograms, setLoadingPictograms] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && substance) {
      loadPictograms();
    } else {
      // Limpiar estado cuando se cierra el modal
      setSelectedPictogramIds([]);
      setInitialPictogramIds([]);
      setAllPictograms([]);
    }
  }, [isOpen, substance]);

  const loadPictograms = async () => {
    if (!substance) return;

    try {
      setLoadingPictograms(true);
      const [all, assigned] = await Promise.all([
        getPictograms(),
        getSubstancePictograms(substance.id),
      ]);
      
      const assignedIds = assigned.map((p) => p.id);
      setAllPictograms(all);
      setSelectedPictogramIds(assignedIds);
      setInitialPictogramIds(assignedIds); // Guardar el estado inicial
    } catch (error) {
      showError("Error al cargar pictogramas", error);
    } finally {
      setLoadingPictograms(false);
    }
  };

  const handleTogglePictogram = (pictogramId: string) => {
    setSelectedPictogramIds((prev) => {
      if (prev.includes(pictogramId)) {
        return prev.filter((id) => id !== pictogramId);
      } else {
        return [...prev, pictogramId];
      }
    });
  };

  const handleSave = async () => {
    if (!substance) return;

    try {
      setLoading(true);
      
      // Calcular qué pictogramas agregar y cuáles quitar
      const pictogramsToAdd = selectedPictogramIds.filter(
        (id) => !initialPictogramIds.includes(id)
      );
      const pictogramsToRemove = initialPictogramIds.filter(
        (id) => !selectedPictogramIds.includes(id)
      );

      // Realizar las operaciones en paralelo
      const promises: Promise<void>[] = [];

      // Agregar nuevos pictogramas usando POST (merge)
      if (pictogramsToAdd.length > 0) {
        promises.push(
          assignPictogramsToSubstance(substance.id, {
            pictogramIds: pictogramsToAdd,
          })
        );
      }

      // Remover pictogramas específicos usando DELETE
      if (pictogramsToRemove.length > 0) {
        promises.push(
          removePictogramsFromSubstance(substance.id, {
            pictogramIds: pictogramsToRemove,
          })
        );
      }

      // Esperar a que todas las operaciones completen
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Mensaje de éxito según las operaciones realizadas
      let message = "";
      if (pictogramsToAdd.length > 0 && pictogramsToRemove.length > 0) {
        message = `Se agregaron ${pictogramsToAdd.length} pictograma(s) y se removieron ${pictogramsToRemove.length} pictograma(s).`;
      } else if (pictogramsToAdd.length > 0) {
        message = `Se agregaron ${pictogramsToAdd.length} pictograma(s) correctamente.`;
      } else if (pictogramsToRemove.length > 0) {
        message = `Se removieron ${pictogramsToRemove.length} pictograma(s) correctamente.`;
      } else {
        message = "No se realizaron cambios.";
      }

      showSuccess("Pictogramas actualizados", message);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      showError("Error al actualizar pictogramas", error);
    } finally {
      setLoading(false);
    }
  };

  if (!substance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar Pictogramas a {substance.name}</DialogTitle>
          <DialogDescription>
            Selecciona los pictogramas que deseas asignar a esta sustancia química.
            Puedes seleccionar múltiples pictogramas.
          </DialogDescription>
        </DialogHeader>

        {loadingPictograms ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Cargando pictogramas...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pictogramas actuales */}
            {substance.pictograms && substance.pictograms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Pictogramas actuales:</h4>
                <PictogramsDisplay pictograms={substance.pictograms} size="md" />
              </div>
            )}

            {/* Lista de todos los pictogramas */}
            <div>
              <h4 className="text-sm font-medium mb-3">
                Selecciona los pictogramas ({selectedPictogramIds.length} seleccionados)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-2 border rounded-lg">
                {allPictograms.map((pictogram) => {
                  const isSelected = selectedPictogramIds.includes(pictogram.id);
                  return (
                    <button
                      key={pictogram.id}
                      type="button"
                      onClick={() => handleTogglePictogram(pictogram.id)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all
                        ${
                          isSelected
                            ? "border-primary bg-primary/10 dark:bg-primary/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                          {pictogram.imageUrl ? (
                            <img
                              src={getPictogramImageUrl(pictogram.imageUrl) || ''}
                              alt={pictogram.name}
                              className="w-full h-full object-contain p-1"
                              onLoad={() => {
                                // Silenciar errores de carga exitosa
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Solo log en desarrollo, no mostrar error al usuario
                                if (process.env.NODE_ENV === 'development') {
                                  console.warn("⚠️ AssignModal - No se pudo cargar imagen:", {
                                    originalUrl: pictogram.imageUrl,
                                    finalUrl: getPictogramImageUrl(pictogram.imageUrl),
                                    attemptedSrc: target.src
                                  });
                                }
                                // Ocultar la imagen y mostrar placeholder
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-full h-full flex items-center justify-center text-xs text-gray-400 placeholder';
                                  placeholder.textContent = pictogram.name.charAt(0).toUpperCase();
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              {pictogram.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-center font-medium">
                          {pictogram.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Pictogramas"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

