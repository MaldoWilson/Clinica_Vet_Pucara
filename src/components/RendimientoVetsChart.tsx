'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Define a type for the data coming from the API
type VaccineData = {
  name: string // Month e.g., "2025-11"
  [key: string]: number | string // Vet names as keys, count as value
}

type ChartProps = {
  data: VaccineData[]
  veterinarios: string[] // List of all vet names to create bars for
}

// A simple color palette for the chart bars
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'
]

export default function RendimientoVetsChart ({ data, veterinarios }: ChartProps) {
  const chartData = useMemo(() => {
    return data.sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">Mes: {label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }} className="text-sm font-medium">
              {p.name}: {p.value} vacunas
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Rendimiento Mensual por Veterinario
      </h3>

      {chartData.length === 0
        ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No hay datos de vacunas para mostrar</p>
          <p className="text-sm mt-1">Cuando se registren vacunas, aparecerán aquí.</p>
        </div>
          )
        : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              label={{ value: 'Mes', position: 'insideBottom', offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Nº de Vacunas', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            {veterinarios.map((vet, index) => (
              <Bar
                key={vet}
                dataKey={vet}
                fill={COLORS[index % COLORS.length]}
                name={vet}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
          )}
    </div>
  )
}
