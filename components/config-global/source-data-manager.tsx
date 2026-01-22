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
import type { SourceData } from "@/lib/types/source-data";
import {
  getAllSourceData,
  createSourceData,
  updateSourceData,
  deleteSourceData,
  type CreateSourceDataDto,
  type UpdateSourceDataDto,
} from "@/lib/services/source-data.service";

interface SourceDataManagerProps {
  onRefresh?: () => void;
}

export function SourceDataManager({ onRefresh }: SourceDataManagerProps) {
  const [sourceDataList, setSourceDataList] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSourceData, setEditingSourceData] = useState<SourceData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    user: "",
    token: "",
    bucket: "",
    nameInfo: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadSourceData();
  }, []);

  const loadSourceData = async () => {
    try {
      setLoading(true);
      const data = await getAllSourceData();
      setSourceDataList(data);
    } catch (error) {
      showError("Error al cargar fuentes de datos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sourceData?: SourceData) => {
    if (sourceData) {
      setEditingSourceData(sourceData);
      setFormData({
        name: sourceData.name || "",
        url: sourceData.url || "",
        user: sourceData.user || "",
        token: sourceData.token || "",
        bucket: sourceData.bucket || "",
        nameInfo: sourceData.nameInfo || "",
      });
    } else {
      setEditingSourceData(null);
      setFormData({
        name: "",
        url: "",
        user: "",
        token: "",
        bucket: "",
        nameInfo: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSourceData(null);
    setFormData({
      name: "",
      url: "",
      user: "",
      token: "",
      bucket: "",
      nameInfo: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError("Error", "El nombre de la fuente de datos es requerido");
      return;
    }

    try {
      if (editingSourceData) {
        const updateData: UpdateSourceDataDto = {
          name: trimmedName,
          ...(formData.url && { url: formData.url }),
          ...(formData.user && { user: formData.user }),
          ...(formData.token && { token: formData.token }),
          ...(formData.bucket && { bucket: formData.bucket }),
          ...(formData.nameInfo && { nameInfo: formData.nameInfo }),
        };
        await updateSourceData(editingSourceData.id, updateData);
        showSuccess("Fuente de datos actualizada", "La fuente de datos se ha actualizado correctamente");
      } else {
        const createData: CreateSourceDataDto = {
          name: trimmedName,
          ...(formData.url && { url: formData.url }),
          ...(formData.user && { user: formData.user }),
          ...(formData.token && { token: formData.token }),
          ...(formData.bucket && { bucket: formData.bucket }),
          ...(formData.nameInfo && { nameInfo: formData.nameInfo }),
        };
        await createSourceData(createData);
        showSuccess("Fuente de datos creada", "La fuente de datos se ha creado correctamente");
      }

      handleCloseDialog();
      loadSourceData();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta fuente de datos?")) {
      return;
    }

    try {
      await deleteSourceData(id);
      showSuccess("Fuente de datos eliminada", "La fuente de datos se ha eliminado correctamente");
      loadSourceData();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar fuente de datos", error);
    }
  };

  const filteredSourceData = useMemo(() => {
    return sourceDataList.filter((source) =>
      source.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sourceDataList, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando fuentes de datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar fuentes de datos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Fuente de Datos
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Bucket</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSourceData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron fuentes de datos
                </TableCell>
              </TableRow>
            ) : (
              filteredSourceData.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {source.url || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {source.user || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {source.bucket || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(source)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(source.id)}
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
              {editingSourceData ? "Editar Fuente de Datos" : "Nueva Fuente de Datos"}
            </DialogTitle>
            <DialogDescription>
              {editingSourceData
                ? "Modifica la información de la fuente de datos"
                : "Completa la información para crear una nueva fuente de datos"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: InfluxDB Production"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">URL</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="Ej: http://influxdb.example.com:8086"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Usuario</label>
                <Input
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  placeholder="Ej: admin"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Token</label>
                <Input
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder="Token de autenticación"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bucket</label>
                <Input
                  value={formData.bucket}
                  onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                  placeholder="Ej: production-bucket"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Información Adicional</label>
                <Input
                  value={formData.nameInfo}
                  onChange={(e) => setFormData({ ...formData, nameInfo: e.target.value })}
                  placeholder="Información adicional"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSourceData ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

