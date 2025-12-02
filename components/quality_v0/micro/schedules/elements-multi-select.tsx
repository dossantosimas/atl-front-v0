"use client";

import * as React from "react";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { MicroElement } from "@/lib/types/micro-elements";

interface ElementsMultiSelectProps {
  elements: MicroElement[];
  value: string[]; // Array de IDs como strings
  onValueChange: (value: string[]) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ElementsMultiSelect({
  elements,
  value = [],
  onValueChange,
  loading = false,
  placeholder = "Selecciona elementos...",
  disabled = false,
}: ElementsMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedElements = React.useMemo(() => {
    return elements.filter((element) => value.includes(String(element.id)));
  }, [value, elements]);

  const handleToggle = (elementId: string) => {
    const newValue = value.includes(elementId)
      ? value.filter((id) => id !== elementId)
      : [...value, elementId];
    onValueChange(newValue);
  };

  const handleRemove = (elementId: string) => {
    onValueChange(value.filter((id) => id !== elementId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading || disabled}
          >
            {loading
              ? "Cargando..."
              : selectedElements.length > 0
              ? `${selectedElements.length} elemento(s) seleccionado(s)`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command
            filter={(val, search) => {
              if (!search || search.trim() === "") return 1;
              const searchLower = search.toLowerCase().trim();
              const element = elements.find((e) => String(e.id) === val);
              if (!element) return 0;
              const searchableText = `${element.name} ${element.id}`.toLowerCase();
              return searchableText.includes(searchLower) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Buscar por nombre o ID..." />
            <CommandList>
              <CommandEmpty>No se encontraron elementos.</CommandEmpty>
              <CommandGroup>
                {elements.map((element) => {
                  const isSelected = value.includes(String(element.id));
                  return (
                    <CommandItem
                      key={element.id}
                      value={String(element.id)}
                      onSelect={() => handleToggle(String(element.id))}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {element.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedElements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedElements.map((element) => (
            <Badge key={element.id} variant="secondary" className="gap-1">
              {element.name}
              <button
                type="button"
                onClick={() => handleRemove(String(element.id))}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

