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
import { useToast } from "@/components/toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Department } from "@/lib/types/departments";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type CreateDepartmentDto,
  type UpdateDepartmentDto,
} from "@/lib/services/departments.service";

interface DepartmentsManagerProps {
  onRefresh?: () => void;
}

export function DepartmentsManager({ onRefresh }: DepartmentsManagerProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    plantId: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      showError("Error al cargar departamentos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        plantId: "",
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        plantId: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: "",
      plantId: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError("Error", "El nombre del departamento es requerido");
      return;
    }

    try {
      if (editingDepartment) {
        const updateData: UpdateDepartmentDto = {
          name: trimmedName,
          ...(formData.plantId && { plantId: parseInt(formData.plantId, 10) }),
        };
        await updateDepartment(editingDepartment.id, updateData);
        showSuccess("Departamento actualizado", "El departamento se ha actualizado correctamente");
      } else {
        const createData: CreateDepartmentDto = {
          name: trimmedName,
        };
        if (formData.plantId) {
          createData.plantId = parseInt(formData.plantId, 10);
        }
        await createDepartment(createData);
        showSuccess("Departamento creado", "El departamento se ha creado correctamente");
      }

      handleCloseDialog();
      loadDepartments();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este departamento?")) {
      return;
    }

    try {
      await deleteDepartment(id);
      showSuccess("Departamento eliminado", "El departamento se ha eliminado correctamente");
      loadDepartments();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar departamento", error);
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando departamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar departamentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Departamento
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Subáreas</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No se encontraron departamentos
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>
                    {department.subareas?.length || 0} subárea(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(department)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(department.id)}
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
              {editingDepartment ? "Editar Departamento" : "Nuevo Departamento"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? "Modifica la información del departamento"
                : "Completa la información para crear un nuevo departamento"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Producción"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ID de Planta (Opcional)</label>
              <Input
                type="number"
                value={formData.plantId}
                onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
                placeholder="Ej: 1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingDepartment ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


