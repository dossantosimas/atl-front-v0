"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ChemicalSubstance } from "@/lib/types/chemical-substances";
import { getChemicalSubstances } from "@/lib/services/chemical-substances.service";

interface ChemicalSubstancesComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  excludeId?: string;
  excludeIds?: string[]; // Array de IDs a excluir
  substances?: ChemicalSubstance[]; // Lista opcional de sustancias filtradas
}

export function ChemicalSubstancesCombobox({
  value,
  onValueChange,
  placeholder = "Seleccione una sustancia química...",
  className,
  excludeId,
  excludeIds,
  substances: providedSubstances, // Sustancias proporcionadas desde fuera
}: ChemicalSubstancesComboboxProps) {
  const [open, setOpen] = useState(false);
  const [substances, setSubstances] = useState<ChemicalSubstance[]>([]);
  const [loading, setLoading] = useState(true);

  // Combinar excludeId y excludeIds en un array único
  const excludedIds = useMemo(() => {
    const ids = new Set<string>();
    if (excludeId) ids.add(excludeId);
    if (excludeIds) excludeIds.forEach(id => ids.add(id));
    return Array.from(ids);
  }, [excludeId, excludeIds]);

  useEffect(() => {
    // Si se proporcionan sustancias, usarlas directamente
    if (providedSubstances) {
      const filtered = excludedIds.length > 0
        ? providedSubstances.filter((s) => !excludedIds.includes(s.id)) 
        : providedSubstances;
      setSubstances(filtered);
      setLoading(false);
      return;
    }

    // Si no se proporcionan, cargar todas
    loadSubstances();
  }, [providedSubstances, excludedIds]);

  const loadSubstances = async () => {
    try {
      setLoading(true);
      const data = await getChemicalSubstances();
      // Filtrar si hay IDs excluidos
      const filtered = excludedIds.length > 0 
        ? data.filter((s) => !excludedIds.includes(s.id)) 
        : data;
      setSubstances(filtered);
    } catch (error) {
      console.error("Error loading chemical substances:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubstance = substances.find((substance) => substance.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedSubstance ? selectedSubstance.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar sustancia..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Cargando sustancias..." : "No se encontraron sustancias."}
            </CommandEmpty>
            <CommandGroup>
              {substances.map((substance) => (
                <CommandItem
                  key={substance.id}
                  value={substance.id}
                  onSelect={() => {
                    onValueChange(substance.id === value ? "" : substance.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === substance.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {substance.name} ({substance.casNumber})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

