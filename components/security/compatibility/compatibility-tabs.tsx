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
  substances,
  matrix,
  levels,
}: CompatibilityTabsProps) {
  return (
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
        <ComparisonTab substances={substances} />
      </TabsContent>

      <TabsContent value="matrix">
        <MatrixTab
          substances={substances}
          matrix={matrix}
          levels={levels}
        />
      </TabsContent>
    </Tabs>
  );
}

