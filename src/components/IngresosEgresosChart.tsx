"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type FlujoCajaData = {
  id: string;
  dia: number;
  tipo: string;
  categoria: string | null;
  nombre: string | null;
  efectivo: number;
  debito: number;
  credito: number;
  transferencia: number;
  deuda: number;
  egreso: number;
  dr: string | null;
  created_at: string;
};

type ChartProps = {
  data: FlujoCajaData[];
};

type ChartData = {
  dia: number;
  ingresos: number;
  egresos: number;
};

const CATEGORIAS = ["PRO", "GCL", "HON", "GC"];

// Obtener primer día del mes actual
const getPrimerDiaMes = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

// Obtener último día del mes actual
const getUltimoDiaMes = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const ultimoDia = new Date(year, month + 1, 0).getDate();
  const mes = String(month + 1).padStart(2, '0');
  return `${year}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
};

export default function IngresosEgresosChart({ data }: ChartProps) {
  const [fechaInicio, setFechaInicio] = useState<string>(getPrimerDiaMes());
  const [fechaFin, setFechaFin] = useState<string>(getUltimoDiaMes());
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>(CATEGORIAS);

  // Alternar selección de categoría
  const toggleCategoria = (categoria: string) => {
    setCategoriasSeleccionadas(prev => {
      if (prev.includes(categoria)) {
        return prev.filter(c => c !== categoria);
      } else {
        return [...prev, categoria];
      }
    });
  };

  // Seleccionar/deseleccionar todas las categorías
  const toggleTodasCategorias = () => {
    if (categoriasSeleccionadas.length === CATEGORIAS.length) {
      setCategoriasSeleccionadas([]);
    } else {
      setCategoriasSeleccionadas(CATEGORIAS);
    }
  };

  // Procesar y filtrar datos
  const chartData = useMemo(() => {
    let datosFiltrados = [...data];

    // Filtrar por rango de fechas
    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      datosFiltrados = datosFiltrados.filter(reg => {
        const fecha = new Date(reg.created_at);
        return fecha >= inicio;
      });
    }

    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      datosFiltrados = datosFiltrados.filter(reg => {
        const fecha = new Date(reg.created_at);
        return fecha <= fin;
      });
    }

    // Filtrar por categorías
    if (categoriasSeleccionadas.length > 0) {
      datosFiltrados = datosFiltrados.filter(reg => {
        if (!reg.categoria) return true; // Incluir registros sin categoría
        return categoriasSeleccionadas.includes(reg.categoria);
      });
    }

    // Agrupar por día y calcular totales
    const groupedByDay = new Map<number, { ingresos: number; egresos: number }>();

    datosFiltrados.forEach(reg => {
      const existing = groupedByDay.get(reg.dia) || { ingresos: 0, egresos: 0 };
      
      const totalIngresos = (reg.efectivo || 0) + (reg.debito || 0) + (reg.credito || 0) + (reg.transferencia || 0);
      const totalEgresos = reg.egreso || 0;

      groupedByDay.set(reg.dia, {
        ingresos: existing.ingresos + totalIngresos,
        egresos: existing.egresos + totalEgresos,
      });
    });

    // Convertir a array y ordenar por día
    const result: ChartData[] = Array.from(groupedByDay.entries())
      .map(([dia, totales]) => ({
        dia,
        ingresos: totales.ingresos,
        egresos: totales.egresos,
      }))
      .sort((a, b) => a.dia - b.dia);

    return result;
  }, [data, fechaInicio, fechaFin, categoriasSeleccionadas]);

  // Formatear números en el tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">Día {label}</p>
          <p className="text-sm text-green-600 font-medium">
            Ingresos: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-red-600 font-medium">
            Egresos: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm text-gray-700 font-medium mt-1 pt-1 border-t">
            Diferencia: {formatCurrency(payload[0].value - payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcular totales generales
  const totales = useMemo(() => {
    const totalIngresos = chartData.reduce((sum, d) => sum + d.ingresos, 0);
    const totalEgresos = chartData.reduce((sum, d) => sum + d.egresos, 0);
    const diferencia = totalIngresos - totalEgresos;
    
    return { totalIngresos, totalEgresos, diferencia };
  }, [chartData]);

  // Limpiar filtros (volver a valores por defecto)
  const limpiarFiltros = () => {
    setFechaInicio(getPrimerDiaMes());
    setFechaFin(getUltimoDiaMes());
    setCategoriasSeleccionadas(CATEGORIAS);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Análisis de Ingresos vs Egresos
      </h3>

      {/* Filtros */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro de Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filtro de Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botón Limpiar */}
          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Filtro de Categorías */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Categorías
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={categoriasSeleccionadas.length === CATEGORIAS.length}
                onChange={toggleTodasCategorias}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm font-semibold text-gray-900">Todas</span>
            </label>
            {CATEGORIAS.map((cat) => (
              <label key={cat} className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoriasSeleccionadas.includes(cat)}
                  onChange={() => toggleCategoria(cat)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de Totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totales.totalIngresos)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Total Egresos</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totales.totalEgresos)}
          </p>
        </div>
        <div className={`border rounded-lg p-4 ${totales.diferencia >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className={`text-sm font-medium ${totales.diferencia >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            Diferencia
          </p>
          <p className={`text-2xl font-bold ${totales.diferencia >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(totales.diferencia)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No hay datos para mostrar</p>
          <p className="text-sm mt-1">Ajusta los filtros para ver resultados</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="dia" 
              label={{ value: "Día del Mes", position: "insideBottom", offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: "Monto (CLP)", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => 
                new Intl.NumberFormat("es-CL", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="square"
            />
            <Bar 
              dataKey="ingresos" 
              fill="#16A34A" 
              name="Ingresos"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="egresos" 
              fill="#DC2626" 
              name="Egresos"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

