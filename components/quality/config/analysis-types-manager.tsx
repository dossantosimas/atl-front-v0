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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { AnalysisType } from "@/lib/types/micro-analysis";
import {
  getAnalysisTypes,
  createAnalysisType,
  updateAnalysisType,
  deleteAnalysisType,
} from "@/lib/services/analysis-types.service";

interface AnalysisTypesManagerProps {
  onRefresh?: () => void;
}

export function AnalysisTypesManager({ onRefresh }: AnalysisTypesManagerProps) {
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AnalysisType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    options: "string" as "dual" | "boolean" | "otro" | "numeric" | "string",
    condition: null as "=" | ">" | ">=" | "<" | "<=" | "!=" | null,
    threshold: "",
    code: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadAnalysisTypes();
  }, []);

  const loadAnalysisTypes = async () => {
    try {
      setLoading(true);
      const types = await getAnalysisTypes();
      console.log("[AnalysisTypesManager] Types loaded:", types.length);
      setAnalysisTypes(types);
    } catch (error: any) {
      console.error("[AnalysisTypesManager] Error loading types:", error);
      const errorMessage = error?.response?.status === 404
        ? "El endpoint de tipos de análisis no existe. Verifique la configuración del backend."
        : error?.message || "Error desconocido";
      showError("Error al cargar tipos de análisis", new Error(errorMessage));
      setAnalysisTypes([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type?: AnalysisType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        options: type.options,
        condition: type.condition,
        threshold: type.threshold || "",
        code: type.code,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        options: "string",
        condition: null,
        threshold: "",
        code: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingType(null);
    setFormData({
      name: "",
      options: "string",
      condition: null,
      threshold: "",
      code: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        threshold: formData.threshold || null,
      };
      if (editingType) {
        await updateAnalysisType(editingType.id, data);
        showSuccess("Tipo de análisis actualizado", "El tipo de análisis se ha actualizado correctamente.");
      } else {
        await createAnalysisType(data);
        showSuccess("Tipo de análisis creado", "El tipo de análisis se ha creado correctamente.");
      }
      handleCloseDialog();
      loadAnalysisTypes();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al guardar tipo de análisis", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este tipo de análisis?")) {
      return;
    }
    try {
      await deleteAnalysisType(id);
      showSuccess("Tipo de análisis eliminado", "El tipo de análisis se ha eliminado correctamente.");
      loadAnalysisTypes();
    } catch (error) {
      showError("Error al eliminar tipo de análisis", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando tipos de análisis...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tipos de Análisis</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tipo de Análisis
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Opciones</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead>Umbral</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysisTypes.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-gray-500">No hay tipos de análisis registrados</p>
                    <p className="text-xs text-gray-400">
                      Si esperabas ver datos, verifica que el endpoint /micro-analysis-types esté disponible en el backend
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              analysisTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.options}</TableCell>
                  <TableCell>{type.condition || "-"}</TableCell>
                  <TableCell>{type.threshold || "-"}</TableCell>
                  <TableCell>{type.code}</TableCell>
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
              {editingType ? "Editar Tipo de Análisis" : "Nuevo Tipo de Análisis"}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? "Modifique los datos del tipo de análisis"
                : "Complete los datos para crear un nuevo tipo de análisis"}
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
                placeholder="Ej: Coliformes Totales"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="options" className="text-sm font-medium mb-2 block">
                  Opciones *
                </label>
                <Select
                  value={formData.options}
                  onValueChange={(value: any) => setFormData({ ...formData, options: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dual">Dual</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="numeric">Numeric</SelectItem>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="condition" className="text-sm font-medium mb-2 block">
                  Condición
                </label>
                <Select
                  value={formData.condition || "none"}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      condition: value === "none" ? null : (value as any),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin condición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin condición</SelectItem>
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value=">">&gt;</SelectItem>
                    <SelectItem value=">=">&gt;=</SelectItem>
                    <SelectItem value="<">&lt;</SelectItem>
                    <SelectItem value="<=">&lt;=</SelectItem>
                    <SelectItem value="!=">!=</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="threshold" className="text-sm font-medium mb-2 block">
                  Umbral
                </label>
                <Input
                  id="threshold"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  placeholder="Ej: 100"
                />
              </div>
              <div>
                <label htmlFor="code" className="text-sm font-medium mb-2 block">
                  Código *
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="Ej: CT001"
                />
              </div>
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

