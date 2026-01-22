"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfigProtection } from "@/components/config-protection";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentsManager } from "@/components/config-global/departments-manager";
import { SubareasManager } from "@/components/config-global/subareas-manager";
import { EquipmentManager } from "@/components/config-global/equipment-manager";
import { DeviceManager } from "@/components/config-global/device-manager";
import { SignalManager } from "@/components/config-global/signal-manager";
import { SourceDataManager } from "@/components/config-global/source-data-manager";

export default function GlobalConfigPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ConfigProtection>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-8">
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
                <BreadcrumbPage>Configuración Global</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Configuración Global
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestión de departamentos, subáreas, equipos, dispositivos, señales y fuentes de datos
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 flex flex-col min-h-[600px] max-h-[calc(100vh-12rem)] flex-1">
            <Tabs defaultValue="departments" className="w-full flex flex-col flex-1 min-h-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
                <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-6 flex-shrink-0">
                  <TabsTrigger value="departments">Departamentos</TabsTrigger>
                  <TabsTrigger value="subareas">Subáreas</TabsTrigger>
                  <TabsTrigger value="equipments">Equipos</TabsTrigger>
                  <TabsTrigger value="devices">Dispositivos</TabsTrigger>
                  <TabsTrigger value="signals">Señales</TabsTrigger>
                  <TabsTrigger value="source-data">Fuentes de Datos</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="departments"
                className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
              >
                <DepartmentsManager key={refreshKey} onRefresh={handleRefresh} />
              </TabsContent>

              <TabsContent
                value="subareas"
                className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
              >
                <SubareasManager key={refreshKey} onRefresh={handleRefresh} />
              </TabsContent>

              <TabsContent
                value="equipments"
                className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
              >
                <EquipmentManager key={refreshKey} onRefresh={handleRefresh} />
              </TabsContent>

              <TabsContent
                value="devices"
                className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
              >
                <DeviceManager key={refreshKey} onRefresh={handleRefresh} />
              </TabsContent>

              <TabsContent
                value="signals"
                className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
              >
                <SignalManager key={refreshKey} onRefresh={handleRefresh} />
              </TabsContent>

              <TabsContent
                value="source-data"
                className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-y-auto pb-4"
              >
                <SourceDataManager key={refreshKey} onRefresh={handleRefresh} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ConfigProtection>
  );
}


