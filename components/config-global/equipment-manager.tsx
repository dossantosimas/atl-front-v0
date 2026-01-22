"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import type { Equipment } from "@/lib/types/equipment";
import {
  getAllEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipments,
  type CreateEquipmentDto,
  type UpdateEquipmentDto,
} from "@/lib/services/equipment.service";
import { getAllSubareas, getAllDepartments, getSubareasByDepartment } from "@/lib/services/departments.service";

interface EquipmentManagerProps {
  onRefresh?: () => void;
}

export function EquipmentManager({ onRefresh }: EquipmentManagerProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [subareas, setSubareas] = useState<{ id: number; name: string }[]>([]);
  const [filteredSubareas, setFilteredSubareas] = useState<{ id: number; name: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedSubareaId, setSelectedSubareaId] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
    subareaId: "",
  });
  const [formSubareas, setFormSubareas] = useState<{ id: number; name: string }[]>([]);
  const { showSuccess, showError } = useToast();


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
    if (selectedDepartmentId) {
      loadSubareas();
    } else {
      setFilteredSubareas([]);
      setSelectedSubareaId(null);
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (!initialLoading) {
      loadEquipments();
    }
  }, [selectedDepartmentId, selectedSubareaId, debouncedSearchQuery, initialLoading]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const [departmentsData, subareasData] = await Promise.all([
        getAllDepartments(),
        getAllSubareas(),
      ]);
      setDepartments(departmentsData.map((d) => ({ id: d.id, name: d.name })));
      setSubareas(subareasData.map((s) => ({ id: s.id, name: s.name })));
      // Cargar equipos iniciales
      await loadEquipments();
    } catch (error) {
      showError("Error al cargar datos", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadSubareas = async () => {
    if (!selectedDepartmentId) {
      setFilteredSubareas([]);
      return;
    }
    try {
      const data = await getSubareasByDepartment(selectedDepartmentId);
      setFilteredSubareas(data.map((s) => ({ id: s.id, name: s.name })));
      // Si no hay subáreas, limpiar la selección de subárea
      if (data.length === 0) {
        setSelectedSubareaId(null);
      }
    } catch (error) {
      showError("Error al cargar subáreas", error);
      setFilteredSubareas([]);
      setSelectedSubareaId(null);
    }
  };

  const loadEquipments = useCallback(async () => {
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
      const wasEmpty = equipments.length === 0;
      if (wasEmpty) {
        setLoading(true);
      }
      
      const data = await getEquipments({
        departmentId: selectedDepartmentId || undefined,
        subareaId: selectedSubareaId || undefined,
        name: debouncedSearchQuery || undefined,
      });
      
      // Solo actualizar si el request no fue cancelado
      if (!abortController.signal.aborted) {
        // Actualizar datos de forma atómica para evitar flash
        setEquipments(data);
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
        showError("Error al cargar equipos", error);
        setEquipments([]);
        setLoading(false);
      }
    }
  }, [selectedDepartmentId, selectedSubareaId, debouncedSearchQuery, showError, equipments.length]);

  const handleOpenDialog = async (equipment?: Equipment) => {
    if (equipment) {
      setEditingEquipment(equipment);
      
      // Obtener el departamento desde la subárea del equipo
      // Buscar todas las subáreas y encontrar el departamento
      let departmentId: number | null = null;
      try {
        const allSubareas = await getAllSubareas();
        const equipmentSubarea = allSubareas.find((s) => s.id === equipment.subareaId);
        departmentId = equipmentSubarea?.departmentId || null;
      } catch (error) {
        console.error("Error al obtener subáreas:", error);
      }
      
      setFormData({
        name: equipment.name,
        departmentId: departmentId?.toString() || "",
        subareaId: equipment.subareaId.toString(),
      });
      
      // Cargar subáreas del departamento si existe
      if (departmentId) {
        await loadFormSubareas(departmentId);
      }
    } else {
      setEditingEquipment(null);
      setFormData({
        name: "",
        departmentId: "",
        subareaId: "",
      });
      setFormSubareas([]);
    }
    setIsDialogOpen(true);
  };

  const loadFormSubareas = async (departmentId: number) => {
    try {
      const data = await getSubareasByDepartment(departmentId);
      setFormSubareas(data.map((s) => ({ id: s.id, name: s.name })));
    } catch (error) {
      showError("Error al cargar subáreas", error);
      setFormSubareas([]);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEquipment(null);
    setFormData({
      name: "",
      departmentId: "",
      subareaId: "",
    });
    setFormSubareas([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError("Error", "El nombre del equipo es requerido");
      return;
    }

    if (!formData.subareaId) {
      showError("Error", "Debes seleccionar una subárea");
      return;
    }

    try {
      if (editingEquipment) {
        const updateData: UpdateEquipmentDto = {
          name: trimmedName,
          subareaId: parseInt(formData.subareaId, 10),
        };
        await updateEquipment(editingEquipment.id, updateData);
        showSuccess("Equipo actualizado", "El equipo se ha actualizado correctamente");
      } else {
        const createData: CreateEquipmentDto = {
          name: trimmedName,
          subareaId: parseInt(formData.subareaId, 10),
        };
        await createEquipment(createData);
        showSuccess("Equipo creado", "El equipo se ha creado correctamente");
      }

      handleCloseDialog();
      if (!initialLoading) {
        loadEquipments();
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
      return;
    }

    try {
      await deleteEquipment(id);
      showSuccess("Equipo eliminado", "El equipo se ha eliminado correctamente");
      if (!initialLoading) {
        loadEquipments();
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar equipo", error);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando equipos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="text-sm font-medium mb-2 block">Subárea</label>
            <Select
              value={selectedSubareaId?.toString() || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedSubareaId(null);
                } else {
                  setSelectedSubareaId(parseInt(value, 10));
                }
              }}
              disabled={!selectedDepartmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedDepartmentId 
                    ? "Selecciona un departamento" 
                    : filteredSubareas.length === 0
                    ? "Este departamento no tiene subáreas"
                    : "Todas las subáreas"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las subáreas</SelectItem>
                {filteredSubareas.map((subarea) => (
                  <SelectItem key={subarea.id} value={subarea.id.toString()}>
                    {subarea.name}
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
                placeholder="Buscar equipos..."
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
          ) : equipments.length > 0 ? (
            `Mostrando ${equipments.length} equipo(s)${debouncedSearchQuery ? ` (filtrado por: "${debouncedSearchQuery}")` : ""}`
          ) : (
            "No se encontraron equipos con los filtros seleccionados"
          )}
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] min-w-[200px]">Nombre</TableHead>
              <TableHead className="w-[40%] min-w-[200px]">Subárea</TableHead>
              <TableHead className="w-[20%] min-w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipments.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No se encontraron equipos con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              <>
                {equipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium w-[40%] min-w-[200px]">{equipment.name}</TableCell>
                    <TableCell className="w-[40%] min-w-[200px]">
                      {equipment.subarea?.name || `ID: ${equipment.subareaId}`}
                    </TableCell>
                    <TableCell className="w-[20%] min-w-[120px] text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(equipment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(equipment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && equipments.length > 0 && (
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
              {editingEquipment ? "Editar Equipo" : "Nuevo Equipo"}
            </DialogTitle>
            <DialogDescription>
              {editingEquipment
                ? "Modifica la información del equipo"
                : "Completa la información para crear un nuevo equipo"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Tanque de Agua"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Departamento *</label>
              <Select
                value={formData.departmentId}
                onValueChange={async (value) => {
                  setFormData({ 
                    ...formData, 
                    departmentId: value,
                    subareaId: "" // Limpiar subárea al cambiar departamento
                  });
                  if (value) {
                    await loadFormSubareas(parseInt(value, 10));
                  } else {
                    setFormSubareas([]);
                  }
                }}
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

            <div>
              <label className="text-sm font-medium mb-2 block">Subárea *</label>
              <Select
                value={formData.subareaId}
                onValueChange={(value) => setFormData({ ...formData, subareaId: value })}
                required
                disabled={!formData.departmentId || formSubareas.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.departmentId 
                      ? "Primero selecciona un departamento" 
                      : formSubareas.length === 0
                      ? "Cargando subáreas..."
                      : "Selecciona una subárea"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {formSubareas.map((subarea) => (
                    <SelectItem key={subarea.id} value={subarea.id.toString()}>
                      {subarea.name}
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
                {editingEquipment ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

