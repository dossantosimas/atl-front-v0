"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";
import { RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { getMicroEventsByDate } from "@/lib/services/micro-events.service";

interface ChartData {
  tipo: string;
  proximos: number;
  tomarMuestras: number;
}

interface GeneralChartProps {
  serverTime: Date | null;
  qualityTypeId?: number; // Opcional: ID del quality-type para filtrar
}

export function GeneralChart({ serverTime, qualityTypeId }: GeneralChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTodayEvents = useCallback(async () => {
    if (!serverTime) {
      return;
    }

    try {
      setLoading(true);
      setRefreshing(true);
      // Formatear fecha como YYYY-MM-DD
      const year = serverTime.getFullYear();
      const month = String(serverTime.getMonth() + 1).padStart(2, "0");
      const day = String(serverTime.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const data = await getMicroEventsByDate(dateString, qualityTypeId);

      // Transformar los datos al formato del gráfico
      const transformedData: ChartData[] = data.map((item) => ({
        tipo: item.typeName,
        proximos: item.proximo,
        tomarMuestras: item.tomarMuestra,
      }));

      setChartData(transformedData);
    } catch (error) {
      console.error("Error loading today events:", error);
      setChartData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serverTime, qualityTypeId]);

  useEffect(() => {
    loadTodayEvents();
  }, [loadTodayEvents]);

  // Calcular totales
  const totales = useMemo(() => {
    const totalProximos = chartData.reduce((sum, item) => sum + item.proximos, 0);
    const totalTomarMuestras = chartData.reduce((sum, item) => sum + item.tomarMuestras, 0);
    return {
      proximos: totalProximos,
      tomarMuestras: totalTomarMuestras,
    };
  }, [chartData]);

  const chartConfig = {
    proximos: {
      label: "Próximos",
      color: "#091EB7", // Azul coster
    },
    tomarMuestras: {
      label: "Tomar Muestras",
      color: "#EBA600", // Amarillo canario
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <CardHeader>
          <CardTitle>Vista General del Día Actual</CardTitle>
          <CardDescription>Cargando eventos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <CardHeader>
          <CardTitle>Vista General del Día Actual</CardTitle>
          <CardDescription>No hay eventos para el día actual</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col flex-1 min-h-0 p-4 sm:p-6">
      <Card className="bg-transparent border-0 shadow-none flex-1 flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Vista General del Día Actual</CardTitle>
              <CardDescription>
                Eventos agrupados por tipo - {serverTime ? new Date(serverTime).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "Cargando fecha..."}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTodayEvents}
              disabled={loading || refreshing}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Totalizadores */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#091EB7]/10 dark:bg-[#091EB7]/20 border border-[#091EB7]/20">
              <div className="w-3 h-3 rounded-full bg-[#091EB7]"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Próximos: <span className="font-bold text-[#091EB7]">{totales.proximos}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EBA600]/10 dark:bg-[#EBA600]/20 border border-[#EBA600]/20">
              <div className="w-3 h-3 rounded-full bg-[#EBA600]"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tomar Muestras: <span className="font-bold text-[#EBA600]">{totales.tomarMuestras}</span>
              </span>
            </div>
          </div>
          
          <ChartContainer config={chartConfig} className="flex-1 w-full mt-8 min-h-0">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="tipo"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 14, fontWeight: 'bold' }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="proximos" fill="#091EB7" radius={4}>
                <LabelList 
                  dataKey="proximos" 
                  position="top" 
                  fill="#091EB7"
                  fontSize={14}
                  fontWeight="bold"
                />
              </Bar>
              <Bar dataKey="tomarMuestras" fill="#EBA600" radius={4}>
                <LabelList 
                  dataKey="tomarMuestras" 
                  position="top" 
                  fill="#EBA600"
                  fontSize={14}
                  fontWeight="bold"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

