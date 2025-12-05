import type { Metadata } from "next";
import { SchedulesTable } from "@/components/quality_v0/micro/schedules";

export const metadata: Metadata = {
  title: "Quality Micro - Settings - Schedules",
  description: "Gestión de schedules programados para eventos micro",
};

export default function SchedulesPage() {
  return (
    <div className="h-full flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans overflow-hidden">
      <main className="h-full w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 overflow-hidden">
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <div className="mb-3 flex-shrink-0">
            <h1 className="text-xl font-bold leading-6 tracking-tight text-blue-600 dark:text-blue-400">
              Schedules Programados
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Gestión de schedules programados para eventos micro
            </p>
          </div>
          <div className="w-full flex-1 min-h-0 overflow-hidden max-h-[calc(100vh-180px)]">
            <SchedulesTable />
          </div>
        </div>
      </main>
    </div>
  );
}

