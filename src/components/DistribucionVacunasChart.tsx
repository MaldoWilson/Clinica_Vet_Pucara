'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ChartData = {
  name: string
  value: number
}

type ChartProps = {
  data: ChartData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload
    const { percent } = payload[0]
    const percentage = !isNaN(percent) ? `(${(percent * 100).toFixed(0)}%)` : ''
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-700">
          Cantidad: {value} {percentage}
        </p>
      </div>
    )
  }
  return null
}

export default function DistribucionVacunasChart ({ data }: ChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0)
  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Distribución por Tipo de Vacuna
        </h3>
        <div className="text-center py-12 text-gray-500 flex items-center justify-center h-full">
          <div>
            <p className="text-lg font-medium">No hay datos para mostrar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Distribución por Tipo de Vacuna
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={(entry) => `${(entry.percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
