"use client";

import { useEffect, useState } from "react";
import { getMicroTypes } from "@/lib/services/micro-types.service";
import type { MicroType } from "@/lib/types/micro-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/toast";

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
  const { showSuccess, showError } = useToast();

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
        // No mostrar toast cuando se pasan desde el padre
      } catch (err) {
        showError("Error al cargar tipos de eventos", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMicroTypes();
  }, [showSuccess, showError, qualityTypeId, externalMicroTypes]);

  return (
    <div className="w-full">
      {loading ? (
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Cargando..." />
          </SelectTrigger>
        </Select>
      ) : microTypes.length === 0 ? (
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No hay tipos disponibles" />
          </SelectTrigger>
        </Select>
      ) : (
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {microTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

