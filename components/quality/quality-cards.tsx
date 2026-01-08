"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Microscope, FlaskConical, Beaker, TestTube } from "lucide-react";
import type { QualityType } from "@/lib/types/quality-types";
import { getQualityTypes } from "@/lib/services/quality-types.service";

interface QualityCard {
  id: number;
  name: string;
  description: string;
  href: string;
  icon: typeof Microscope | typeof FlaskConical | typeof Beaker | typeof TestTube;
  color: string;
  hoverColor: string;
}

// Mapeo de nombres conocidos a sus configuraciones específicas
const qualityTypeMapping: Record<string, Partial<QualityCard>> = {
  "Microbiología": {
    description: "Gestión de eventos microbiológicos y análisis",
    href: "/quality/1", // Usar ID dinámico
    icon: Microscope,
    color: "bg-[#091EB7]",
    hoverColor: "hover:bg-[#050F5C]",
  },
  "Físico - Químico": {
    description: "Control y análisis físico-químico",
    href: "/quality/2", // Usar ID dinámico (ajustar según el ID real)
    icon: FlaskConical,
    color: "bg-[#0ADDD7]",
    hoverColor: "hover:bg-[#091EB7]",
  },
};

// Colores e íconos por defecto para tipos nuevos
const defaultIcons = [Beaker, TestTube, FlaskConical, Microscope];
const defaultColors = [
  { color: "bg-[#FE941E]", hoverColor: "hover:bg-[#EBA600]" },
  { color: "bg-[#0ADDD7]", hoverColor: "hover:bg-[#091EB7]" },
  { color: "bg-[#091EB7]", hoverColor: "hover:bg-[#050F5C]" },
  { color: "bg-purple-600", hoverColor: "hover:bg-purple-700" },
];

export function QualityCards() {
  const [qualityTypes, setQualityTypes] = useState<QualityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQualityTypes();
  }, []);

  const loadQualityTypes = async () => {
    try {
      const types = await getQualityTypes();
      setQualityTypes(types);
    } catch (error) {
      console.error("Error loading quality types:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convertir quality-types a cards
  const qualityCards: QualityCard[] = qualityTypes.map((type, index) => {
    const mapping = qualityTypeMapping[type.name];
    if (mapping) {
      // Si existe un mapeo, usar esos valores
      return {
        id: type.id,
        name: type.name,
        description: mapping.description || type.name,
        href: mapping.href || `/quality/${type.id}`,
        icon: mapping.icon || Microscope,
        color: mapping.color || "bg-[#091EB7]",
        hoverColor: mapping.hoverColor || "hover:bg-[#050F5C]",
      } as QualityCard;
    } else {
      // Si no existe mapeo, usar valores por defecto
      const colorIndex = index % defaultColors.length;
      const iconIndex = index % defaultIcons.length;
      return {
        id: type.id,
        name: type.name,
        description: `Gestión y análisis de ${type.name.toLowerCase()}`,
        href: `/quality/${type.id}`,
        icon: defaultIcons[iconIndex],
        color: defaultColors[colorIndex].color,
        hoverColor: defaultColors[colorIndex].hoverColor,
      } as QualityCard;
    }
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Cargando áreas de calidad...
      </div>
    );
  }

  if (qualityCards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No hay áreas de calidad configuradas.
      </div>
    );
  }

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
