"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfigProtection } from "@/components/quality/config-protection";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTypesManager } from "@/components/quality/config/event-types-manager";
import { AnalysisTypesManager } from "@/components/quality/config/analysis-types-manager";
import { ElementsManager } from "@/components/quality/config/elements-manager";
import { AssociationsManager } from "@/components/quality/config/associations-manager";
import { Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ConfigPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshAnalysisTypes = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefreshElements = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ConfigProtection>
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
                  <Link href="/quality">Calidad</Link>
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
              Configuración
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestión de eventos microbiológicos, tipos de análisis, elementos y sus asociaciones
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 flex flex-col min-h-[600px] max-h-[calc(100vh-12rem)] flex-1">
            <Tabs defaultValue="event-types" className="w-full flex flex-col flex-1 min-h-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
                <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-4 flex-shrink-0">
                  <TabsTrigger value="event-types">Tipos de Eventos</TabsTrigger>
                  <TabsTrigger value="analysis-types">Tipos de Análisis</TabsTrigger>
                  <TabsTrigger value="elements">Elementos</TabsTrigger>
                  <TabsTrigger value="associations">Asociaciones</TabsTrigger>
                </TabsList>
              <div className="flex flex-col gap-2 ml-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/quality/config/schedules">
                        <Button variant="outline" size="icon">
                          <Calendar className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Schedules</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/quality/config/types">
                        <Button variant="outline" size="icon">
                          <Tag className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Subareas de Calidad</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              </div>

              <TabsContent value="event-types" className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4">
                <EventTypesManager />
              </TabsContent>

              <TabsContent value="analysis-types" className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4">
                <AnalysisTypesManager onRefresh={handleRefreshAnalysisTypes} />
              </TabsContent>

              <TabsContent value="elements" className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4">
                <ElementsManager onRefresh={handleRefreshElements} />
              </TabsContent>

              <TabsContent value="associations" className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4">
                <AssociationsManager
                  key={refreshKey}
                  onRefreshAnalysisTypes={handleRefreshAnalysisTypes}
                  onRefreshElements={handleRefreshElements}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ConfigProtection>
  );
}
