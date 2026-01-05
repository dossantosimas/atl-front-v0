import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { QualityV0 } from "@/components/quality_v0/micro/events";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const validViews = ["operator", "leader", "audit"] as const;

type ViewType = (typeof validViews)[number];

interface QualityMicroViewPageProps {
  params: Promise<{
    view: string;
  }>;
}

export async function generateMetadata({
  params,
}: QualityMicroViewPageProps): Promise<Metadata> {
  const { view } = await params;

  if (!validViews.includes(view as ViewType)) {
    return {
      title: "Not Found",
    };
  }

  const viewTitle = view.charAt(0).toUpperCase() + view.slice(1);

  return {
    title: `ATLapp - ${viewTitle}`,
    description: `Quality micro page for ${view} view`,
  };
}

export default async function QualityMicroViewPage({
  params,
}: QualityMicroViewPageProps) {
  const { view } = await params;

  // Validar que view sea uno de los valores permitidos
  if (!validViews.includes(view as ViewType)) {
    notFound();
  }

  // Traducir el título de la vista al español
  const viewTitleMap: Record<string, string> = {
    operator: "Operación",
    leader: "Liderazgo",
    audit: "Auditoría",
  };
  const viewTitle = viewTitleMap[view] || view.charAt(0).toUpperCase() + view.slice(1);

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
                <Link href="/quality">Calidad</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/quality/micro">Microbiología</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{viewTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <QualityV0 view={view as "operator" | "leader" | "audit"} />
      </div>
    </div>
  );
}

