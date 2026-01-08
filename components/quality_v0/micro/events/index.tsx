"use client";

import { useState, useEffect } from "react";
import { MicroTypeSelector } from "./micro-type-selector";
import { Filters } from "./filters";
import { EventsTable } from "./events-table";
import { searchMicroEvents } from "@/lib/services/micro-events.service";
import { getMicroTypes } from "@/lib/services/micro-types.service";
import type { MicroEvent } from "@/lib/types/micro-events";
import type { MicroType } from "@/lib/types/micro-types";
import { useToast } from "@/components/toast";
import { Search, Plus } from "lucide-react";
import { CreateEventModal } from "./create-event-modal";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./stats-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralChart } from "./general-chart";

const MONTHS: Record<string, string> = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

interface QualityV0Props {
  view?: "operator" | "leader" | "audit";
  qualityTypeId?: number; // ID del quality-type para filtrar micro-types
}

export function QualityV0({ view, qualityTypeId }: QualityV0Props = { view: undefined, qualityTypeId: undefined }) {
  const [selectedEventType, setSelectedEventType] = useState<string | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  const [selectedWeek, setSelectedWeek] = useState<string | undefined>();
  const [selectedYear, setSelectedYear] = useState<number | undefined>(new Date().getFullYear());
  const [events, setEvents] = useState<MicroEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [microTypes, setMicroTypes] = useState<MicroType[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    async function loadMicroTypes() {
      try {
        const types = await getMicroTypes();
        // Si hay qualityTypeId, filtrar los micro-types por ese quality-type
        if (qualityTypeId !== undefined) {
          const filteredTypes = types.filter(type => 
            type.qualityType?.id === qualityTypeId || type.qualityTypeId === qualityTypeId
          );
          setMicroTypes(filteredTypes);
        } else {
          setMicroTypes(types);
        }
      } catch (error) {
        console.error("Error loading micro types:", error);
      }
    }
    loadMicroTypes();
  }, [qualityTypeId]);

  const getEventTypeName = () => {
    if (!selectedEventType) return undefined;
    const type = microTypes.find((t) => t.id === selectedEventType);
    return type?.name || undefined;
  };

  // serverTime se usará para comparar con streamstartdate, samplestart y sampleend
  // Por ahora se guarda para uso futuro en la comparación de fechas
  const handleServerTimeUpdate = (time: Date) => {
    setServerTime(time);
  };

  const handleSearch = async (page: number = 1) => {
    if (!selectedEventType || !selectedMonth) {
      showError("Faltan parámetros obligatorios", new Error("Debe seleccionar tipo de evento y mes"));
      return;
    }

    try {
      setLoading(true);
      const monthName = MONTHS[selectedMonth];
      
      // Determinar el valor de selector según la vista
      // En audit no se filtra por selector (muestra todos), en operator y leader se filtra por false
      const selectorValue = view === "audit" ? undefined : false;
      
      const response = await searchMicroEvents({
        typeId: selectedEventType,
        month: monthName,
        week: selectedWeek,
        year: selectedYear,
        page,
        limit: 10,
        selector: selectorValue,
      });

      setEvents(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
      setCurrentPage(response.pagination.page);
      
      if (page === 1) {
        showSuccess(
          "Búsqueda exitosa",
          `Se encontraron ${response.pagination.total} eventos`
        );
      }
    } catch (err) {
      showError("Error al buscar eventos", err);
      setEvents([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(page);
  };

  // Función helper para normalizar sampleresponsable a string
  const normalizeSampleresponsable = (sampleresponsable: any): string | null => {
    if (!sampleresponsable) return null;
    if (typeof sampleresponsable === "string") return sampleresponsable;
    if (typeof sampleresponsable === "object" && sampleresponsable.id) return sampleresponsable.id;
    return null;
  };

  // Función para actualizar un evento específico en el array sin recargar desde el API
  const handleEventUpdate = (updatedEvent: MicroEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === updatedEvent.id) {
          // Normalizar sampleresponsable para asegurar que siempre sea string | null
          return {
            ...updatedEvent,
            sampleresponsable: normalizeSampleresponsable(updatedEvent.sampleresponsable),
          };
        }
        return event;
      })
    );
  };

  const isSearchDisabled = !selectedEventType || !selectedMonth || loading;

  const handleEventCreated = () => {
    // Refrescar la búsqueda después de crear un evento
    if (selectedEventType && selectedMonth) {
      handleSearch(currentPage);
    }
  };

  // Si es operación o liderazgo, mostrar tabs
  if (view === "operator" || view === "leader") {
    return (
      <div className="h-full flex flex-col">
        <Tabs defaultValue="detalle" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalle">Eventos</TabsTrigger>
            <TabsTrigger value="general">Consolidados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detalle" className="space-y-4 mt-4">
            {/* Tarjetas de estadísticas */}
            <StatsCards events={events} serverTime={serverTime} onTimeUpdate={handleServerTimeUpdate} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex flex-row gap-3 items-end">
                <div className="flex-1">
                  <MicroTypeSelector
                    value={selectedEventType}
                    onValueChange={setSelectedEventType}
                    placeholder="Selecciona un tipo de evento"
                    qualityTypeId={qualityTypeId}
                    microTypes={microTypes}
                  />
                </div>
                <Filters
                  eventTypeSelected={selectedEventType}
                  selectedMonth={selectedMonth}
                  selectedWeek={selectedWeek}
                  selectedYear={selectedYear}
                  onMonthChange={setSelectedMonth}
                  onWeekChange={setSelectedWeek}
                  onYearChange={setSelectedYear}
                />
                <button
                  onClick={() => handleSearch(1)}
                  disabled={isSearchDisabled}
                  className="inline-flex items-center justify-center rounded-md bg-primary p-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10"
                  aria-label="Buscar eventos"
                >
                  <Search className="h-4 w-4" />
                </button>
                {view === "leader" && (
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    disabled={!selectedEventType}
                    className="inline-flex items-center justify-center rounded-md bg-primary p-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10"
                    aria-label="Agregar evento"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
              <EventsTable
                events={events}
                loading={loading}
                total={total}
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                serverTime={serverTime}
                view={view}
                onEventUpdate={handleEventUpdate}
                eventTypeName={getEventTypeName()}
                eventTypeId={selectedEventType}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="general" className="mt-4 flex-1 flex flex-col min-h-0 pb-8">
            <GeneralChart serverTime={serverTime} qualityTypeId={qualityTypeId} />
          </TabsContent>
        </Tabs>

        {view === "leader" && (
          <CreateEventModal
            open={createModalOpen}
            onOpenChange={setCreateModalOpen}
            typeId={selectedEventType}
            onEventCreated={handleEventCreated}
          />
        )}
      </div>
    );
  }

  // Para audit, mantener el comportamiento anterior sin tabs
  return (
    <div className="space-y-4">
      {/* Tarjetas de estadísticas */}
      <StatsCards events={events} serverTime={serverTime} onTimeUpdate={handleServerTimeUpdate} />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-row gap-3 items-end">
          <div className="flex-1">
            <MicroTypeSelector
              value={selectedEventType}
              onValueChange={setSelectedEventType}
              placeholder="Selecciona un tipo de evento"
              qualityTypeId={qualityTypeId}
              externalMicroTypes={microTypes}
            />
          </div>
          <Filters
            eventTypeSelected={selectedEventType}
            selectedMonth={selectedMonth}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onWeekChange={setSelectedWeek}
            onYearChange={setSelectedYear}
          />
          <button
            onClick={() => handleSearch(1)}
            disabled={isSearchDisabled}
            className="inline-flex items-center justify-center rounded-md bg-primary p-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10"
            aria-label="Buscar eventos"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
        <EventsTable
          events={events}
          loading={loading}
          total={total}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          serverTime={serverTime}
          view={view}
          onEventUpdate={handleEventUpdate}
          eventTypeName={getEventTypeName()}
          eventTypeId={selectedEventType}
        />
      </div>
    </div>
  );
}

