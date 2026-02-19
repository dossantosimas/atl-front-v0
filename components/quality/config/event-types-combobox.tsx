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
import type { MicroType } from "@/lib/types/micro-types";

interface EventTypesComboboxProps {
  eventTypes: MicroType[];
  value?: string;
  onValueChange: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function EventTypesCombobox({
  eventTypes,
  value = "",
  onValueChange,
  loading = false,
  placeholder = "Selecciona un tipo de evento...",
  disabled = false,
}: EventTypesComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedEventType = eventTypes.find((type) => type.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          {selectedEventType ? selectedEventType.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command
          filter={(currentValue, search) => {
            if (!search || search.trim() === "") return 1;
            const searchLower = search.toLowerCase().trim();
            const eventType = eventTypes.find((type) => type.id === currentValue);
            if (!eventType) return 0;
            const searchableText = `${eventType.name} ${eventType.description || ""}`.toLowerCase();
            return searchableText.includes(searchLower) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar tipo de evento..." />
          <CommandList>
            <CommandEmpty>No se encontraron tipos de evento.</CommandEmpty>
            <CommandGroup>
              {eventTypes.map((eventType) => (
                <CommandItem
                  key={eventType.id}
                  value={eventType.id}
                  onSelect={(selectedValue) => {
                    onValueChange(selectedValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === eventType.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {eventType.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
