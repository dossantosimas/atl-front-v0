"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Signal } from "@/lib/types/signal";
import {
  getAllSignals,
  createSignal,
  updateSignal,
  deleteSignal,
  getSignals,
  type CreateSignalDto,
  type UpdateSignalDto,
} from "@/lib/services/signal.service";
import { getAllDevices, getDevices, getDevicesByEquipment } from "@/lib/services/device.service";
import { getAllSourceData } from "@/lib/services/source-data.service";
import { getAllEquipments, getEquipments, getEquipmentsBySubarea } from "@/lib/services/equipment.service";
import { getAllSubareas, getAllDepartments, getSubareasByDepartment } from "@/lib/services/departments.service";

interface SignalManagerProps {
  onRefresh?: () => void;
}

export function SignalManager({ onRefresh }: SignalManagerProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [subareas, setSubareas] = useState<{ id: number; name: string; departmentId: number }[]>([]);
  const [filteredSubareas, setFilteredSubareas] = useState<{ id: number; name: string }[]>([]);
  const [equipments, setEquipments] = useState<{ id: number; name: string; subareaId: number }[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<{ id: number; name: string }[]>([]);
  const [devices, setDevices] = useState<{ id: number; name: string; equipmentId: number }[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<{ id: number; name: string }[]>([]);
  const [sourceDataList, setSourceDataList] = useState<{ id: number; name: string }[]>([]);
  // Estados para el formulario
  const [formSubareas, setFormSubareas] = useState<{ id: number; name: string }[]>([]);
  const [formEquipments, setFormEquipments] = useState<{ id: number; name: string }[]>([]);
  const [formDevices, setFormDevices] = useState<{ id: number; name: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedSubareaId, setSelectedSubareaId] = useState<number | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [filterEnabled, setFilterEnabled] = useState<string>("all"); // "all", "true", "false"
  const [selectedSourceDataId, setSelectedSourceDataId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: "",
    subareaId: "",
    equipmentId: "",
    deviceId: "",
    sourceDataId: "",
    pyRun: "",
    enabled: true,
    tag: "",
    level: "",
    plannedId: "",
    config: "",
  });
  const { showSuccess, showError } = useToast();

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
    loadDevices();
  }, [selectedDepartmentId, selectedSubareaId, selectedEquipmentId]);

  useEffect(() => {
    if (!initialLoading) {
      loadSignals();
    }
  }, [selectedDepartmentId, selectedSubareaId, selectedEquipmentId, selectedDeviceId, debouncedSearchQuery, filterEnabled, selectedSourceDataId, initialLoading]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const [departmentsData, subareasData, equipmentsData, devicesData, sourceData] = await Promise.all([
        getAllDepartments(),
        getAllSubareas(),
        getAllEquipments(),
        getAllDevices(),
        getAllSourceData(),
      ]);
      setDepartments(departmentsData.map((d) => ({ id: d.id, name: d.name })));
      setSubareas(subareasData.map((s) => ({ id: s.id, name: s.name, departmentId: s.departmentId })));
      setEquipments(equipmentsData.map((e) => ({ id: e.id, name: e.name, subareaId: e.subareaId })));
      setDevices(devicesData.map((d) => ({ id: d.id, name: d.name, equipmentId: d.equipmentId })));
      setSourceDataList(sourceData.map((s) => ({ id: s.id, name: s.name })));
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

  const loadDevices = async () => {
    try {
      const data = await getDevices({
        departmentId: selectedDepartmentId || undefined,
        subareaId: selectedSubareaId || undefined,
        equipmentId: selectedEquipmentId || undefined,
      });
      setFilteredDevices(data.map((d) => ({ id: d.id, name: d.name })));
    } catch (error) {
      showError("Error al cargar dispositivos", error);
      setFilteredDevices([]);
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

  // Función para cargar dispositivos del formulario
  const loadFormDevices = useCallback(async (equipmentId: number) => {
    try {
      const data = await getDevicesByEquipment({ equipmentId });
      setFormDevices(data.map((d) => ({ id: d.id, name: d.name })));
    } catch (error) {
      showError("Error al cargar dispositivos para el formulario", error);
      setFormDevices([]);
    }
  }, [showError]);

  const loadSignals = useCallback(async () => {
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
      const wasEmpty = signals.length === 0;
      if (wasEmpty) {
        setLoading(true);
      }
      
      const enabled = filterEnabled === "all" ? undefined : filterEnabled === "true";
      const data = await getSignals({
        departmentId: selectedDepartmentId || undefined,
        subareaId: selectedSubareaId || undefined,
        equipmentId: selectedEquipmentId || undefined,
        deviceId: selectedDeviceId || undefined,
        name: debouncedSearchQuery || undefined,
        enabled,
        sourceDataId: selectedSourceDataId || undefined,
      });
      
      // Solo actualizar si el request no fue cancelado
      if (!abortController.signal.aborted) {
        // Actualizar datos de forma atómica para evitar flash
        setSignals(data);
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
        showError("Error al cargar señales", error);
        setSignals([]);
        setLoading(false);
      }
    }
  }, [selectedDepartmentId, selectedSubareaId, selectedEquipmentId, selectedDeviceId, debouncedSearchQuery, filterEnabled, selectedSourceDataId, showError, signals.length]);

  const handleOpenDialog = (signal?: Signal) => {
    if (signal) {
      setEditingSignal(signal);
      // Encontrar el dispositivo de la señal
      const signalDevice = devices.find(d => d.id === signal.deviceId);
      if (signalDevice) {
        // Encontrar el equipo del dispositivo
        const deviceEquipment = equipments.find(e => e.id === signalDevice.equipmentId);
        if (deviceEquipment) {
          // Encontrar la subárea del equipo
          const equipmentSubarea = subareas.find(s => s.id === deviceEquipment.subareaId);
          if (equipmentSubarea) {
            setFormData({
              name: signal.name || "",
              description: signal.description || "",
              deviceId: signal.deviceId?.toString() || "",
              equipmentId: deviceEquipment.id.toString(),
              subareaId: deviceEquipment.subareaId.toString(),
              departmentId: equipmentSubarea.departmentId.toString(),
              sourceDataId: signal.sourceDataId?.toString() || "",
              pyRun: signal.pyRun || "",
              enabled: signal.enabled ?? true,
              tag: signal.tag || "",
              level: signal.level?.toString() || "",
              plannedId: signal.plannedId?.toString() || "",
              config: signal.influxParameter 
                ? JSON.stringify(signal.influxParameter, null, 2) 
                : signal.config 
                ? JSON.stringify(signal.config, null, 2) 
                : "",
            });
            
            // Cargar la jerarquía completa
            loadFormSubareas(equipmentSubarea.departmentId);
            loadFormEquipments(deviceEquipment.subareaId);
            loadFormDevices(signalDevice.equipmentId);
          } else {
            setFormData({
              name: signal.name || "",
              description: signal.description || "",
              deviceId: signal.deviceId?.toString() || "",
              equipmentId: deviceEquipment.id.toString(),
              subareaId: "",
              departmentId: "",
              sourceDataId: signal.sourceDataId?.toString() || "",
              pyRun: signal.pyRun || "",
              enabled: signal.enabled ?? true,
              tag: signal.tag || "",
              level: signal.level?.toString() || "",
              plannedId: signal.plannedId?.toString() || "",
              config: signal.influxParameter 
                ? JSON.stringify(signal.influxParameter, null, 2) 
                : signal.config 
                ? JSON.stringify(signal.config, null, 2) 
                : "",
            });
          }
        } else {
          setFormData({
            name: signal.name || "",
            description: signal.description || "",
            deviceId: signal.deviceId?.toString() || "",
            equipmentId: "",
            subareaId: "",
            departmentId: "",
            sourceDataId: signal.sourceDataId?.toString() || "",
            pyRun: signal.pyRun || "",
            enabled: signal.enabled ?? true,
            tag: signal.tag || "",
            level: signal.level?.toString() || "",
            plannedId: signal.plannedId?.toString() || "",
            config: signal.config ? JSON.stringify(signal.config, null, 2) : "",
          });
        }
      } else {
        setFormData({
          name: signal.name || "",
          description: signal.description || "",
          deviceId: signal.deviceId?.toString() || "",
          equipmentId: "",
          subareaId: "",
          departmentId: "",
          sourceDataId: signal.sourceDataId?.toString() || "",
          pyRun: signal.pyRun || "",
          enabled: signal.enabled ?? true,
          tag: signal.tag || "",
          level: signal.level?.toString() || "",
          plannedId: signal.plannedId?.toString() || "",
          config: signal.config ? JSON.stringify(signal.config, null, 2) : "",
        });
      }
    } else {
      setEditingSignal(null);
      setFormData({
        name: "",
        description: "",
        departmentId: "",
        subareaId: "",
        equipmentId: "",
        deviceId: "",
        sourceDataId: "",
        pyRun: "",
        enabled: true,
        tag: "",
        level: "",
        plannedId: "",
        config: "",
      });
      setFormSubareas([]);
      setFormEquipments([]);
      setFormDevices([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSignal(null);
    setFormData({
      name: "",
      description: "",
      departmentId: "",
      subareaId: "",
      equipmentId: "",
      deviceId: "",
      sourceDataId: "",
      pyRun: "",
      enabled: true,
      tag: "",
      level: "",
      plannedId: "",
      config: "",
    });
    setFormSubareas([]);
    setFormEquipments([]);
    setFormDevices([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError("Error", "El nombre de la señal es requerido");
      return;
    }

    if (!formData.departmentId || formData.departmentId === "none") {
      showError("Error", "Debes seleccionar un departamento");
      return;
    }

    if (!formData.subareaId || formData.subareaId === "none") {
      showError("Error", "Debes seleccionar una subárea");
      return;
    }

    if (!formData.equipmentId || formData.equipmentId === "none") {
      showError("Error", "Debes seleccionar un equipo");
      return;
    }

    if (!formData.deviceId || formData.deviceId === "none") {
      showError("Error", "Debes seleccionar un dispositivo");
      return;
    }

    try {
      // Parsear config si existe
      let parsedConfig: any = undefined;
      if (formData.config && formData.config.trim() !== "") {
        try {
          parsedConfig = JSON.parse(formData.config);
        } catch (parseError) {
          showError("Error", "El campo Config debe ser un JSON válido");
          return;
        }
      }

      const data: CreateSignalDto | UpdateSignalDto = {
        name: trimmedName,
        ...(formData.description && { description: formData.description }),
        ...(formData.deviceId && { deviceId: parseInt(formData.deviceId, 10) }),
        // sourceDataId: El backend lo convierte automáticamente a influxId
        ...(formData.sourceDataId && { sourceDataId: parseInt(formData.sourceDataId, 10) }),
        ...(formData.pyRun && { pyRun: formData.pyRun }),
        enabled: formData.enabled,
        ...(formData.tag && { tag: formData.tag }),
        ...(formData.level && { level: parseInt(formData.level, 10) }),
        ...(formData.plannedId && { plannedId: parseInt(formData.plannedId, 10) }),
        // config: El backend lo convierte automáticamente a influxParameter
        // Enviamos ambos para compatibilidad, pero el backend usa config como fuente principal
        ...(parsedConfig !== undefined && { 
          config: parsedConfig,
          influxParameter: parsedConfig // También enviar como influxParameter para compatibilidad
        }),
      };

      console.log("📤 [SignalManager] Datos a enviar:", JSON.stringify(data, null, 2));
      console.log("📤 [SignalManager] URL:", editingSignal ? `PUT /signals/${editingSignal.id}` : `POST /signals`);

      if (editingSignal) {
        console.log("📤 [SignalManager] Actualizando señal:", editingSignal.id);
        await updateSignal(editingSignal.id, data);
        showSuccess("Señal actualizada", "La señal se ha actualizado correctamente");
      } else {
        console.log("📤 [SignalManager] Creando nueva señal");
        await createSignal(data as CreateSignalDto);
        showSuccess("Señal creada", "La señal se ha creado correctamente");
      }

      handleCloseDialog();
      if (!initialLoading) {
        loadSignals();
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta señal?")) {
      return;
    }

    try {
      await deleteSignal(id);
      showSuccess("Señal eliminada", "La señal se ha eliminado correctamente");
      if (!initialLoading) {
        loadSignals();
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar señal", error);
    }
  };


  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando señales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <label className="text-sm font-medium mb-2 block">Dispositivo</label>
            <Select
              value={selectedDeviceId?.toString() || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedDeviceId(null);
                } else {
                  setSelectedDeviceId(parseInt(value, 10));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los dispositivos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los dispositivos</SelectItem>
                {filteredDevices.map((device) => (
                  <SelectItem key={device.id} value={device.id.toString()}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Estado</label>
            <Select
              value={filterEnabled}
              onValueChange={setFilterEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Habilitadas</SelectItem>
                <SelectItem value="false">Deshabilitadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Fuente de Datos</label>
            <Select
              value={selectedSourceDataId?.toString() || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedSourceDataId(null);
                } else {
                  setSelectedSourceDataId(parseInt(value, 10));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las fuentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fuentes</SelectItem>
                {sourceDataList.map((source) => (
                  <SelectItem key={source.id} value={source.id.toString()}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Buscar por nombre</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar señales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            "Cargando..."
          ) : signals.length > 0 ? (
            `Mostrando ${signals.length} señal(es)${debouncedSearchQuery ? ` (filtrado por: "${debouncedSearchQuery}")` : ""}`
          ) : (
            "No se encontraron señales con los filtros seleccionados"
          )}
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Señal
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead>Fuente de Datos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron señales con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              signals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell className="font-medium">{signal.name}</TableCell>
                  <TableCell>
                    {signal.device?.name || (signal.deviceId ? `ID: ${signal.deviceId}` : "-")}
                  </TableCell>
                  <TableCell>
                    {signal.influx?.name || signal.sourceData?.name || (signal.influxId || signal.sourceDataId ? `ID: ${signal.influxId || signal.sourceDataId}` : "-")}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      signal.enabled ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}>
                      {signal.enabled ? "Habilitada" : "Deshabilitada"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(signal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(signal.id)}
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
              {editingSignal ? "Editar Señal" : "Nueva Señal"}
            </DialogTitle>
            <DialogDescription>
              {editingSignal
                ? "Modifica la información de la señal"
                : "Completa la información para crear una nueva señal"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Temperatura Tanque 1"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la señal"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Departamento *</label>
                <Select
                  value={formData.departmentId && formData.departmentId !== "" ? formData.departmentId : "none"}
                  onValueChange={async (value) => {
                    setFormData({ ...formData, departmentId: value === "none" ? "" : value, subareaId: "", equipmentId: "", deviceId: "" });
                    if (value && value !== "none") {
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
                    <SelectItem value="none">Ninguno</SelectItem>
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
                  value={formData.subareaId && formData.subareaId !== "" ? formData.subareaId : "none"}
                  onValueChange={async (value) => {
                    setFormData({ ...formData, subareaId: value === "none" ? "" : value, equipmentId: "", deviceId: "" });
                    if (value && value !== "none") {
                      await loadFormEquipments(parseInt(value, 10));
                    } else {
                      setFormEquipments([]);
                    }
                  }}
                  required
                  disabled={!formData.departmentId || formData.departmentId === "" || formData.departmentId === "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.departmentId || formData.departmentId === "" || formData.departmentId === "none"
                        ? "Primero selecciona un departamento" 
                        : formSubareas.length === 0
                        ? "Cargando subáreas..."
                        : "Selecciona una subárea"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {formSubareas.map((subarea) => (
                      <SelectItem key={subarea.id} value={subarea.id.toString()}>
                        {subarea.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Equipo *</label>
                <Select
                  value={formData.equipmentId && formData.equipmentId !== "" ? formData.equipmentId : "none"}
                  onValueChange={async (value) => {
                    setFormData({ ...formData, equipmentId: value === "none" ? "" : value, deviceId: "" });
                    if (value && value !== "none") {
                      await loadFormDevices(parseInt(value, 10));
                    } else {
                      setFormDevices([]);
                    }
                  }}
                  required
                  disabled={!formData.subareaId || formData.subareaId === "" || formData.subareaId === "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.subareaId || formData.subareaId === "none"
                        ? "Primero selecciona una subárea" 
                        : formEquipments.length === 0
                        ? "Cargando equipos..."
                        : "Selecciona un equipo"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {formEquipments.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id.toString()}>
                        {equipment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Dispositivo *</label>
                <Select
                  value={formData.deviceId && formData.deviceId !== "" ? formData.deviceId : "none"}
                  onValueChange={(value) => setFormData({ ...formData, deviceId: value === "none" ? "" : value })}
                  required
                  disabled={!formData.equipmentId || formData.equipmentId === "" || formData.equipmentId === "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.equipmentId || formData.equipmentId === "" || formData.equipmentId === "none"
                        ? "Primero selecciona un equipo" 
                        : formDevices.length === 0
                        ? "Cargando dispositivos..."
                        : "Selecciona un dispositivo"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {formDevices.map((device) => (
                      <SelectItem key={device.id} value={device.id.toString()}>
                        {device.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="text-sm font-medium mb-2 block">Fuente de Datos</label>
                <Select
                  value={formData.sourceDataId && formData.sourceDataId !== "" ? formData.sourceDataId : "none"}
                  onValueChange={(value) => setFormData({ ...formData, sourceDataId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una fuente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {sourceDataList.map((source) => (
                      <SelectItem key={source.id} value={source.id.toString()}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Python Run</label>
                <Input
                  value={formData.pyRun}
                  onChange={(e) => setFormData({ ...formData, pyRun: e.target.value })}
                  placeholder="Ej: script.py"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tag</label>
                <Input
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Ej: tag1"
                />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nivel</label>
                <Input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Ej: 1"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Planned ID</label>
                <Input
                  type="number"
                  value={formData.plannedId}
                  onChange={(e) => setFormData({ ...formData, plannedId: e.target.value })}
                  placeholder="Ej: 1"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Habilitada</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Config (JSON)</label>
              <Textarea
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                placeholder='Ej: {"threshold": 100, "unit": "Celsius", "alerts": {"min": 0, "max": 200}}'
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa un objeto JSON válido. Este campo es opcional.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSignal ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

