"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  profesional: string;
  ingresos: number;
  ingresosConDeuda: number;
};

// Paleta de colores para los profesionales
const COLORES = [
  "#4F46E5", // Índigo
  "#0891B2", // Cyan
  "#059669", // Verde
  "#D97706", // Amarillo oscuro
  "#DC2626", // Rojo
  "#7C3AED", // Violeta
  "#DB2777", // Rosa
  "#0284C7", // Azul
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

export default function ProfesionalesRendimientoChart({ data }: ChartProps) {
  const [fechaInicio, setFechaInicio] = useState<string>(getPrimerDiaMes());
  const [fechaFin, setFechaFin] = useState<string>(getUltimoDiaMes());
  const [incluirDeuda, setIncluirDeuda] = useState<boolean>(false);

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

    // Filtrar solo registros con dr (profesional) no nulo
    datosFiltrados = datosFiltrados.filter(reg => reg.dr && reg.dr.trim() !== "");

    // Agrupar por profesional y calcular totales
    const groupedByProfesional = new Map<string, { ingresos: number; deuda: number }>();

    datosFiltrados.forEach(reg => {
      const profesional = reg.dr!.trim();
      const existing = groupedByProfesional.get(profesional) || { ingresos: 0, deuda: 0 };
      
      const totalIngresos = (reg.efectivo || 0) + (reg.debito || 0) + (reg.credito || 0) + (reg.transferencia || 0);
      const totalDeuda = reg.deuda || 0;

      groupedByProfesional.set(profesional, {
        ingresos: existing.ingresos + totalIngresos,
        deuda: existing.deuda + totalDeuda,
      });
    });

    // Convertir a array y ordenar por ingresos descendente
    const result: ChartData[] = Array.from(groupedByProfesional.entries())
      .map(([profesional, totales]) => ({
        profesional,
        ingresos: totales.ingresos,
        ingresosConDeuda: totales.ingresos + totales.deuda,
      }))
      .sort((a, b) => {
        const valorA = incluirDeuda ? a.ingresosConDeuda : a.ingresos;
        const valorB = incluirDeuda ? b.ingresosConDeuda : b.ingresos;
        return valorB - valorA;
      });

    return result;
  }, [data, fechaInicio, fechaFin, incluirDeuda]);

  // Formatear números
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
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">{data.profesional}</p>
          {!incluirDeuda ? (
            <p className="text-sm text-gray-700">
              Ingresos: <span className="font-bold text-indigo-600">{formatCurrency(data.ingresos)}</span>
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Ingresos: <span className="font-bold">{formatCurrency(data.ingresos)}</span>
              </p>
              <p className="text-sm text-gray-700">
                Deuda: <span className="font-bold text-orange-600">{formatCurrency(data.ingresosConDeuda - data.ingresos)}</span>
              </p>
              <p className="text-sm text-gray-900 font-bold pt-1 mt-1 border-t">
                Total: <span className="text-indigo-600">{formatCurrency(data.ingresosConDeuda)}</span>
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Calcular totales generales
  const totales = useMemo(() => {
    const totalIngresos = chartData.reduce((sum, d) => sum + d.ingresos, 0);
    const totalDeuda = chartData.reduce((sum, d) => sum + (d.ingresosConDeuda - d.ingresos), 0);
    const totalGeneral = incluirDeuda ? totalIngresos + totalDeuda : totalIngresos;
    
    return { totalIngresos, totalDeuda, totalGeneral };
  }, [chartData, incluirDeuda]);

  // Limpiar filtros (volver a valores por defecto)
  const limpiarFiltros = () => {
    setFechaInicio(getPrimerDiaMes());
    setFechaFin(getUltimoDiaMes());
    setIncluirDeuda(false);
  };

  // Obtener el valor a mostrar según el checkbox
  const getValorDisplay = (item: ChartData) => {
    return incluirDeuda ? item.ingresosConDeuda : item.ingresos;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Rendimiento por Profesional
      </h3>

      {/* Filtros */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Checkbox Incluir Deuda */}
          <div className="flex items-end">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={incluirDeuda}
                onChange={(e) => setIncluirDeuda(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Incluir Deuda
              </span>
            </label>
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
      </div>

      {/* Resumen de Totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-700 font-medium">Total Ingresos</p>
          <p className="text-2xl font-bold text-indigo-600">
            {formatCurrency(totales.totalIngresos)}
          </p>
        </div>
        {incluirDeuda && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700 font-medium">Total Deuda</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(totales.totalDeuda)}
            </p>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">
            {incluirDeuda ? "Total General (Facturado)" : "Total General"}
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(totales.totalGeneral)}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No hay datos para mostrar</p>
          <p className="text-sm mt-1">Ajusta los filtros o verifica que haya registros con profesionales asignados</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 60)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number"
              label={{ value: incluirDeuda ? "Monto Total (CLP)" : "Ingresos (CLP)", position: "insideBottom", offset: -5 }}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => 
                new Intl.NumberFormat("es-CL", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <YAxis 
              type="category"
              dataKey="profesional"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar 
              dataKey={incluirDeuda ? "ingresosConDeuda" : "ingresos"}
              fill="#4F46E5"
              radius={[0, 4, 4, 0]}
              label={{ 
                position: 'right', 
                formatter: (value: any) => formatCurrency(Number(value)),
                fontSize: 11,
                fill: '#374151'
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Tabla de Detalle */}
      {chartData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Detalle por Profesional</h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesional
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                {incluirDeuda && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deuda
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {incluirDeuda ? "Total (Facturado)" : "Total"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.map((item, index) => {
                const porcentaje = (getValorDisplay(item) / totales.totalGeneral) * 100;
                return (
                  <tr key={item.profesional} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORES[index % COLORES.length] }}
                        />
                        {item.profesional}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(item.ingresos)}
                    </td>
                    {incluirDeuda && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-orange-600">
                        {formatCurrency(item.ingresosConDeuda - item.ingresos)}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-indigo-600">
                      {formatCurrency(getValorDisplay(item))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                      {porcentaje.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

