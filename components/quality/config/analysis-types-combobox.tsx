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
import type { AnalysisType } from "@/lib/types/micro-analysis";

interface AnalysisTypesComboboxProps {
  analysisTypes: AnalysisType[];
  value?: string;
  onValueChange: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function AnalysisTypesCombobox({
  analysisTypes,
  value = "",
  onValueChange,
  loading = false,
  placeholder = "Selecciona un tipo de análisis...",
  disabled = false,
}: AnalysisTypesComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedAnalysisType = analysisTypes.find((at) => at.id === value);

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
          {selectedAnalysisType
            ? `${selectedAnalysisType.name} (${selectedAnalysisType.code})`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command
          filter={(value, search) => {
            if (!search || search.trim() === "") return 1;
            const searchLower = search.toLowerCase().trim();
            const analysisType = analysisTypes.find((at) => at.id === value);
            if (!analysisType) return 0;
            const searchableText = `${analysisType.name} ${analysisType.code}`.toLowerCase();
            return searchableText.includes(searchLower) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar por nombre o código..." />
          <CommandList>
            <CommandEmpty>No se encontraron tipos de análisis.</CommandEmpty>
            <CommandGroup>
              {analysisTypes.map((analysisType) => (
                <CommandItem
                  key={analysisType.id}
                  value={analysisType.id}
                  onSelect={(selectedValue) => {
                    onValueChange(selectedValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === analysisType.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {analysisType.name} ({analysisType.code})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

