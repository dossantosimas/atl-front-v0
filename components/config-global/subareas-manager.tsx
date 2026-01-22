"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  getSubareas,
  type CreateSubareaDto,
  type UpdateSubareaDto,
} from "@/lib/services/departments.service";

interface SubareasManagerProps {
  onRefresh?: () => void;
}

export function SubareasManager({ onRefresh }: SubareasManagerProps) {
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubarea, setEditingSubarea] = useState<Subarea | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showSuccess, showError } = useToast();

  const loadSubareas = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Nunca cambiar loading a true si ya hay datos, para evitar el flash
      // Solo mostrar loading si no hay datos previos
      const wasEmpty = subareas.length === 0;
      if (wasEmpty) {
        setLoading(true);
      }
      
      const params: { departmentId?: number; name?: string } = {};
      
      if (selectedDepartmentId !== null && selectedDepartmentId !== undefined) {
        params.departmentId = selectedDepartmentId;
      }
      
      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") {
        params.name = debouncedSearchQuery.trim();
      }
      
      const data = await getSubareas(Object.keys(params).length > 0 ? params : undefined);
      
      // Solo actualizar si el request no fue cancelado
      if (!abortController.signal.aborted) {
        // Actualizar datos de forma atómica para evitar flash
        setSubareas(data);
        if (wasEmpty) {
          setLoading(false);
        }
      }
    } catch (error: any) {
      // Ignorar errores de cancelación
      if (error?.name === 'AbortError' || error?.name === 'CanceledError') {
        return;
      }
      if (!abortController.signal.aborted) {
        showError("Error al cargar subáreas", error);
        setSubareas([]);
        setLoading(false);
      }
    }
  }, [selectedDepartmentId, debouncedSearchQuery, showError, subareas.length]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const departmentsData = await getAllDepartments();
      setDepartments(departmentsData.map((d) => ({ id: d.id, name: d.name })));
      // Cargar subáreas iniciales
      await loadSubareas();
    } catch (error) {
      showError("Error al cargar datos", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Debounce para la búsqueda por nombre
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      loadSubareas();
    }
  }, [selectedDepartmentId, debouncedSearchQuery, initialLoading, loadSubareas]);

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

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError("Error", "El nombre de la subárea es requerido");
      return;
    }

    if (!formData.departmentId) {
      showError("Error", "Debes seleccionar un departamento");
      return;
    }

    try {
      if (editingSubarea) {
        const updateData: UpdateSubareaDto = {
          name: trimmedName,
          departmentId: parseInt(formData.departmentId, 10),
        };
        await updateSubarea(editingSubarea.id, updateData);
        showSuccess("Subárea actualizada", "La subárea se ha actualizado correctamente");
      } else {
        const createData: CreateSubareaDto = {
          name: trimmedName,
          departmentId: parseInt(formData.departmentId, 10),
        };
        await createSubarea(createData);
        showSuccess("Subárea creada", "La subárea se ha creado correctamente");
      }

      handleCloseDialog();
      loadSubareas();
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
      loadSubareas();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar subárea", error);
    }
  };


  // Memoizar el nombre del departamento para evitar búsquedas innecesarias
  const getDepartmentName = useCallback((departmentId: number) => {
    return departments.find((d) => d.id === departmentId)?.name || "N/A";
  }, [departments]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando subáreas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Departamento</label>
            <Select
              value={selectedDepartmentId?.toString() || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedDepartmentId(null);
                } else {
                  setSelectedDepartmentId(parseInt(value, 10));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Buscar por nombre</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar subáreas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            "Cargando..."
          ) : subareas.length > 0 ? (
            `Mostrando ${subareas.length} subárea(s)${debouncedSearchQuery ? ` (filtrado por: "${debouncedSearchQuery}")` : ""}`
          ) : (
            "No se encontraron subáreas con los filtros seleccionados"
          )}
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
              <TableHead className="w-[40%] min-w-[200px]">Nombre</TableHead>
              <TableHead className="w-[40%] min-w-[200px]">Departamento</TableHead>
              <TableHead className="w-[20%] min-w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subareas.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No se encontraron subáreas con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              <>
                {subareas.map((subarea) => (
                  <TableRow key={subarea.id}>
                    <TableCell className="font-medium w-[40%] min-w-[200px]">{subarea.name}</TableCell>
                    <TableCell className="w-[40%] min-w-[200px]">
                      {getDepartmentName(subarea.departmentId)}
                    </TableCell>
                    <TableCell className="w-[20%] min-w-[120px] text-right">
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
                ))}
                {loading && subareas.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-2 text-xs text-gray-500">
                      Actualizando...
                    </TableCell>
                  </TableRow>
                )}
              </>
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


