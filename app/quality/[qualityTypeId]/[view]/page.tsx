import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { QualityV0 } from "@/components/quality_v0/micro/events";
import { getQualityTypeById } from "@/lib/services/quality-types.service";
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

interface QualityTypeViewPageProps {
  params: Promise<{
    qualityTypeId: string;
    view: string;
  }>;
}

export async function generateMetadata({
  params,
}: QualityTypeViewPageProps): Promise<Metadata> {
  const { view, qualityTypeId } = await params;

  if (!validViews.includes(view as ViewType)) {
    return {
      title: "Not Found",
    };
  }

  const viewTitle = view.charAt(0).toUpperCase() + view.slice(1);

  return {
    title: `ATLapp - ${viewTitle}`,
    description: `Quality page for ${view} view`,
  };
}

export default async function QualityTypeViewPage({
  params,
}: QualityTypeViewPageProps) {
  const { view, qualityTypeId } = await params;
  const id = parseInt(qualityTypeId, 10);

  if (isNaN(id)) {
    notFound();
  }

  // Validar que view sea uno de los valores permitidos
  if (!validViews.includes(view as ViewType)) {
    notFound();
  }

  let qualityType;
  try {
    qualityType = await getQualityTypeById(id);
  } catch (error) {
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1 flex flex-col min-h-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-4 mb-4 flex-shrink-0">
          <Breadcrumb className="overflow-x-auto">
            <BreadcrumbList className="flex-wrap">
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
                  <Link href={`/quality/${id}`}>{qualityType.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{viewTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <QualityV0 view={view as "operator" | "leader" | "audit"} qualityTypeId={id} />
        </div>
      </div>
    </div>
  );
}
