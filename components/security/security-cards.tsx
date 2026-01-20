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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
      {securityCards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Link key={card.id} href={card.href}>
            <div
              className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer`}
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
