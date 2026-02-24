"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/toast";
import type { MicroProgram } from "@/lib/types/micro-programs";
import {
  createMicroProgram,
  deleteMicroProgram,
  getMicroPrograms,
  updateMicroProgram,
} from "@/lib/services/micro-programs.service";

interface ProgramsManagerProps {
  onRefresh?: () => void;
}

export function ProgramsManager({ onRefresh }: ProgramsManagerProps) {
  const [programs, setPrograms] = useState<MicroProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await getMicroPrograms();
      setPrograms(data);
    } catch (error) {
      showError("Error al cargar programas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setName("");
  };

  const handleOpenEditDialog = (program: MicroProgram) => {
    setEditingProgramId(program.id);
    setEditName(program.name);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingProgramId(null);
    setEditName("");
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createMicroProgram({ name: name.trim() });
      showSuccess("Programa creado", "El programa se ha creado correctamente.");
      handleCloseDialog();
      await loadPrograms();
      onRefresh?.();
    } catch (error) {
      showError("Error al crear programa", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este programa?")) {
      return;
    }

    try {
      await deleteMicroProgram(id);
      showSuccess("Programa eliminado", "El programa se ha eliminado correctamente.");
      await loadPrograms();
      onRefresh?.();
    } catch (error) {
      showError("Error al eliminar programa", error);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProgramId) return;

    try {
      await updateMicroProgram(editingProgramId, { name: editName.trim() });
      showSuccess("Programa actualizado", "El programa se ha actualizado correctamente.");
      handleCloseEditDialog();
      await loadPrograms();
      onRefresh?.();
    } catch (error) {
      showError("Error al actualizar programa", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando programas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Programas</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Programa
        </Button>
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
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                  No hay programas registrados
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditDialog(program)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
            <DialogTitle>Nuevo Programa</DialogTitle>
            <DialogDescription>
              Ingrese el nombre del programa para asociarlo con los elementos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="program-name" className="text-sm font-medium mb-2 block">
                Nombre *
              </label>
              <Input
                id="program-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Ej: PTS"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Crear
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Programa</DialogTitle>
            <DialogDescription>
              Modifique el nombre del programa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="edit-program-name" className="text-sm font-medium mb-2 block">
                Nombre *
              </label>
              <Input
                id="edit-program-name"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
                placeholder="Ej: PTS"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!editName.trim()}>
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
