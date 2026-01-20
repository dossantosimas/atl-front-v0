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
import { Plus, Pencil, Trash2, Search, ImageIcon } from "lucide-react";
import type { ChemicalSubstance } from "@/lib/types/chemical-substances";
import { AssignPictogramsModal } from "./assign-pictograms-modal";
import { PictogramIndicator } from "./pictogram-indicator";
import {
  getChemicalSubstances,
  createChemicalSubstance,
  updateChemicalSubstance,
  deleteChemicalSubstance,
} from "@/lib/services/chemical-substances.service";
import { ChemicalGroupsCombobox } from "./chemical-groups-combobox";

interface ChemicalSubstancesManagerProps {
  onRefresh?: () => void;
}

export function ChemicalSubstancesManager({ onRefresh }: ChemicalSubstancesManagerProps) {
  const [substances, setSubstances] = useState<ChemicalSubstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPictogramsDialogOpen, setIsPictogramsDialogOpen] = useState(false);
  const [editingSubstance, setEditingSubstance] = useState<ChemicalSubstance | null>(null);
  const [selectedSubstanceForPictograms, setSelectedSubstanceForPictograms] = useState<ChemicalSubstance | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    casNumber: "",
    chemicalGroupId: "",
    physicalState: "liquid" as "liquid" | "solid" | "gas" | "powder",
    phMin: "",
    phMax: "",
    ghsClass: "",
    nfpaHealth: 0,
    nfpaFlammability: 0,
    nfpaReactivity: 0,
    isActive: true,
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadSubstances();
  }, []);

  const loadSubstances = async () => {
    try {
      setLoading(true);
      const data = await getChemicalSubstances();
      setSubstances(data);
    } catch (error) {
      showError("Error al cargar sustancias químicas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPictogramsDialog = (substance: ChemicalSubstance) => {
    setSelectedSubstanceForPictograms(substance);
    setIsPictogramsDialogOpen(true);
  };

  const handleClosePictogramsDialog = () => {
    setIsPictogramsDialogOpen(false);
    setSelectedSubstanceForPictograms(null);
  };

  const handlePictogramsSuccess = () => {
    loadSubstances();
    if (onRefresh) onRefresh();
  };

  const handleOpenDialog = (substance?: ChemicalSubstance) => {
    if (substance) {
      setEditingSubstance(substance);
      setFormData({
        name: substance.name,
        casNumber: substance.casNumber,
        chemicalGroupId: substance.chemicalGroupId,
        physicalState: substance.physicalState,
        phMin: substance.phMin?.toString() || "",
        phMax: substance.phMax?.toString() || "",
        ghsClass: substance.ghsClass,
        nfpaHealth: substance.nfpaHealth,
        nfpaFlammability: substance.nfpaFlammability,
        nfpaReactivity: substance.nfpaReactivity,
        isActive: substance.isActive,
      });
    } else {
      setEditingSubstance(null);
      setFormData({
        name: "",
        casNumber: "",
        chemicalGroupId: "",
        physicalState: "liquid",
        phMin: "",
        phMax: "",
        ghsClass: "",
        nfpaHealth: 0,
        nfpaFlammability: 0,
        nfpaReactivity: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubstance(null);
    setFormData({
      name: "",
      casNumber: "",
      chemicalGroupId: "",
      physicalState: "liquid",
      phMin: "",
      phMax: "",
      ghsClass: "",
      nfpaHealth: 0,
      nfpaFlammability: 0,
      nfpaReactivity: 0,
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        phMin: formData.phMin ? parseFloat(formData.phMin) : undefined,
        phMax: formData.phMax ? parseFloat(formData.phMax) : undefined,
      };
      if (editingSubstance) {
        await updateChemicalSubstance(editingSubstance.id, submitData);
        showSuccess("Sustancia química actualizada", "La sustancia química se ha actualizado correctamente.");
      } else {
        await createChemicalSubstance(submitData as any);
        showSuccess("Sustancia química creada", "La sustancia química se ha creado correctamente.");
      }
      handleCloseDialog();
      loadSubstances();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al guardar sustancia química", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta sustancia química?")) {
      return;
    }
    try {
      await deleteChemicalSubstance(id);
      showSuccess("Sustancia química eliminada", "La sustancia química se ha eliminado correctamente.");
      loadSubstances();
      if (onRefresh) onRefresh();
    } catch (error) {
      showError("Error al eliminar sustancia química", error);
    }
  };

  const filteredSubstances = useMemo(() => {
    if (!searchQuery.trim()) {
      return substances;
    }
    const query = searchQuery.toLowerCase().trim();
    return substances.filter(
      (substance) =>
        substance.name.toLowerCase().includes(query) ||
        substance.casNumber.toLowerCase().includes(query) ||
        substance.chemicalGroup?.name.toLowerCase().includes(query)
    );
  }, [substances, searchQuery]);

  if (loading) {
    return <div className="text-center py-8">Cargando sustancias químicas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sustancias Químicas</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Sustancia
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, CAS o grupo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <div className="text-sm text-gray-500">
            {filteredSubstances.length} de {substances.length} sustancias
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>CAS</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Estado Físico</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubstances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery
                    ? "No se encontraron sustancias con esos criterios"
                    : "No hay sustancias químicas registradas"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubstances.map((substance) => {
                const hasPictograms = !!(substance.pictograms && substance.pictograms.length > 0);
                const pictogramCount = substance.pictograms?.length || 0;
                
                return (
                  <TableRow key={substance.id}>
                    <TableCell className="font-medium">{substance.name}</TableCell>
                    <TableCell>{substance.casNumber}</TableCell>
                    <TableCell>{substance.chemicalGroup?.name || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          substance.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {substance.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell>{substance.physicalState}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenPictogramsDialog(substance)}
                          title={`Asignar pictogramas${hasPictograms ? ` (${pictogramCount} asignado${pictogramCount > 1 ? 's' : ''})` : ''}`}
                          className={hasPictograms ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50" : ""}
                        >
                          <PictogramIndicator 
                            hasPictograms={hasPictograms} 
                            count={pictogramCount}
                          />
                        </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(substance)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(substance.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubstance ? "Editar Sustancia Química" : "Nueva Sustancia Química"}
            </DialogTitle>
            <DialogDescription>
              {editingSubstance
                ? "Modifique la información de la sustancia química"
                : "Ingrese la información de la nueva sustancia química"}
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
                placeholder="Ej: Ácido Clorhídrico"
              />
            </div>
            <div>
              <label htmlFor="casNumber" className="text-sm font-medium mb-2 block">
                Número CAS *
              </label>
              <Input
                id="casNumber"
                value={formData.casNumber}
                onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                required
                placeholder="Ej: 7647-01-0"
              />
            </div>
            <div>
              <label htmlFor="chemicalGroupId" className="text-sm font-medium mb-2 block">
                Grupo Químico *
              </label>
              <ChemicalGroupsCombobox
                value={formData.chemicalGroupId}
                onValueChange={(value) => setFormData({ ...formData, chemicalGroupId: value })}
              />
            </div>
            <div>
              <label htmlFor="physicalState" className="text-sm font-medium mb-2 block">
                Estado Físico *
              </label>
              <Select
                value={formData.physicalState}
                onValueChange={(value) =>
                  setFormData({ ...formData, physicalState: value as typeof formData.physicalState })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado físico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquid">Líquido</SelectItem>
                  <SelectItem value="solid">Sólido</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="powder">Polvo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phMin" className="text-sm font-medium mb-2 block">
                  pH Mínimo
                </label>
                <Input
                  id="phMin"
                  type="number"
                  step="0.1"
                  value={formData.phMin}
                  onChange={(e) => setFormData({ ...formData, phMin: e.target.value })}
                  placeholder="Ej: 0.0"
                />
              </div>
              <div>
                <label htmlFor="phMax" className="text-sm font-medium mb-2 block">
                  pH Máximo
                </label>
                <Input
                  id="phMax"
                  type="number"
                  step="0.1"
                  value={formData.phMax}
                  onChange={(e) => setFormData({ ...formData, phMax: e.target.value })}
                  placeholder="Ej: 1.0"
                />
              </div>
            </div>
            <div>
              <label htmlFor="ghsClass" className="text-sm font-medium mb-2 block">
                Clase GHS *
              </label>
              <Input
                id="ghsClass"
                value={formData.ghsClass}
                onChange={(e) => setFormData({ ...formData, ghsClass: e.target.value })}
                required
                placeholder="Ej: Corrosivo"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="nfpaHealth" className="text-sm font-medium mb-2 block">
                  NFPA Salud *
                </label>
                <Input
                  id="nfpaHealth"
                  type="number"
                  min="0"
                  max="4"
                  value={formData.nfpaHealth ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      nfpaHealth: value === "" ? 0 : parseInt(value) || 0 
                    });
                  }}
                  required
                />
              </div>
              <div>
                <label htmlFor="nfpaFlammability" className="text-sm font-medium mb-2 block">
                  NFPA Inflamabilidad *
                </label>
                <Input
                  id="nfpaFlammability"
                  type="number"
                  min="0"
                  max="4"
                  value={formData.nfpaFlammability ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      nfpaFlammability: value === "" ? 0 : parseInt(value) || 0 
                    });
                  }}
                  required
                />
              </div>
              <div>
                <label htmlFor="nfpaReactivity" className="text-sm font-medium mb-2 block">
                  NFPA Reactividad *
                </label>
                <Input
                  id="nfpaReactivity"
                  type="number"
                  min="0"
                  max="4"
                  value={formData.nfpaReactivity ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      nfpaReactivity: value === "" ? 0 : parseInt(value) || 0 
                    });
                  }}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Activo
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingSubstance ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AssignPictogramsModal
        substance={selectedSubstanceForPictograms}
        isOpen={isPictogramsDialogOpen}
        onOpenChange={setIsPictogramsDialogOpen}
        onSuccess={handlePictogramsSuccess}
      />
    </div>
  );
}

