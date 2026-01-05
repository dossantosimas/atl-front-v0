import { getPlannings } from "@/lib/services/planning.service";
import { PlanningCards } from "@/components/direction/planning-cards";
import type { Planning } from "@/lib/types/planning";

export default async function DirectionPage() {
  let plannings: Planning[] = [];
  
  try {
    console.log("[DirectionPage] Starting to fetch plannings...");
    plannings = await getPlannings();
    console.log("[DirectionPage] Plannings fetched successfully:", plannings.length);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[DirectionPage] Error loading plannings:", errorMessage);
    console.error("[DirectionPage] Full error:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
            Dirección
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Selecciona el tipo de planeación que deseas consultar
          </p>
        </div>

        <PlanningCards plannings={plannings} />
      </div>
    </div>
  );
}
