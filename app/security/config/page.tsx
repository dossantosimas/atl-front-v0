"use client";

import { useState } from "react";
import Link from "next/link";
import { SecurityConfigProtection } from "@/components/security/config-protection";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompatibilityLevelsManager } from "@/components/security/config/compatibility-levels-manager";
import { ChemicalGroupsManager } from "@/components/security/config/chemical-groups-manager";
import { ChemicalSubstancesManager } from "@/components/security/config/chemical-substances-manager";
import { CompatibilityMatrixManager } from "@/components/security/config/compatibility-matrix-manager";
import { PictogramsManager } from "@/components/security/config/pictograms-manager";

export default function SecurityConfigPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <SecurityConfigProtection>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Link href="/security">Seguridad</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Configuración</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Configuración de Sustancias Químicas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestión de niveles de compatibilidad, grupos químicos, sustancias y matriz de compatibilidad
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 flex flex-col min-h-[600px] max-h-[calc(100vh-12rem)] flex-1">
          <Tabs defaultValue="compatibility-levels" className="w-full flex flex-col flex-1 min-h-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-5 flex-shrink-0">
                <TabsTrigger value="compatibility-levels">Niveles</TabsTrigger>
                <TabsTrigger value="groups">Grupos</TabsTrigger>
                <TabsTrigger value="substances">Sustancias</TabsTrigger>
                <TabsTrigger value="pictograms">Pictogramas</TabsTrigger>
                <TabsTrigger value="matrix">Matriz</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="compatibility-levels"
              className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
            >
              <CompatibilityLevelsManager key={refreshKey} />
            </TabsContent>

            <TabsContent
              value="groups"
              className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
            >
              <ChemicalGroupsManager key={refreshKey} />
            </TabsContent>

            <TabsContent
              value="substances"
              className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
            >
              <ChemicalSubstancesManager key={refreshKey} onRefresh={handleRefresh} />
            </TabsContent>

            <TabsContent
              value="pictograms"
              className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
            >
              <PictogramsManager key={refreshKey} />
            </TabsContent>

            <TabsContent
              value="matrix"
              className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
            >
              <CompatibilityMatrixManager key={refreshKey} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </SecurityConfigProtection>
  );
}

