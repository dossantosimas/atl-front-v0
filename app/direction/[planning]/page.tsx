import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PlanningView } from "@/components/direction/planning-view";
import { getPlannings } from "@/lib/services/planning.service";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface PlanningPageProps {
  params: Promise<{
    planning: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlanningPageProps): Promise<Metadata> {
  const { planning } = await params;
  const planningId = parseInt(planning, 10);
  
  let planningName = "Planeación";
  try {
    const plannings = await getPlannings();
    const planning = plannings.find((p) => p.id === planningId);
    if (planning) {
      planningName = planning.name;
    }
  } catch (error) {
    console.error("Error loading planning for metadata:", error);
  }

  return {
    title: `Dirección - ${planningName}`,
    description: `Planeación de ${planningName} - Dirección`,
  };
}

export default async function PlanningPage({ params }: PlanningPageProps) {
  const { planning } = await params;
  const planningId = parseInt(planning, 10);

  // Validar que planning sea un número válido
  if (isNaN(planningId)) {
    notFound();
  }

  // Obtener el nombre del planning
  let planningName = "Planeación";
  try {
    const plannings = await getPlannings();
    const planningData = plannings.find((p) => p.id === planningId);
    if (!planningData) {
      notFound();
    }
    planningName = planningData.name;
  } catch (error) {
    console.error("Error loading planning:", error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                <Link href="/direction">Dirección</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{planningName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            Dirección - {planningName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestión y planeación de {planningName.toLowerCase()}
          </p>
        </div>

        <PlanningView planningId={planningId} />
      </div>
    </div>
  );
}

