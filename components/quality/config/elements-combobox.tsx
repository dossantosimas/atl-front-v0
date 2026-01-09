"use client";

import * as React from "react";
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
import type { MicroElement } from "@/lib/types/micro-elements";

interface ElementsComboboxProps {
  elements: MicroElement[];
  value?: string;
  onValueChange: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ElementsCombobox({
  elements,
  value = "",
  onValueChange,
  loading = false,
  placeholder = "Selecciona un elemento...",
  disabled = false,
}: ElementsComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedElement = elements.find((e) => String(e.id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
          disabled={disabled || loading}
        >
          {selectedElement ? selectedElement.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command
          filter={(value, search) => {
            if (!search || search.trim() === "") return 1;
            const searchLower = search.toLowerCase().trim();
            const element = elements.find((e) => String(e.id) === value);
            if (!element) return 0;
            const searchableText = `${element.name} ${element.id}`.toLowerCase();
            return searchableText.includes(searchLower) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar por nombre o ID..." />
          <CommandList>
            <CommandEmpty>No se encontraron elementos.</CommandEmpty>
            <CommandGroup>
              {elements.map((element) => (
                <CommandItem
                  key={element.id}
                  value={String(element.id)}
                  onSelect={(selectedValue) => {
                    onValueChange(selectedValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === String(element.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {element.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

