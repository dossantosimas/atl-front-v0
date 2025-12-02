import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Quality Micro - Settings",
  description: "Configuración de eventos micro",
};

export default function SettingsPage() {
  return (
    <div className="h-full flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
      <main className="h-full w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6">
        <div className="flex flex-col gap-4 h-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold leading-7 tracking-tight text-blue-600 dark:text-blue-400">
              Configuración
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestión de configuraciones y schedules
            </p>
          </div>
          
          <div className="w-full flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/quality/micro/settings/schedules">
                <Button
                  variant="outline"
                  className="w-full h-32 flex flex-col items-center justify-center gap-2 hover:bg-accent transition-colors"
                >
                  <Calendar className="h-8 w-8" />
                  <span className="text-lg font-semibold">Schedules</span>
                  <span className="text-sm text-muted-foreground">
                    Gestionar schedules programados
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

