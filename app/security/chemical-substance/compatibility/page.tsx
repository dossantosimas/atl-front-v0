import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { CompatibilityTabs } from "@/components/security/compatibility/compatibility-tabs";
import { getMatrixData } from "@/lib/services/chemical-substances.service";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import type {
  ChemicalSubstance,
  CompatibilityMatrix,
  CompatibilityLevel,
} from "@/lib/types/chemical-substances";

// Desactivar caché para esta página
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CompatibilityPage() {
  let substances: ChemicalSubstance[] = [];
  let matrix: CompatibilityMatrix[] = [];
  let levels: CompatibilityLevel[] = [];
  let error: Error | null = null;

  try {
    // Forzar recarga sin caché
    noStore();
    const data = await getMatrixData();
    substances = data.substances;
    matrix = data.matrix;
    levels = data.compatibilityLevels;
  } catch (err) {
    error = err instanceof Error ? err : new Error("Error desconocido");
    console.error("Error loading compatibility data:", error);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error al cargar los datos de compatibilidad
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/security">Seguridad</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Matriz de Compatibilidad</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Matriz de Compatibilidad Química
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Compara dos sustancias químicas o visualiza la matriz completa de
            compatibilidad.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Cargando matriz de compatibilidad...
                </span>
              </div>
            </div>
          }
        >
          <CompatibilityTabs
            substances={substances}
            matrix={matrix}
            levels={levels}
          />
        </Suspense>
      </div>
    </div>
  );
}
