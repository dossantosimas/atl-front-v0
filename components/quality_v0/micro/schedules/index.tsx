"use client";

import { useState, useEffect, useMemo } from "react";
import type { MicroSchedule } from "@/lib/types/micro-schedules";
import { getMicroSchedules } from "@/lib/services/micro-schedules.service";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, Edit, Trash2, Loader2, Search, X } from "lucide-react";
import { useToast } from "@/components/toast";
import { CreateScheduleModal } from "./create-schedule-modal";
import { EditScheduleModal } from "./edit-schedule-modal";
import { DeleteScheduleModal } from "./delete-schedule-modal";
import { ViewScheduleModal } from "./view-schedule-modal";

export function SchedulesTable() {
  const [schedules, setSchedules] = useState<MicroSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MicroSchedule | null>(null);
  const { showError } = useToast();

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getMicroSchedules();
      setSchedules(data);
    } catch (error) {
      showError("Error al cargar schedules", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (schedule: MicroSchedule) => {
    setSelectedSchedule(schedule);
    setEditModalOpen(true);
  };

  const handleDelete = (schedule: MicroSchedule) => {
    setSelectedSchedule(schedule);
    setDeleteModalOpen(true);
  };

  const handleView = (schedule: MicroSchedule) => {
    setSelectedSchedule(schedule);
    setViewModalOpen(true);
  };

  const handleModalClose = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setViewModalOpen(false);
    setSelectedSchedule(null);
  };

  // Filtrar schedules por nombre
  const filteredSchedules = useMemo(() => {
    if (!searchFilter.trim()) {
      return schedules;
    }
    const filterLower = searchFilter.toLowerCase().trim();
    return schedules.filter((schedule) =>
      schedule.name.toLowerCase().includes(filterLower)
    );
  }, [schedules, searchFilter]);

  const columns: ColumnDef<MicroSchedule>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "eventType.name",
      header: "Tipo de Evento",
      cell: ({ row }) => {
        const eventType = row.original.eventType;
        return <div>{eventType?.name || "-"}</div>;
      },
    },
    {
      accessorKey: "frequency",
      header: "Frecuencia",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("frequency")}</div>
      ),
    },
    {
      accessorKey: "elements",
      header: "Elementos",
      cell: ({ row }) => {
        const elements = row.original.elements || [];
        if (elements.length === 0) return <div className="text-muted-foreground">-</div>;
        return (
          <div className="flex flex-wrap gap-1">
            {elements.slice(0, 2).map((el) => (
              <Badge key={el.id} variant="outline" className="text-xs">
                {el.name}
              </Badge>
            ))}
            {elements.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{elements.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
          >
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "runCount",
      header: "Ejecuciones",
      cell: ({ row }) => <div>{row.getValue("runCount")}</div>,
    },
    {
      accessorKey: "lastRun",
      header: "Última Ejecución",
      cell: ({ row }) => {
        const lastRun = row.getValue("lastRun") as string | null;
        return <div className="text-sm">{formatDate(lastRun)}</div>;
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const schedule = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(schedule)}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(schedule)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(schedule)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h2 className="text-lg font-semibold">Schedules Programados</h2>
          <Button onClick={handleCreate} size="sm" className="h-8">
            <Plus className="mr-2 h-3.5 w-3.5" />
            Crear Schedule
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filtrar por nombre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-8 h-8 text-sm"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {searchFilter && (
            <span className="text-xs text-muted-foreground">
              {filteredSchedules.length} de {schedules.length} schedules
            </span>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <DataTable 
            columns={columns} 
            data={filteredSchedules} 
            loading={loading}
            searchFilter={searchFilter}
          />
        </div>
      </div>

      <CreateScheduleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onScheduleCreated={loadSchedules}
      />

      <EditScheduleModal
        schedule={selectedSchedule}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onScheduleUpdated={loadSchedules}
      />

      <DeleteScheduleModal
        schedule={selectedSchedule}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onScheduleDeleted={loadSchedules}
      />

      <ViewScheduleModal
        schedule={selectedSchedule}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
    </>
  );
}

