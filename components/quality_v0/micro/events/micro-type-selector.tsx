"use client";

import { useEffect, useState, useMemo } from "react";
import { getMicroTypes } from "@/lib/services/micro-types.service";
import type { MicroType } from "@/lib/types/micro-types";
import { useToast } from "@/components/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MicroTypeSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  qualityTypeId?: number; // ID del quality-type para filtrar micro-types
  microTypes?: MicroType[]; // Micro-types pre-filtrados desde el componente padre
}

export function MicroTypeSelector({
  value,
  onValueChange,
  placeholder = "Selecciona un tipo de evento",
  qualityTypeId,
  microTypes: externalMicroTypes,
}: MicroTypeSelectorProps) {
  const [microTypes, setMicroTypes] = useState<MicroType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearch] = useState("");
  const { showError } = useToast();

  useEffect(() => {
    // Si se pasan microTypes desde el padre, usarlos directamente
    if (externalMicroTypes) {
      setMicroTypes(externalMicroTypes);
      setLoading(false);
      return;
    }

    async function fetchMicroTypes() {
      try {
        setLoading(true);
        const data = await getMicroTypes();
        // Si hay qualityTypeId, filtrar los micro-types por ese quality-type
        if (qualityTypeId !== undefined) {
          const filteredData = data.filter(type => 
            type.qualityType?.id === qualityTypeId || type.qualityTypeId === qualityTypeId
          );
          setMicroTypes(filteredData);
        } else {
          setMicroTypes(data);
        }
      } catch (err) {
        showError("Error al cargar tipos de eventos", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMicroTypes();
  }, [qualityTypeId, externalMicroTypes, showError]);

  const filteredMicroTypes = useMemo(() => {
    if (!searchTerm) return microTypes;
    const s = searchTerm.toLowerCase().trim();
    return microTypes.filter(
      (t) =>
        t.description.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s)
    );
  }, [microTypes, searchTerm]);

  return (
    <div className="w-full">
      <Select value={value} onValueChange={onValueChange} disabled={loading || microTypes.length === 0}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Cargando..." : microTypes.length === 0 ? "No hay tipos disponibles" : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 sticky top-0 bg-popover z-10 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tipo..."
                value={searchTerm}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
                onKeyDown={(e) => e.stopPropagation()} // Evitar que el Select se cierre al presionar espacio
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredMicroTypes.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">
                No se encontraron resultados
              </div>
            ) : (
              filteredMicroTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.description}
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
