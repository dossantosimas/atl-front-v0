"use client";

import Link from "next/link";
import { Beaker, Shield, AlertTriangle, FlaskConical } from "lucide-react";

interface SecurityCard {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: typeof Beaker | typeof Shield | typeof AlertTriangle | typeof FlaskConical;
  color: string;
  hoverColor: string;
}

const securityCards: SecurityCard[] = [
  {
    id: "chemical-substances",
    name: "Sustancias Químicas",
    description: "Gestión de sustancias químicas y matriz de compatibilidad",
    href: "/security/chemical-substance/compatibility",
    icon: Beaker,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
  },
];

export function SecurityCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
      {securityCards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Link key={card.id} href={card.href}>
            <div
              className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer min-w-0 flex flex-col`}
            >
              <div className={`${card.color} ${card.hoverColor} p-4 sm:p-6 md:p-8 relative transition-colors flex-shrink-0`}>
                <Icon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white mx-auto" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-gray-100 group-hover:text-[#091EB7] dark:group-hover:text-[#0ADDD7] transition-colors">
                  {card.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 flex-1">
                  {card.description}
                </p>
                <div className="flex items-center text-[#091EB7] dark:text-[#0ADDD7] font-medium text-xs sm:text-sm">
                  Acceder
                  <svg
                    className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1"
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
