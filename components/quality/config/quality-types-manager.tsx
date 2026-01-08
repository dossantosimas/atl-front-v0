"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { QualityType } from "@/lib/types/quality-types";
import {
  getQualityTypes,
  createQualityType,
  updateQualityType,
  deleteQualityType,
} from "@/lib/services/quality-types.service";

export function QualityTypesManager() {
  const [qualityTypes, setQualityTypes] = useState<QualityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<QualityType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadQualityTypes();
  }, []);

  const loadQualityTypes = async () => {
    try {
      setLoading(true);
      const types = await getQualityTypes();
      setQualityTypes(types);
    } catch (error) {
      showError("Error al cargar tipos de calidad", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type?: QualityType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingType(null);
    setFormData({
      name: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await updateQualityType(editingType.id, formData);
        showSuccess("Subarea de calidad actualizada", "La subarea de calidad se ha actualizado correctamente.");
      } else {
        await createQualityType(formData);
        showSuccess("Subarea de calidad creada", "La subarea de calidad se ha creado correctamente.");
      }
      handleCloseDialog();
      loadQualityTypes();
    } catch (error) {
      showError(
        editingType ? "Error al actualizar subarea de calidad" : "Error al crear subarea de calidad",
        error
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta subarea de calidad?")) {
      return;
    }
    try {
      await deleteQualityType(id);
      showSuccess("Subarea de calidad eliminada", "La subarea de calidad se ha eliminado correctamente");
      loadQualityTypes();
    } catch (error) {
      showError("Error al eliminar subarea de calidad", error);
    }
  };


  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Cargando subareas de calidad...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Subareas de Calidad
          </h2>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Subarea
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualityTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500 dark:text-gray-400">
                    No hay subareas de calidad. Crea una nueva para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                qualityTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(type)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Editar Subarea de Calidad" : "Nueva Subarea de Calidad"}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? "Modifica los datos de la subarea de calidad"
                : "Completa el formulario para crear una nueva subarea de calidad"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nombre *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Microbiología Ambiental"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingType ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

