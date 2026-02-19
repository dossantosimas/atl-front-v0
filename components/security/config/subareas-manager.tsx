"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { AssignSubareaSubstancesModal } from "./assign-subarea-substances-modal";

interface SubareasManagerProps {
  onRefresh?: () => void;
}

export function SubareasManager({ onRefresh }: SubareasManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Gestión de Subáreas y Sustancias
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Asigna sustancias químicas a las subáreas de los departamentos
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Building2 className="h-4 w-4 mr-2" />
          Asignar Sustancias a Subáreas
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ¿Cómo funciona?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>Selecciona un departamento de la lista</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>Elige la subárea del departamento seleccionado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Marca las sustancias químicas que pertenecen a esa subárea</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>Guarda los cambios. Las sustancias asignadas aparecerán filtradas en la matriz de compatibilidad</span>
          </li>
        </ul>
      </div>

      <AssignSubareaSubstancesModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}





