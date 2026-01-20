"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { CompatibilityMatrix, CompatibilityLevel } from "@/lib/types/chemical-substances";
import {
  getCompatibilityMatrix,
  createCompatibilityMatrixEntry,
  updateCompatibilityMatrixEntry,
  deleteCompatibilityMatrixEntry,
  getCompatibilityLevels,
} from "@/lib/services/chemical-substances.service";
import { ChemicalSubstancesCombobox } from "./chemical-substances-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CompatibilityMatrixManager() {
  const [matrix, setMatrix] = useState<CompatibilityMatrix[]>([]);
  const [levels, setLevels] = useState<CompatibilityLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CompatibilityMatrix | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    chemicalAId: "",
    chemicalBId: "",
    compatibilityLevelId: "",
    riskDescription: "",
    reactionType: "",
    requiredControls: "",
    sourceReference: "",
    validatedBy: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matrixData, levelsData] = await Promise.all([
        getCompatibilityMatrix(),
        getCompatibilityLevels(),
      ]);
      setMatrix(matrixData);
      setLevels(levelsData);
    } catch (error) {
      showError("Error al cargar matriz de compatibilidad", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (entry?: CompatibilityMatrix) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        chemicalAId: entry.chemicalAId,
        chemicalBId: entry.chemicalBId,
        compatibilityLevelId: entry.compatibilityLevelId || "",
        riskDescription: entry.riskDescription,
        reactionType: entry.reactionType,
        requiredControls: entry.requiredControls,
        sourceReference: entry.sourceReference || "",
        validatedBy: entry.validatedBy || "",
      });
    } else {
      setEditingEntry(null);
      setFormData({
        chemicalAId: "",
        chemicalBId: "",
        compatibilityLevelId: "",
        riskDescription: "",
        reactionType: "",
        requiredControls: "",
        sourceReference: "",
        validatedBy: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
    setFormData({
      chemicalAId: "",
      chemicalBId: "",
      compatibilityLevelId: "",
      riskDescription: "",
      reactionType: "",
      requiredControls: "",
      sourceReference: "",
      validatedBy: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        sourceReference: formData.sourceReference || undefined,
        validatedBy: formData.validatedBy || undefined,
      };
      if (editingEntry) {
        await updateCompatibilityMatrixEntry(editingEntry.id, submitData);
        showSuccess(
          "Entrada de matriz actualizada",
          "La entrada de la matriz se ha actualizado correctamente."
        );
      } else {
        await createCompatibilityMatrixEntry(submitData);
        showSuccess(
          "Entrada de matriz creada",
          "La entrada de la matriz se ha creado correctamente."
        );
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      showError("Error al guardar entrada de matriz", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta entrada de la matriz?")) {
      return;
    }
    try {
      await deleteCompatibilityMatrixEntry(id);
      showSuccess(
        "Entrada de matriz eliminada",
        "La entrada de la matriz se ha eliminado correctamente."
      );
      loadData();
    } catch (error) {
      showError("Error al eliminar entrada de matriz", error);
    }
  };

  const filteredMatrix = useMemo(() => {
    if (!searchQuery.trim()) {
      return matrix;
    }
    const query = searchQuery.toLowerCase().trim();
    return matrix.filter(
      (entry) =>
        entry.chemicalA?.name.toLowerCase().includes(query) ||
        entry.chemicalB?.name.toLowerCase().includes(query) ||
        entry.compatibilityLevel?.code.toLowerCase().includes(query) ||
        entry.reactionType.toLowerCase().includes(query)
    );
  }, [matrix, searchQuery]);

  const getLevelColor = (code: string) => {
    const level = levels.find((l) => l.code === code);
    return level?.color || "#gray";
  };

  if (loading) {
    return <div className="text-center py-8">Cargando matriz de compatibilidad...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Matriz de Compatibilidad</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Relación
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por sustancias o nivel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <div className="text-sm text-gray-500">
            {filteredMatrix.length} de {matrix.length} relaciones
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sustancia A</TableHead>
              <TableHead>Sustancia B</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Tipo de Reacción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMatrix.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchQuery
                    ? "No se encontraron relaciones con esos criterios"
                    : "No hay relaciones de compatibilidad registradas"}
                </TableCell>
              </TableRow>
            ) : (
              filteredMatrix.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.chemicalA?.name || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.chemicalB?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getLevelColor(entry.compatibilityLevel?.code || "") }}
                      />
                      <span className="text-sm">
                        {entry.compatibilityLevel?.code || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{entry.reactionType}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Editar Relación de Compatibilidad" : "Nueva Relación de Compatibilidad"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry
                ? "Modifique la información de la relación de compatibilidad"
                : "Ingrese la información de la nueva relación de compatibilidad"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="chemicalAId" className="text-sm font-medium mb-2 block">
                Sustancia A *
              </label>
              <ChemicalSubstancesCombobox
                value={formData.chemicalAId}
                onValueChange={(value) => setFormData({ ...formData, chemicalAId: value })}
                excludeId={formData.chemicalBId}
              />
            </div>
            <div>
              <label htmlFor="chemicalBId" className="text-sm font-medium mb-2 block">
                Sustancia B *
              </label>
              <ChemicalSubstancesCombobox
                value={formData.chemicalBId}
                onValueChange={(value) => setFormData({ ...formData, chemicalBId: value })}
                excludeId={formData.chemicalAId}
              />
            </div>
            <div>
              <label htmlFor="compatibilityLevelId" className="text-sm font-medium mb-2 block">
                Nivel de Compatibilidad *
              </label>
              <Select
                value={formData.compatibilityLevelId}
                onValueChange={(value) => setFormData({ ...formData, compatibilityLevelId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un nivel" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        {level.code} - {level.description}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="riskDescription" className="text-sm font-medium mb-2 block">
                Descripción del Riesgo *
              </label>
              <Textarea
                id="riskDescription"
                value={formData.riskDescription}
                onChange={(e) => setFormData({ ...formData, riskDescription: e.target.value })}
                required
                placeholder="Ej: Reacción exotérmica violenta..."
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="reactionType" className="text-sm font-medium mb-2 block">
                Tipo de Reacción *
              </label>
              <Input
                id="reactionType"
                value={formData.reactionType}
                onChange={(e) => setFormData({ ...formData, reactionType: e.target.value })}
                required
                placeholder="Ej: Neutralización exotérmica"
              />
            </div>
            <div>
              <label htmlFor="requiredControls" className="text-sm font-medium mb-2 block">
                Controles Requeridos *
              </label>
              <Textarea
                id="requiredControls"
                value={formData.requiredControls}
                onChange={(e) => setFormData({ ...formData, requiredControls: e.target.value })}
                required
                placeholder="Ej: NO mezclar directamente. Usar protección completa..."
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="sourceReference" className="text-sm font-medium mb-2 block">
                Referencia de Fuente
              </label>
              <Input
                id="sourceReference"
                value={formData.sourceReference}
                onChange={(e) => setFormData({ ...formData, sourceReference: e.target.value })}
                placeholder="Ej: MSDS Ácido Clorhídrico / Hidróxido de Sodio"
              />
            </div>
            <div>
              <label htmlFor="validatedBy" className="text-sm font-medium mb-2 block">
                Validado Por
              </label>
              <Input
                id="validatedBy"
                value={formData.validatedBy}
                onChange={(e) => setFormData({ ...formData, validatedBy: e.target.value })}
                placeholder="Ej: Ing. Químico"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingEntry ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

