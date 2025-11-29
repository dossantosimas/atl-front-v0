import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QualityV0 } from "@/components/quality_v0";
import { ThemeToggle } from "@/components/theme-toggle";

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

  const viewTitle = view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans">
      <main className="h-full w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold leading-7 tracking-tight text-blue-600 dark:text-blue-400">
              ATLapp
            </h1>
            <ThemeToggle />
          </div>
          <div className="w-full">
            <QualityV0 view={view as "operator" | "leader" | "audit"} />
          </div>
        </div>
      </main>
    </div>
  );
}

