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
import type { CompatibilityLevel } from "@/lib/types/chemical-substances";
import {
  getCompatibilityLevels,
  createCompatibilityLevel,
  updateCompatibilityLevel,
  deleteCompatibilityLevel,
} from "@/lib/services/chemical-substances.service";

export function CompatibilityLevelsManager() {
  const [levels, setLevels] = useState<CompatibilityLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CompatibilityLevel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    code: "COMPATIBLE" as "COMPATIBLE" | "INCOMPATIBLE" | "CONDITIONAL",
    color: "",
    description: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const data = await getCompatibilityLevels();
      setLevels(data);
    } catch (error) {
      showError("Error al cargar niveles de compatibilidad", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (level?: CompatibilityLevel) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        code: level.code,
        color: level.color,
        description: level.description,
      });
    } else {
      setEditingLevel(null);
      setFormData({
        code: "COMPATIBLE",
        color: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLevel(null);
    setFormData({
      code: "COMPATIBLE",
      color: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLevel) {
        await updateCompatibilityLevel(editingLevel.id, formData);
        showSuccess(
          "Nivel de compatibilidad actualizado",
          "El nivel de compatibilidad se ha actualizado correctamente."
        );
      } else {
        await createCompatibilityLevel(formData);
        showSuccess(
          "Nivel de compatibilidad creado",
          "El nivel de compatibilidad se ha creado correctamente."
        );
      }
      handleCloseDialog();
      loadLevels();
    } catch (error) {
      showError("Error al guardar nivel de compatibilidad", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este nivel de compatibilidad?")) {
      return;
    }
    try {
      await deleteCompatibilityLevel(id);
      showSuccess(
        "Nivel de compatibilidad eliminado",
        "El nivel de compatibilidad se ha eliminado correctamente."
      );
      loadLevels();
    } catch (error) {
      showError("Error al eliminar nivel de compatibilidad", error);
    }
  };

  const filteredLevels = useMemo(() => {
    if (!searchQuery.trim()) {
      return levels;
    }
    const query = searchQuery.toLowerCase().trim();
    return levels.filter(
      (level) =>
        level.code.toLowerCase().includes(query) ||
        level.description.toLowerCase().includes(query)
    );
  }, [levels, searchQuery]);

  const getColorPreview = (color: string) => {
    return (
      <div
        className="w-6 h-6 rounded border border-gray-300"
        style={{ backgroundColor: color }}
      />
    );
  };

  if (loading) {
    return <div className="text-center py-8">Cargando niveles de compatibilidad...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Niveles de Compatibilidad</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nivel
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <div className="text-sm text-gray-500">
            {filteredLevels.length} de {levels.length} niveles
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLevels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {searchQuery
                    ? "No se encontraron niveles con esos criterios"
                    : "No hay niveles de compatibilidad registrados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLevels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell className="font-medium">{level.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getColorPreview(level.color)}
                      <span className="text-sm text-gray-500">{level.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>{level.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(level)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(level.id)}
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
              {editingLevel ? "Editar Nivel de Compatibilidad" : "Nuevo Nivel de Compatibilidad"}
            </DialogTitle>
            <DialogDescription>
              {editingLevel
                ? "Modifique la información del nivel de compatibilidad"
                : "Ingrese la información del nuevo nivel de compatibilidad"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="text-sm font-medium mb-2 block">
                Código *
              </label>
              <Select
                value={formData.code}
                onValueChange={(value) =>
                  setFormData({ ...formData, code: value as typeof formData.code })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un código" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPATIBLE">COMPATIBLE</SelectItem>
                  <SelectItem value="INCOMPATIBLE">INCOMPATIBLE</SelectItem>
                  <SelectItem value="CONDITIONAL">CONDITIONAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="color" className="text-sm font-medium mb-2 block">
                Color *
              </label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                Descripción *
              </label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Ej: Las sustancias son compatibles y pueden mezclarse de forma segura"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingLevel ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

