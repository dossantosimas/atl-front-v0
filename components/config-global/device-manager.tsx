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
import type { Device } from "@/lib/types/device";
import {
  getAllDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  getDevices,
  type CreateDeviceDto,
  type UpdateDeviceDto,
} from "@/lib/services/device.service";
import { getAllEquipments, getEquipments, getEquipmentsBySubarea } from "@/lib/services/equipment.service";
import { getAllSubareas, getAllDepartments, getSubareasByDepartment } from "@/lib/services/departments.service";

interface DeviceManagerProps {
  onRefresh?: () => void;
}

export function DeviceManager({ onRefresh }: DeviceManagerProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [subareas, setSubareas] = useState<{ id: number; name: string; departmentId: number }[]>([]);
  const [filteredSubareas, setFilteredSubareas] = useState<{ id: number; name: string }[]>([]);
  const [equipments, setEquipments] = useState<{ id: number; name: string; subareaId: number }[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<{ id: number; name: string }[]>([]);
  // Estados para el formulario
  const [formSubareas, setFormSubareas] = useState<{ id: number; name: string }[]>([]);
  const [formEquipments, setFormEquipments] = useState<{ id: number; name: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedSubareaId, setSelectedSubareaId] = useState<number | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
    subareaId: "",
    equipmentId: "",
  });
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
    loadEquipments();
  }, [selectedDepartmentId, selectedSubareaId]);

  useEffect(() => {
    if (!initialLoading) {
      loadDevices();
    }
  }, [selectedDepartmentId, selectedSubareaId, selectedEquipmentId, debouncedSearchQuery, initialLoading]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const [departmentsData, subareasData, equipmentsData] = await Promise.all([
        getAllDepartments(),
        getAllSubareas(),
        getAllEquipments(),
      ]);
      setDepartments(departmentsData.map((d) => ({ id: d.id, name: d.name })));
      // Asegurar que subareas tenga departmentId
      setSubareas(subareasData.map((s) => ({ 
        id: s.id, 
        name: s.name, 
        departmentId: s.departmentId 
      })));
      setEquipments(equipmentsData.map((e) => ({ id: e.id, name: e.name, subareaId: e.subareaId })));
    } catch (error) {
      showError("Error al cargar datos", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadSubareas = async () => {
    if (!selectedDepartmentId) return;
    try {
      const data = await getSubareasByDepartment(selectedDepartmentId);
      setFilteredSubareas(data.map((s) => ({ id: s.id, name: s.name })));
    } catch (error) {
      showError("Error al cargar subáreas", error);
      setFilteredSubareas([]);
    }
  };

  const loadEquipments = async () => {
    try {
      const data = await getEquipments({
        departmentId: selectedDepartmentId || undefined,
        subareaId: selectedSubareaId || undefined,
      });
      setFilteredEquipments(data.map((e) => ({ id: e.id, name: e.name })));
    } catch (error) {
      showError("Error al cargar equipos", error);
      setFilteredEquipments([]);
    }
  };

  // Función para cargar subáreas del formulario
  const loadFormSubareas = useCallback(async (departmentId: number) => {
    try {
      const data = await getSubareasByDepartment(departmentId);
      setFormSubareas(data.map((s) => ({ id: s.id, name: s.name })));
    } catch (error) {
      showError("Error al cargar subáreas para el formulario", error);
      setFormSubareas([]);
    }
  }, [showError]);

  // Función para cargar equipos del formulario
  const loadFormEquipments = useCallback(async (subareaId: number) => {
    try {
      const data = await getEquipmentsBySubarea({ subareaId });
      setFormEquipments(data.map((e) => ({ id: e.id, name: e.name })));
    } catch (error) {
      showError("Error al cargar equipos para el formulario", error);
      setFormEquipments([]);
    }
  }, [showError]);

  const loadDevices = useCallback(async () => {
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
      const wasEmpty = devices.length === 0;
      if (wasEmpty) {
        setLoading(true);
      }
      
      const data = await getDevices({
        departmentId: selectedDepartmentId || undefined,
        subareaId: selectedSubareaId || undefined,
        equipmentId: selectedEquipmentId || undefined,
        name: debouncedSearchQuery || undefined,
      });
      
      // Solo actualizar si el request no fue cancelado
      if (!abortController.signal.aborted) {
        // Actualizar datos de forma atómica para evitar flash
        setDevices(data);
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
        showError("Error al cargar dispositivos", error);
        setDevices([]);
        setLoading(false);
      }
    }
  }, [selectedDepartmentId, selectedSubareaId, selectedEquipmentId, debouncedSearchQuery, showError, devices.length]);

  const handleOpenDialog = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      // Encontrar el equipo del dispositivo
      const deviceEquipment = equipments.find(e => e.id === device.equipmentId);
      if (deviceEquipment) {
        // Encontrar la subárea del equipo
        const equipmentSubarea = subareas.find(s => s.id === deviceEquipment.subareaId);
        if (equipmentSubarea) {
          setFormData({
            name: device.name,
            equipmentId: device.equipmentId.toString(),
            subareaId: deviceEquipment.subareaId.toString(),
            departmentId: equipmentSubarea.departmentId.toString(),
          });
          
          // Cargar la jerarquía completa
          loadFormSubareas(equipmentSubarea.departmentId);
          loadFormEquipments(deviceEquipment.subareaId);
        } else {
          setFormData({
            name: device.name,
            equipmentId: device.equipmentId.toString(),
            departmentId: "",
            subareaId: "",
          });
        }
      } else {
        setFormData({
          name: device.name,
          equipmentId: device.equipmentId.toString(),
          departmentId: "",
          subareaId: "",
        });
      }
    } else {
      setEditingDevice(null);
      setFormData({
        name: "",
        departmentId: "",
        subareaId: "",
        equipmentId: "",
      });
      setFormSubareas([]);
      setFormEquipments([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDevice(null);
    setFormData({
      name: "",
      departmentId: "",
      subareaId: "",
      equipmentId: "",
    });
    setFormSubareas([]);
    setFormEquipments([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError("Error", "El nombre del dispositivo es requerido");
      return;
    }

    if (!formData.departmentId) {
      showError("Error", "Debes seleccionar un departamento");
      return;
    }

    if (!formData.subareaId) {
      showError("Error", "Debes seleccionar una subárea");
      return;
    }

    if (!formData.equipmentId) {
      showError("Error", "Debes seleccionar un equipo");
      return;
    }

    try {
      if (editingDevice) {
        const updateData: UpdateDeviceDto = {
          name: trimmedName,
          equipmentId: parseInt(formData.equipmentId, 10),
        };
        await updateDevice(editingDevice.id, updateData);
        showSuccess("Dispositivo actualizado", "El dispositivo se ha actualizado correctamente");
      } else {
        const createData: CreateDeviceDto = {
          name: trimmedName,
          equipmentId: parseInt(formData.equipmentId, 10),
        };
        await createDevice(createData);
        showSuccess("Dispositivo creado", "El dispositivo se ha creado correctamente");
      }

      handleCloseDialog();
      if (!initialLoading) {
        loadDevices();
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este dispositivo?")) {
      return;
    }

    try {
      await deleteDevice(id);
      showSuccess("Dispositivo eliminado", "El dispositivo se ha eliminado correctamente");
      if (!initialLoading) {
        loadDevices();
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar dispositivo", error);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando dispositivos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las subáreas" />
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
            <label className="text-sm font-medium mb-2 block">Equipo</label>
            <Select
              value={selectedEquipmentId?.toString() || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedEquipmentId(null);
                } else {
                  setSelectedEquipmentId(parseInt(value, 10));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los equipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los equipos</SelectItem>
                {filteredEquipments.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id.toString()}>
                    {equipment.name}
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
                placeholder="Buscar dispositivos..."
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
          ) : devices.length > 0 ? (
            `Mostrando ${devices.length} dispositivo(s)${debouncedSearchQuery ? ` (filtrado por: "${debouncedSearchQuery}")` : ""}`
          ) : (
            "No se encontraron dispositivos con los filtros seleccionados"
          )}
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Dispositivo
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No se encontraron dispositivos con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>
                    {device.equipment?.name || `ID: ${device.equipmentId}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(device)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(device.id)}
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
              {editingDevice ? "Editar Dispositivo" : "Nuevo Dispositivo"}
            </DialogTitle>
            <DialogDescription>
              {editingDevice
                ? "Modifica la información del dispositivo"
                : "Completa la información para crear un nuevo dispositivo"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Sensor de Temperatura"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Departamento *</label>
              <Select
                value={formData.departmentId}
                onValueChange={async (value) => {
                  setFormData({ ...formData, departmentId: value, subareaId: "", equipmentId: "" });
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
                onValueChange={async (value) => {
                  setFormData({ ...formData, subareaId: value, equipmentId: "" });
                  if (value) {
                    await loadFormEquipments(parseInt(value, 10));
                  } else {
                    setFormEquipments([]);
                  }
                }}
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

            <div>
              <label className="text-sm font-medium mb-2 block">Equipo *</label>
              <Select
                value={formData.equipmentId}
                onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}
                required
                disabled={!formData.subareaId || formEquipments.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.subareaId 
                      ? "Primero selecciona una subárea" 
                      : formEquipments.length === 0
                      ? "Cargando equipos..."
                      : "Selecciona un equipo"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {formEquipments.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id.toString()}>
                      {equipment.name}
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
                {editingDevice ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

