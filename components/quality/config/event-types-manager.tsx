"use client";

import { useState, useEffect } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { MicroType } from "@/lib/types/micro-types";
import {
  getMicroTypes,
  createMicroType,
  updateMicroType,
  deleteMicroType,
} from "@/lib/services/micro-types.service";

export function EventTypesManager() {
  const [eventTypes, setEventTypes] = useState<MicroType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<MicroType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start: "",
    end: "",
    description: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const types = await getMicroTypes();
      setEventTypes(types);
    } catch (error) {
      showError("Error al cargar tipos de eventos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type?: MicroType) => {
    if (type) {
      setEditingType(type);
      // Remover "h" del final si existe para mostrar solo el número
      const startValue = type.start.replace(/h$/, "");
      const endValue = type.end.replace(/h$/, "");
      setFormData({
        name: type.name,
        start: startValue,
        end: endValue,
        description: type.description,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        start: "",
        end: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingType(null);
    setFormData({
      name: "",
      start: "",
      end: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Agregar "h" al final de start y end antes de enviar al API
      const dataToSend = {
        ...formData,
        start: `${formData.start}h`,
        end: `${formData.end}h`,
      };
      if (editingType) {
        await updateMicroType(editingType.id, dataToSend);
        showSuccess("Tipo de evento actualizado", "El tipo de evento se ha actualizado correctamente.");
      } else {
        await createMicroType(dataToSend);
        showSuccess("Tipo de evento creado", "El tipo de evento se ha creado correctamente.");
      }
      handleCloseDialog();
      loadEventTypes();
    } catch (error) {
      showError("Error al guardar tipo de evento", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este tipo de evento?")) {
      return;
    }
    try {
      await deleteMicroType(id);
      showSuccess("Tipo de evento eliminado", "El tipo de evento se ha eliminado correctamente.");
      loadEventTypes();
    } catch (error) {
      showError("Error al eliminar tipo de evento", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando tipos de eventos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tipos de Eventos</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tipo de Evento
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {eventTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No hay tipos de eventos registrados
                  </TableCell>
                </TableRow>
              ) : (
                eventTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.start}</TableCell>
                    <TableCell>{type.end}</TableCell>
                    <TableCell className="max-w-xs truncate">{type.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(type)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Editar Tipo de Evento" : "Nuevo Tipo de Evento"}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? "Modifique los datos del tipo de evento"
                : "Complete los datos para crear un nuevo tipo de evento"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium mb-2 block">
                Nombre *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Análisis de Agua"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start" className="text-sm font-medium mb-2 block">
                  Inicio *
                </label>
                <Input
                  id="start"
                  type="text"
                  value={formData.start}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, start: value });
                  }}
                  placeholder="Ej: 24"
                  required
                />
              </div>
              <div>
                <label htmlFor="end" className="text-sm font-medium mb-2 block">
                  Final *
                </label>
                <Input
                  id="end"
                  type="text"
                  value={formData.end}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, end: value });
                  }}
                  placeholder="Ej: 26"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                Descripción *
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Descripción del tipo de evento"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingType ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

