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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getQualityTypes } from "@/lib/services/quality-types.service";
import type { QualityType } from "@/lib/types/quality-types";
import { getAllDepartments } from "@/lib/services/departments.service";
import type { Department } from "@/lib/types/departments";
import { Switch } from "@/components/ui/switch";

export function EventTypesManager() {
  const [eventTypes, setEventTypes] = useState<MicroType[]>([]);
  const [qualityTypes, setQualityTypes] = useState<QualityType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<MicroType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start: "",
    end: "",
    description: "",
    qualityTypeId: "",
    departmentId: "",
    belongsToMicroIndex: false,
    microIndexGroup: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, qTypes, depts] = await Promise.all([
        getMicroTypes(),
        getQualityTypes(),
        getAllDepartments(),
      ]);
      // No necesitamos normalizar, la API ya devuelve qualityType como objeto o null
      // Solo establecemos qualityTypeId para uso interno si no existe
      const normalizedTypes = types.map((type: any) => {
        if (type.qualityType && !type.qualityTypeId) {
          return { ...type, qualityTypeId: type.qualityType.id };
        }
        return type;
      });
      setEventTypes(normalizedTypes as MicroType[]);
      setQualityTypes(qTypes);
      setDepartments(depts);
    } catch (error) {
      showError("Error al cargar datos", error);
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
      // Obtener qualityTypeId del objeto qualityType si existe, o del campo directo
      const qualityTypeIdValue = type.qualityType?.id || type.qualityTypeId;
      const departmentIdValue = type.department?.id || type.departmentId;
      setFormData({
        name: type.name,
        start: startValue,
        end: endValue,
        description: type.description,
        qualityTypeId: qualityTypeIdValue?.toString() || "",
        departmentId: departmentIdValue?.toString() || "",
        belongsToMicroIndex: type.belongsToMicroIndex || false,
        microIndexGroup: type.microIndexGroup || "",
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        start: "",
        end: "",
        description: "",
        qualityTypeId: "",
        departmentId: "",
        belongsToMicroIndex: false,
        microIndexGroup: "",
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
      qualityTypeId: "",
      departmentId: "",
      belongsToMicroIndex: false,
      microIndexGroup: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Agregar "h" al final de start y end antes de enviar al API
      const dataToSend: any = {
        name: formData.name,
        start: `${formData.start}h`,
        end: `${formData.end}h`,
        description: formData.description,
      };
      
      // Siempre enviar qualityTypeId cuando se está editando (para actualizar o quitar la relación)
      if (editingType) {
        // Si hay un qualityTypeId seleccionado, enviarlo como número
        if (formData.qualityTypeId && formData.qualityTypeId !== "none") {
          dataToSend.qualityTypeId = parseInt(formData.qualityTypeId, 10);
        } else {
          // Si no hay selección (o es "none"), enviar null para quitar la relación
          dataToSend.qualityTypeId = null;
        }

        // DepartmentId
        if (formData.departmentId && formData.departmentId !== "none") {
          dataToSend.departmentId = parseInt(formData.departmentId, 10);
        } else {
          dataToSend.departmentId = null;
        }
      } else {
        // Al crear, solo enviar si hay uno seleccionado
        if (formData.qualityTypeId && formData.qualityTypeId !== "none") {
          dataToSend.qualityTypeId = parseInt(formData.qualityTypeId, 10);
        }
        if (formData.departmentId && formData.departmentId !== "none") {
          dataToSend.departmentId = parseInt(formData.departmentId, 10);
        }
      }
      
      if (editingType) {
        console.log("Actualizando micro_type con datos:", dataToSend);
        const updatedType = await updateMicroType(editingType.id, dataToSend);
        setEventTypes(prev => prev.map(t => t.id === editingType.id ? updatedType : t));
        showSuccess("Tipo de evento actualizado", "El tipo de evento se ha actualizado correctamente.");
      } else {
        console.log("Creando micro_type con datos:", dataToSend);
        const newType = await createMicroType(dataToSend);
        setEventTypes(prev => [...prev, newType]);
        showSuccess("Tipo de evento creado", "El tipo de evento se ha creado correctamente.");
      }
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error completo al guardar:", error);
      showError("Error al guardar tipo de evento", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este tipo de evento?")) {
      return;
    }
    try {
      setLoading(true);
      await deleteMicroType(id);
      setEventTypes(prev => prev.filter(t => t.id !== id));
      showSuccess("Tipo de evento eliminado", "El tipo de evento se ha eliminado correctamente.");
    } catch (error) {
      showError("Error al eliminar tipo de evento", error);
    } finally {
      setLoading(false);
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
              <TableHead>Tipo de Calidad</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {eventTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hay tipos de eventos registrados
                  </TableCell>
                </TableRow>
              ) : (
                eventTypes.map((type) => {
                  // El API devuelve qualityType como objeto { id, name } o null
                  const qualityTypeName = type.qualityType?.name || "-";
                  const departmentName = type.department?.name || "-";
                  return (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.start}</TableCell>
                      <TableCell>{type.end}</TableCell>
                      <TableCell className="max-w-xs truncate">{type.description}</TableCell>
                      <TableCell>{qualityTypeName}</TableCell>
                      <TableCell>{departmentName}</TableCell>
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
                  );
                })
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
            <div>
              <label htmlFor="qualityTypeId" className="text-sm font-medium mb-2 block">
                Tipo de Calidad
              </label>
              <Select
                value={formData.qualityTypeId || "none"}
                onValueChange={(value) => setFormData({ ...formData, qualityTypeId: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de calidad (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin tipo de calidad</SelectItem>
                  {qualityTypes.map((qt) => (
                    <SelectItem key={qt.id} value={qt.id.toString()}>
                      {qt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="departmentId" className="text-sm font-medium mb-2 block">
                Departamento
              </label>
              <Select
                value={formData.departmentId || "none"}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin departamento</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
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

