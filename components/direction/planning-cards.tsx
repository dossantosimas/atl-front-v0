"use client";

import Link from "next/link";
import { Droplets, Cloud, Zap, MoreHorizontal, Target } from "lucide-react";
import type { Planning } from "@/lib/types/planning";

interface PlanningCardsProps {
  plannings: Planning[];
}

// Función helper para obtener icono según el nombre del planning
function getPlanningIcon(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("agua") || lowerName.includes("water")) {
    return Droplets;
  }
  if (lowerName.includes("co2") || lowerName.includes("carbono")) {
    return Cloud;
  }
  if (lowerName.includes("energía") || lowerName.includes("energia") || lowerName.includes("energy")) {
    return Zap;
  }
  return MoreHorizontal;
}

// Función helper para obtener color según el nombre del planning
function getPlanningColor(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("agua") || lowerName.includes("water")) {
    return { bg: "bg-blue-500", hover: "hover:bg-blue-600" };
  }
  if (lowerName.includes("co2") || lowerName.includes("carbono")) {
    return { bg: "bg-gray-500", hover: "hover:bg-gray-600" };
  }
  if (lowerName.includes("energía") || lowerName.includes("energia") || lowerName.includes("energy")) {
    return { bg: "bg-yellow-500", hover: "hover:bg-yellow-600" };
  }
  return { bg: "bg-purple-500", hover: "hover:bg-purple-600" };
}

export function PlanningCards({ plannings }: PlanningCardsProps) {
  if (plannings.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 py-12">
        No hay planeaciones disponibles
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
      {plannings.map((planning) => {
        const Icon = getPlanningIcon(planning.name);
        const colors = getPlanningColor(planning.name);
        
        return (
          <Link key={planning.id} href={`/direction/${planning.id}`}>
            <div
              className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer`}
            >
              <div className={`${colors.bg} ${colors.hover} p-8 relative transition-colors`}>
                <Icon className="h-12 w-12 text-white mx-auto" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {planning.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Gestión y planeación de {planning.name.toLowerCase()}
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

