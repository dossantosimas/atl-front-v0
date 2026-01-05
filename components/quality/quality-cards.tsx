"use client";

import Link from "next/link";
import { Microscope, FlaskConical } from "lucide-react";

interface QualityCard {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: typeof Microscope | typeof FlaskConical;
  color: string;
  hoverColor: string;
}

const qualityCards: QualityCard[] = [
  {
    id: "micro",
    name: "Microbiología",
    description: "Gestión de eventos microbiológicos y análisis",
    href: "/quality/micro",
    icon: Microscope,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
  },
  {
    id: "fisico-quimico",
    name: "Físico - Químico",
    description: "Control y análisis físico-químico",
    href: "/quality/fisico-quimico",
    icon: FlaskConical,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
  },
];

export function QualityCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
      {qualityCards.map((card) => {
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
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {card.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {card.description}
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
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

