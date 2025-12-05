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
import type { Person } from "@/lib/types/people";

interface PeopleComboboxProps {
  people: Person[];
  value?: string;
  onValueChange: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function PeopleCombobox({
  people,
  value = "",
  onValueChange,
  loading = false,
  placeholder = "Selecciona una persona...",
  disabled = false,
}: PeopleComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedPerson = React.useMemo(() => {
    if (!value) return null;
    return people.find((person) => person.id === value) || null;
  }, [value, people]);

  return (
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
            : value && selectedPerson
            ? `${selectedPerson.name} ${selectedPerson.lastname}${selectedPerson.shardid ? ` (${selectedPerson.shardid})` : ""}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command
          filter={(value, search) => {
            if (!search || search.trim() === "") return 1;
            const searchLower = search.toLowerCase().trim();
            const person = people.find((p) => p.id === value);
            if (!person) return 0;
            const searchableText = `${person.name} ${person.lastname} ${person.shardid || ""}`.toLowerCase();
            return searchableText.includes(searchLower) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar por nombre, apellido o shardid..." />
          <CommandList>
            <CommandEmpty>No se encontraron personas.</CommandEmpty>
            <CommandGroup>
              {people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.id}
                  onSelect={(selectedValue) => {
                    const selectedPerson = people.find((p) => p.id === selectedValue) || null;
                    if (selectedPerson) {
                      const newValue = value === selectedPerson.id ? "" : selectedPerson.id;
                      onValueChange(newValue);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === person.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {person.name} {person.lastname}{person.shardid ? ` (${person.shardid})` : ""}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

