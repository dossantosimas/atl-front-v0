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
}

export function MicroTypeSelector({
  value,
  onValueChange,
  placeholder = "Selecciona un tipo de evento",
}: MicroTypeSelectorProps) {
  const [microTypes, setMicroTypes] = useState<MicroType[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    async function fetchMicroTypes() {
      try {
        setLoading(true);
        const data = await getMicroTypes();
        setMicroTypes(data);
        showSuccess(
          "Tipos de eventos cargados correctamente",
          `Se encontraron ${data.length} tipos de eventos`
        );
      } catch (err) {
        showError("Error al cargar tipos de eventos", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMicroTypes();
  }, [showSuccess, showError]);

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

