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

export default function RendimientoVetsChart({ data, veterinarios }: ChartProps) {
  const chartData = useMemo(() => {
    return data.sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2">
          <p className="font-semibold text-gray-900 text-xs mb-1">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }} className="text-xs font-medium">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Rendimiento Mensual
      </h3>

      {chartData.length === 0
        ? (
          <div className="text-center py-12 text-gray-500 flex items-center justify-center h-full">
            <div>
              <p className="text-sm font-medium">No hay datos</p>
            </div>
          </div>
        )
        : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    // Value is "YYYY-MM", we want short month name
                    try {
                      const [year, month] = value.split('-')
                      const date = new Date(parseInt(year), parseInt(month) - 1)
                      return date.toLocaleString('es-CL', { month: 'short' })
                    } catch (e) {
                      return value
                    }
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  iconType="circle"
                  verticalAlign="bottom"
                  align="center"
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
          </div>
        )}
    </div>
  )
}
