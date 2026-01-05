import { QualityCards } from "@/components/quality/quality-cards";

export default function QualityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
            Calidad
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Selecciona el área de calidad que deseas consultar
          </p>
        </div>

        <QualityCards />
      </div>
    </div>
  );
}

