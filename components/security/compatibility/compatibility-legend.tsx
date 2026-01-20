import { Card, CardContent } from "@/components/ui/card";
import type { CompatibilityLevel } from "@/lib/types/chemical-substances";

interface CompatibilityLegendProps {
  levels: CompatibilityLevel[];
}

export function CompatibilityLegend({ levels }: CompatibilityLegendProps) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
          <span className="text-xs sm:text-sm font-medium w-full sm:w-auto">Leyenda:</span>
          {levels.map((level) => (
            <div key={level.id} className="flex items-center gap-2">
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: level.color }}
              />
              <span className="text-xs sm:text-sm whitespace-nowrap">{level.code}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Sin información
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

