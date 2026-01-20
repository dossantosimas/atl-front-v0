"use client";

import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast";
import { Plus, Pencil, Trash2, Search, Upload, X } from "lucide-react";

// Helper function to normalize image URL
function getPictogramImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // Si ya es una URL completa de API, blob o data, retornarla tal cual
  if (imageUrl.startsWith('/api/') || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Si tiene un path antiguo como /security/pic/..., extraer solo el filename
  if (imageUrl.includes('/')) {
    const filename = imageUrl.split('/').pop() || imageUrl;
    return `/api/pictogram/image/${filename}`;
  }
  
  // Si es solo el filename, construir la URL completa
  return `/api/pictogram/image/${imageUrl}`;
}
import type { Pictogram, CreatePictogramDto } from "@/lib/types/chemical-substances";
import {
  getPictograms,
  createPictogram,
  updatePictogram,
  deletePictogram,
} from "@/lib/services/chemical-substances.service";

export function PictogramsManager() {
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPictogram, setEditingPictogram] = useState<Pictogram | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadPictograms();
  }, []);

  useEffect(() => {
    // Log cuando se cargan los pictogramas para debug
    if (pictograms.length > 0) {
      console.log("📋 Pictogramas cargados:", pictograms.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        constructedUrl: p.imageUrl ? getPictogramImageUrl(p.imageUrl) : null
      })));
    }
  }, [pictograms]);

  useEffect(() => {
    if (pictograms.length > 0) {
      console.log("📋 Pictogramas cargados:", pictograms.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl
      })));
    }
  }, [pictograms]);

  const loadPictograms = async () => {
    try {
      setLoading(true);
      const data = await getPictograms();
      setPictograms(data);
    } catch (error) {
      showError("Error al cargar pictogramas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pictogram?: Pictogram) => {
    if (pictogram) {
      setEditingPictogram(pictogram);
      setFormData({
        name: pictogram.name,
        description: pictogram.description || "",
        imageUrl: pictogram.imageUrl || "",
      });
      setImagePreview(pictogram.imageUrl || null);
      setImageFile(null);
    } else {
      setEditingPictogram(null);
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPictogram(null);
    setFormData({ name: "", description: "", imageUrl: "" });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        showError("Error", "Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Error", "La imagen no debe superar los 5MB");
        return;
      }

      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      console.log("📤 Iniciando subida de imagen:", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      });

      // Crear FormData
      const formData = new FormData();
      formData.append("file", imageFile);

      // Subir imagen a /api/upload/pictogram
      const response = await fetch("/api/upload/pictogram", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        console.error("❌ Error en respuesta de upload:", errorData);
        throw new Error(errorData.error || "Error al subir la imagen");
      }

      const data = await response.json();
      console.log("✅ Imagen subida exitosamente:", {
        filename: data.filename,
        message: data.message
      });
      
      return data.filename; // El nombre del archivo guardado
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      showError("Error", "No se pudo subir la imagen");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = formData.imageUrl;

      // Si hay un nuevo archivo, subirlo
      if (imageFile) {
        const filename = await handleImageUpload();
        if (filename) {
          // Guardar solo el filename, el API devolverá la ruta completa
          imageUrl = filename;
          console.log("📝 Filename de imagen a guardar:", imageUrl);
        } else {
          return; // Error al subir, el handleImageUpload ya mostró el error
        }
      }

      const data: CreatePictogramDto = {
        name: formData.name,
        description: formData.description || undefined,
        imageUrl: imageUrl || undefined,
      };

      console.log("💾 Datos a enviar al API:", {
        ...data,
        imageUrl: data.imageUrl
      });

      if (editingPictogram) {
        await updatePictogram(editingPictogram.id, data);
        showSuccess("Pictograma actualizado", "El pictograma se ha actualizado correctamente");
      } else {
        await createPictogram(data);
        showSuccess("Pictograma creado", "El pictograma se ha creado correctamente");
      }

      handleCloseDialog();
      loadPictograms();
    } catch (error) {
      showError("Error", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este pictograma?")) {
      return;
    }

    try {
      await deletePictogram(id);
      showSuccess("Pictograma eliminado", "El pictograma se ha eliminado correctamente");
      loadPictograms();
    } catch (error) {
      showError("Error al eliminar pictograma", error);
    }
  };

  const filteredPictograms = pictograms.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando pictogramas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar pictogramas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pictograma
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPictograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No se encontraron pictogramas
                </TableCell>
              </TableRow>
            ) : (
              filteredPictograms.map((pictogram) => (
                <TableRow key={pictogram.id}>
                  <TableCell>
                    {pictogram.imageUrl ? (
                      <div className="relative w-12 h-12 rounded border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                        <img
                          src={getPictogramImageUrl(pictogram.imageUrl) || ''}
                          alt={pictogram.name}
                          className="w-full h-full object-contain p-1"
                          onLoad={() => {
                            console.log("✅ Imagen cargada exitosamente:", {
                              originalUrl: pictogram.imageUrl,
                              finalSrc: getPictogramImageUrl(pictogram.imageUrl),
                              name: pictogram.name,
                              id: pictogram.id
                            });
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const finalUrl = getPictogramImageUrl(pictogram.imageUrl);
                            // Solo log en desarrollo
                            if (process.env.NODE_ENV === 'development') {
                              console.warn("⚠️ PictogramManager - No se pudo cargar imagen:", {
                                originalUrl: pictogram.imageUrl,
                                finalUrl: finalUrl,
                                attemptedSrc: target.src,
                                name: pictogram.name,
                                id: pictogram.id
                              });
                            }
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-full flex items-center justify-center text-xs text-gray-400 placeholder';
                              placeholder.textContent = 'Error';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{pictogram.name}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {pictogram.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(pictogram)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pictogram.id)}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPictogram ? "Editar Pictograma" : "Nuevo Pictograma"}
            </DialogTitle>
            <DialogDescription>
              {editingPictogram
                ? "Modifica la información del pictograma"
                : "Completa la información para crear un nuevo pictograma"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Corrosivo"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del pictograma..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Imagen</label>
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                    <img
                      src={getPictogramImageUrl(imagePreview) || ''}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error("❌ Error al cargar preview:", {
                          originalPreview: imagePreview,
                          finalUrl: getPictogramImageUrl(imagePreview),
                          attemptedSrc: target.src
                        });
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-gray-400">Error</div>';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-white dark:bg-gray-900"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {imagePreview ? "Cambiar Imagen" : "Seleccionar Imagen"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: PNG, JPG, SVG. Máximo 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingPictogram ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

