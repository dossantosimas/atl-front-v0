"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Subarea } from "@/lib/types/chemical-substances";
import {
  getAllSubareas,
  getAllDepartments,
  createSubarea,
  updateSubarea,
  deleteSubarea,
  type CreateSubareaDto,
  type UpdateSubareaDto,
} from "@/lib/services/departments.service";

interface SubareasManagerProps {
  onRefresh?: () => void;
}

export function SubareasManager({ onRefresh }: SubareasManagerProps) {
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubarea, setEditingSubarea] = useState<Subarea | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subareasData, departmentsData] = await Promise.all([
        getAllSubareas(),
        getAllDepartments(),
      ]);
      setSubareas(subareasData);
      setDepartments(departmentsData.map((d) => ({ id: d.id, name: d.name })));
    } catch (error) {
      showError("Error al cargar datos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subarea?: Subarea) => {
    if (subarea) {
      setEditingSubarea(subarea);
      setFormData({
        name: subarea.name,
        departmentId: subarea.departmentId.toString(),
      });
    } else {
      setEditingSubarea(null);
      setFormData({
        name: "",
        departmentId: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubarea(null);
    setFormData({
      name: "",
      departmentId: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.departmentId) {
      showError("Error", "Debes seleccionar un departamento");
      return;
    }

    try {
      const data: CreateSubareaDto | UpdateSubareaDto = {
        name: formData.name,
        departmentId: parseInt(formData.departmentId, 10),
      };

      if (editingSubarea) {
        await updateSubarea(editingSubarea.id, data);
        showSuccess("Subárea actualizada", "La subárea se ha actualizado correctamente");
      } else {
        await createSubarea(data);
        showSuccess("Subárea creada", "La subárea se ha creado correctamente");
      }

      handleCloseDialog();
      loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta subárea?")) {
      return;
    }

    try {
      await deleteSubarea(id);
      showSuccess("Subárea eliminada", "La subárea se ha eliminado correctamente");
      loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar subárea", error);
    }
  };

  const filteredSubareas = useMemo(() => {
    return subareas.filter((subarea) =>
      subarea.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subareas, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando subáreas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar subáreas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Subárea
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubareas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No se encontraron subáreas
                </TableCell>
              </TableRow>
            ) : (
              filteredSubareas.map((subarea) => (
                <TableRow key={subarea.id}>
                  <TableCell className="font-medium">{subarea.name}</TableCell>
                  <TableCell>
                    {departments.find((d) => d.id === subarea.departmentId)?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(subarea)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subarea.id)}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubarea ? "Editar Subárea" : "Nueva Subárea"}
            </DialogTitle>
            <DialogDescription>
              {editingSubarea
                ? "Modifica la información de la subárea"
                : "Completa la información para crear una nueva subárea"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Área de Filtración"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Departamento *</label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
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
                {editingSubarea ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


