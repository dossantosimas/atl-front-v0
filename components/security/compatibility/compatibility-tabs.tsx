"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparisonTab } from "./comparison-tab";
import { MatrixTab } from "./matrix-tab";
import type {
  ChemicalSubstance,
  CompatibilityMatrix,
  CompatibilityLevel,
} from "@/lib/types/chemical-substances";

interface CompatibilityTabsProps {
  substances: ChemicalSubstance[];
  matrix: CompatibilityMatrix[];
  levels: CompatibilityLevel[];
}

export function CompatibilityTabs({
  substances: initialSubstances,
  matrix: initialMatrix,
  levels,
}: CompatibilityTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-auto">
          <TabsTrigger value="comparison" className="text-xs sm:text-sm py-2 sm:py-1.5">
            Comparación
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs sm:text-sm py-2 sm:py-1.5">
            Matriz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          {/* Comparación siempre usa todas las sustancias sin filtros */}
          <ComparisonTab substances={initialSubstances} />
        </TabsContent>

        <TabsContent value="matrix">
          {/* Matriz puede tener filtros opcionales */}
          <MatrixTab
            initialSubstances={initialSubstances}
            initialMatrix={initialMatrix}
            levels={levels}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

