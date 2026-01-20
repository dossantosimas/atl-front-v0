"use client";

import { useState, useEffect } from "react";
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
import type { ChemicalGroup } from "@/lib/types/chemical-substances";
import { getChemicalGroups } from "@/lib/services/chemical-substances.service";

interface ChemicalGroupsComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ChemicalGroupsCombobox({
  value,
  onValueChange,
  placeholder = "Seleccione un grupo químico...",
  className,
}: ChemicalGroupsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<ChemicalGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    loadGroups();
  }, []);

  // Forzar re-render cuando cambie el value
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [value]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getChemicalGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error loading chemical groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = groups.find((group) => group.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen} key={key}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedGroup ? selectedGroup.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar grupo..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Cargando grupos..." : "No se encontraron grupos."}
            </CommandEmpty>
            <CommandGroup>
              {groups.map((group) => (
                <CommandItem
                  key={group.id}
                  value={group.id}
                  onSelect={() => {
                    onValueChange(group.id === value ? "" : group.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === group.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {group.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

