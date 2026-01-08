import { notFound } from "next/navigation";
import Link from "next/link";
import { getQualityTypeById } from "@/lib/services/quality-types.service";
import { MicroCards } from "@/components/quality/micro-cards";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface QualityTypePageProps {
  params: Promise<{
    qualityTypeId: string;
  }>;
}

export default async function QualityTypePage({ params }: QualityTypePageProps) {
  const { qualityTypeId } = await params;
  const id = parseInt(qualityTypeId, 10);

  if (isNaN(id)) {
    notFound();
  }

  let qualityType;
  try {
    qualityType = await getQualityTypeById(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <BreadcrumbPage>{qualityType.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
            {qualityType.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Selecciona el tipo de vista que deseas consultar
          </p>
        </div>

        <MicroCards qualityTypeId={id} />
      </div>
    </div>
  );
}

