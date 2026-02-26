"use client";

import Link from "next/link";
import { ChartColumn, User, Users } from "lucide-react";

interface MicroCard {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: typeof User | typeof Users | typeof ChartColumn;
  color: string;
  hoverColor: string;
}

const microCards: MicroCard[] = [
  {
    id: "operator",
    name: "Operación",
    description: "Gestión de eventos y muestras microbiológicas",
    href: "operator", // Será relativo al qualityTypeId
    icon: User,
    color: "bg-[#091EB7]",
    hoverColor: "hover:bg-[#050F5C]",
  },
  {
    id: "leader",
    name: "Liderazgo",
    description: "Supervisión y análisis de eventos microbiológicos",
    href: "leader", // Será relativo al qualityTypeId
    icon: Users,
    color: "bg-[#FE941E]",
    hoverColor: "hover:bg-[#EBA600]",
  },
  {
    id: "kpi-weekly",
    name: "KPI Semanal",
    description: "Consolidado semanal del MicroIndex por indicador",
    href: "kpi-weekly",
    icon: ChartColumn,
    color: "bg-[#0B8F6A]",
    hoverColor: "hover:bg-[#087558]",
  },
  {
    id: "kpi-monthly",
    name: "KPI Mensual",
    description: "Consolidado mensual del MicroIndex por indicador",
    href: "kpi-monthly",
    icon: ChartColumn,
    color: "bg-[#8B5CF6]",
    hoverColor: "hover:bg-[#7C3AED]",
  },
];

interface MicroCardsProps {
  qualityTypeId: number;
}

export function MicroCards({ qualityTypeId }: MicroCardsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
      {microCards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Link key={card.id} href={`/quality/${qualityTypeId}/${card.href}`}>
            <div
              className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer w-full sm:w-[400px]`}
            >
              <div className={`${card.color} ${card.hoverColor} p-8 relative transition-colors`}>
                <Icon className="h-12 w-12 text-white mx-auto" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-[#091EB7] dark:group-hover:text-[#0ADDD7] transition-colors">
                  {card.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {card.description}
                </p>
                <div className="flex items-center text-[#091EB7] dark:text-[#0ADDD7] font-medium text-sm">
                  Acceder
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
