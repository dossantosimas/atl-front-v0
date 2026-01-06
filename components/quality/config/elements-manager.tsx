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
import type { MicroElement } from "@/lib/types/micro-elements";
import {
  getMicroElements,
  createMicroElement,
  updateMicroElement,
  deleteMicroElement,
} from "@/lib/services/micro-elements.service";

interface ElementsManagerProps {
  onRefresh?: () => void;
}

export function ElementsManager({ onRefresh }: ElementsManagerProps) {
  const [elements, setElements] = useState<MicroElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<MicroElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadElements();
  }, []);

  const loadElements = async () => {
    try {
      setLoading(true);
      const data = await getMicroElements();
      setElements(data);
    } catch (error) {
      showError("Error al cargar elementos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (element?: MicroElement) => {
    if (element) {
      setEditingElement(element);
      setFormData({
        name: element.name,
      });
    } else {
      setEditingElement(null);
      setFormData({
        name: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingElement(null);
    setFormData({
      name: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingElement) {
        await updateMicroElement(editingElement.id, formData);
        showSuccess("Elemento actualizado", "El elemento se ha actualizado correctamente.");
      } else {
        await createMicroElement(formData);
        showSuccess("Elemento creado", "El elemento se ha creado correctamente.");
      }
      handleCloseDialog();
      loadElements();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al guardar elemento", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar este elemento?")) {
      return;
    }
    try {
      await deleteMicroElement(id);
      showSuccess("Elemento eliminado", "El elemento se ha eliminado correctamente.");
      loadElements();
    } catch (error) {
      showError("Error al eliminar elemento", error);
    }
  };

  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) {
      return elements;
    }
    const query = searchQuery.toLowerCase().trim();
    return elements.filter((element) =>
      element.name.toLowerCase().includes(query)
    );
  }, [elements, searchQuery]);

  if (loading) {
    return <div className="text-center py-8">Cargando elementos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Elementos</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Elemento
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <div className="text-sm text-gray-500">
            {filteredElements.length} de {elements.length} elementos
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredElements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                  {searchQuery ? "No se encontraron elementos con ese nombre" : "No hay elementos registrados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredElements.map((element) => (
                  <TableRow key={element.id}>
                    <TableCell className="font-medium">{element.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(element)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(element.id)}
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
              {editingElement ? "Editar Elemento" : "Nuevo Elemento"}
            </DialogTitle>
            <DialogDescription>
              {editingElement
                ? "Modifique el nombre del elemento"
                : "Ingrese el nombre del nuevo elemento"}
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
                placeholder="Ej: Agua de Proceso"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingElement ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

