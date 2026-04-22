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
  qualityTypeId?: number;
  departmentId?: number;
}

export function MicroTypeSelector({
  value,
  onValueChange,
  placeholder = "Selecciona un tipo de evento",
  qualityTypeId,
  departmentId,
}: MicroTypeSelectorProps) {
  const [microTypes, setMicroTypes] = useState<MicroType[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    async function fetchMicroTypes() {
      try {
        setLoading(true);
        const data = await getMicroTypes({ qualityTypeId, departmentId });
        setMicroTypes(data);
      } catch (err) {
        showError("Error al cargar tipos de eventos", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMicroTypes();
  }, [qualityTypeId, departmentId, showError]);

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

