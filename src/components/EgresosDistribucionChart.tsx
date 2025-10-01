"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
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
  tipo: string;
  monto: number;
  porcentaje: number;
};

const CATEGORIAS = ["GCL", "GC", "HON"];

// Paleta de colores para los tipos de gasto
const COLORES = [
  "#DC2626", // Rojo
  "#EA580C", // Naranja
  "#D97706", // Amarillo oscuro
  "#65A30D", // Verde lima
  "#059669", // Verde esmeralda
  "#0891B2", // Cyan
  "#0284C7", // Azul
  "#4F46E5", // Índigo
  "#7C3AED", // Violeta
  "#C026D3", // Fucsia
  "#DB2777", // Rosa
  "#E11D48", // Rosa rojo
];

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

export default function EgresosDistribucionChart({ data }: ChartProps) {
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

    // Filtrar solo registros con egresos > 0
    datosFiltrados = datosFiltrados.filter(reg => reg.egreso && reg.egreso > 0);

    // Agrupar por tipo y calcular totales
    const groupedByTipo = new Map<string, number>();

    datosFiltrados.forEach(reg => {
      const tipo = reg.tipo || "Sin Tipo";
      const existing = groupedByTipo.get(tipo) || 0;
      groupedByTipo.set(tipo, existing + reg.egreso);
    });

    // Calcular total de egresos
    const totalEgresos = Array.from(groupedByTipo.values()).reduce((sum, val) => sum + val, 0);

    // Convertir a array con porcentajes
    const result: ChartData[] = Array.from(groupedByTipo.entries())
      .map(([tipo, monto]) => ({
        tipo,
        monto,
        porcentaje: totalEgresos > 0 ? (monto / totalEgresos) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto); // Ordenar por monto descendente

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
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-1">{payload[0].name}</p>
          <p className="text-sm text-gray-700">
            Monto: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].payload.porcentaje.toFixed(1)}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  // Renderizar etiquetas personalizadas
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // No mostrar etiquetas para porcentajes menores a 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Calcular total de egresos
  const totalEgresos = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.monto, 0);
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
        Distribución de Egresos por Tipo
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
            Filtrar por Categoría de Gasto
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

      {/* Resumen de Total */}
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
          <p className="text-sm text-red-700 font-medium">Total de Egresos</p>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(totalEgresos)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No hay egresos para mostrar</p>
          <p className="text-sm mt-1">Ajusta los filtros para ver resultados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Gráfico de Donut */}
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={140}
                  innerRadius={80}
                  fill="#8884d8"
                  dataKey="monto"
                  nameKey="tipo"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda personalizada con detalles */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {chartData.map((item, index) => (
              <div
                key={item.tipo}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORES[index % COLORES.length] }}
                  />
                  <span className="font-medium text-gray-900 text-sm">{item.tipo}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.monto)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.porcentaje.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

